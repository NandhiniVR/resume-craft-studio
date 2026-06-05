import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import type { UserProfile } from '@/store/authStore';
import { useResumeStore } from '@/store/resumeStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { toast } from '@/components/ui/Toast';
import { uploadFileGetUrl } from '@/services/cloudinary';
import { extractTextFromPdf } from '@/services/pdfParser';
import { extractResumeData } from '@/services/ai/resumeExtractor';
import type { ExtractedResume } from '@/services/ai/resumeExtractor';
import { Upload, Plus, X, ArrowRight, Check, Loader2 } from 'lucide-react';

export const Onboarding: React.FC = () => {
  const { user, profile, updateProfile, setOnboardingStep } = useAuthStore();
  console.log('PROFILE FROM STORE =', profile);
  const { createResume } = useResumeStore();
  const navigate = useNavigate();

  const [step, setStep] = useState<'profile' | 'import-option' | 'extract' | 'review'>('profile');

  
useEffect(() => {
  console.log('ONBOARDING MOUNTED');
}, []);

useEffect(() => {
  console.log('STEP IS NOW', step);
}, [step]);

useEffect(() => {
  console.log('PROFILE UPDATED =', profile);
}, [profile]);

useEffect(() => {
  console.log('RENDERED STEP =', step);
});

console.log('CURRENT STEP =', step);
console.log('CURRENT USER =', user?.uid);
console.log('CURRENT ONBOARDING =', profile?.fullName);
useEffect(() => {
  console.log('ONBOARDING MOUNT');
  return () => {
    console.log('ONBOARDING UNMOUNT');
  };
}, []);


  
  // Profile Fields
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [linkedIn, setLinkedIn] = useState(profile?.linkedIn || '');
  const [gitHub, setGitHub] = useState(profile?.gitHub || '');
  const [portfolio, setPortfolio] = useState(profile?.portfolio || '');
  const [professionalTitle, setProfessionalTitle] = useState(profile?.professionalTitle || '');
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(profile?.yearsOfExperience || 0);
  const [skills, setSkills] = useState<string[]>(profile?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(profile?.profilePhoto || '');
  
  // States for Extraction
  const [photoLoading, setPhotoLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedResume | null>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    // File validation: Profile image max 5MB (jpg/png/webp)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG and WEBP images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must not exceed 5 MB.');
      return;
    }

    setPhotoLoading(true);
    try {
      const url = await uploadFileGetUrl(file, user.uid, 'profile');
      setProfilePhoto(url);
      toast.success('Profile photo uploaded!');
    } catch (err) {
      toast.error('Failed to upload photo.');
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

const handleSaveProfileStep = async (e: React.FormEvent) => {
e.preventDefault();

  console.log('DIRECT STEP TEST');

  setStep('import-option');

  if (!fullName || !professionalTitle) {
    toast.error('Name and Title are required.');
    return;
  }

  try {
    console.log('1 - before update');

    await updateProfile({
      fullName,
      phone,
      location,
      linkedIn,
      gitHub,
      portfolio,
      professionalTitle,
      yearsOfExperience,
      skills,
      profilePhoto,
    });

    console.log('2 - after update');

    toast.success('Profile details saved!');

console.log('3 - before step change');

console.log('STEP BEFORE:', step);

console.log('Setting import-option');

setTimeout(() => {
  console.log('Actually changing step');
  setStep('import-option');
}, 100);
setTimeout(() => {
  console.log('STEP AFTER 500ms:', step);
}, 500);

console.log('4 - after step change');
  } catch (err) {
    console.error('SAVE ERROR', err);
  }
};

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // File validation: Resumes max 10MB PDF
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Resume size must not exceed 10 MB.');
      return;
    }

    setStep('extract');

try {
  console.log('PDF selected:', file.name);

  const rawText = await extractTextFromPdf(file);

  console.log('PDF TEXT LENGTH:', rawText?.length);
  console.log('PDF SAMPLE:', rawText?.slice(0, 300));

  const parsed = await extractResumeData(rawText);

  console.log('PARSED DATA:', parsed);

  setExtractedData(parsed);
  setStep('review');
} catch (err: any) {
  console.error('PDF IMPORT ERROR:', err);

  toast.error('Failed to parse resume text. Moving to review.');
  setStep('import-option');
}
  };

  const handleAcceptExtraction = async () => {
    if (!extractedData || !user) return;

    try {
      // Merge extracted fields into user profile
      const updatedInfo: Partial<UserProfile> = {
        fullName: extractedData.personalInfo.fullName || fullName,
        phone: extractedData.personalInfo.phone || phone,
        location: extractedData.personalInfo.location || location,
        linkedIn: extractedData.personalInfo.linkedIn || linkedIn,
        gitHub: extractedData.personalInfo.gitHub || gitHub,
        portfolio: extractedData.personalInfo.portfolio || portfolio,
        professionalTitle: extractedData.personalInfo.professionalTitle || professionalTitle,
        skills: Array.from(new Set([...skills, ...extractedData.skills])),
      };

      await updateProfile(updatedInfo);

      // Precreate the resume document in Firestore
      await createResume(user.uid, 'My Imported Resume', 'professional', extractedData);
      
      toast.success('Successfully imported and created your first resume!');
      handleFinishOnboarding();
    } catch (err: any) {
      toast.error(err.message || 'Failed to apply parsed details.');
    }
  };

  const handleFinishOnboarding = async () => {
  try {
    console.log('STARTING FINISH ONBOARDING');

    await setOnboardingStep('done', true);

    console.log('SET ONBOARDING FINISHED');

    navigate('/dashboard');
  } catch (err: any) {
    console.error('FINISH ERROR', err);
    toast.error('Error completing onboarding.');
  }
};

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] opacity-30" />

      <div className="w-full max-w-2xl">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-6 px-2">
          <span className="font-outfit text-xs font-bold uppercase tracking-widest text-slate-400">
            Setup Wizard
          </span>
          <div className="flex gap-2">
            <span className={`h-2 w-10 rounded-full transition-all duration-300 ${step === 'profile' ? 'bg-indigo-650' : 'bg-slate-200'}`} />
            <span className={`h-2 w-10 rounded-full transition-all duration-300 ${['import-option', 'extract'].includes(step) ? 'bg-indigo-650' : 'bg-slate-200'}`} />
            <span className={`h-2 w-10 rounded-full transition-all duration-300 ${step === 'review' ? 'bg-indigo-650' : 'bg-slate-200'}`} />
          </div>
        </div>

        {step === 'profile' && (
          <Card className="shadow-lg border-slate-200/60 dark:border-slate-800/40 bg-white/90 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Let's complete your profile</CardTitle>
              <CardDescription>We will use these details to prefill your resumes and optimize matches.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfileStep} className="space-y-4">
                {/* Profile Photo */}
                <div className="flex flex-col items-center gap-2 mb-4">
                  <div className="relative h-20 w-20 rounded-full border border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50 group">
                    {profilePhoto ? (
                      <img src={profilePhoto} alt="Preview" className="h-full w-full object-cover" />
                    ) : photoLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                    ) : (
                      <Upload className="h-5 w-5 text-slate-400 group-hover:text-slate-650" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">Upload Profile Picture (Max 5MB)</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-semibold text-slate-700">Full Name *</label>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-semibold text-slate-700">Professional Title *</label>
                    <Input
                      placeholder="e.g. Lead React Architect"
                      value={professionalTitle}
                      onChange={(e) => setProfessionalTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-semibold text-slate-700">Phone</label>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-semibold text-slate-700">Location</label>
                    <Input
                      placeholder="e.g. San Francisco, CA"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-semibold text-slate-700">Years of Experience</label>
                    <Input
                      type="number"
                      min={0}
                      value={yearsOfExperience}
                      onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-semibold text-slate-700">LinkedIn URL</label>
                    <Input
                      placeholder="linkedin.com/in/username"
                      value={linkedIn}
                      onChange={(e) => setLinkedIn(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-semibold text-slate-700">GitHub Profile</label>
                    <Input
                      placeholder="github.com/username"
                      value={gitHub}
                      onChange={(e) => setGitHub(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-semibold text-slate-700">Portfolio Website</label>
                    <Input
                      placeholder="myportfolio.dev"
                      value={portfolio}
                      onChange={(e) => setPortfolio(e.target.value)}
                    />
                  </div>
                </div>

                {/* Skills Section */}
                <div className="space-y-2 text-left pt-2">
                  <label className="text-xs font-semibold text-slate-700">Key Skills</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill, e.g. React"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddSkill} variant="outline" className="h-10">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 text-xs px-2.5 py-0.5 rounded-full text-slate-700"
                      >
                        {skill}
                        <button type="button" onClick={() => handleRemoveSkill(skill)}>
                          <X className="h-3 w-3 text-slate-400 hover:text-slate-600" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <Button type="submit" className="w-full flex items-center justify-center gap-2">
                    Save and Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 'import-option' && (
          <Card className="shadow-lg text-center border-slate-200/60 dark:border-slate-800/40 bg-white/90 backdrop-blur-md p-6">
            <CardHeader>
              <CardTitle>Would you like to import an existing resume?</CardTitle>
              <CardDescription>
                We can automatically extract details from your current PDF resume using AI to build your profile suggestions and first resume draft.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                {/* Upload Button */}
                <div className="relative w-full sm:w-auto">
                  <Button className="w-full sm:w-auto flex items-center gap-2 px-6">
                    <Upload className="h-4 w-4" />
                    Upload PDF Resume
                  </Button>
                  <input
  type="file"
  accept=".pdf"
  onChange={(e) => {
    console.log('FILE INPUT CHANGED');
    handlePdfUpload(e);
  }}
  className="absolute inset-0 opacity-0 cursor-pointer"
/>
                </div>
                
                <Button variant="ghost" onClick={handleFinishOnboarding} className="w-full sm:w-auto text-slate-500 font-semibold">
                  Skip, I'll start manually
                </Button>
              </div>
              <p className="text-[10px] text-slate-450 italic">Supports standard PDF files up to 10 MB.</p>
            </CardContent>
          </Card>
        )}

        {step === 'extract' && (
          <Card className="shadow-lg border-slate-200/60 bg-white/90 backdrop-blur-md p-12 text-center flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-650" />
            <h3 className="font-outfit font-bold text-slate-800">Processing Document...</h3>
            <p className="text-xs text-slate-500">
              Extracting text using client-side parser first, then sending blocks to Gemini for structured JSON mapping. Please wait.
            </p>
          </Card>
        )}

        {step === 'review' && extractedData && (
          <Card className="shadow-lg border-slate-200/60 bg-white/90 backdrop-blur-md max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Review Extracted Resume</CardTitle>
              <CardDescription>
                Confirm suggestions extracted from your resume. Accepting will prefill missing profile fields and create your first resume draft.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-left max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Extracted Details */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-indigo-650 uppercase tracking-wider border-b pb-1">
                    Suggested Details
                  </h4>
                  <div className="space-y-2 text-xs">
                    <p><strong>Name:</strong> {extractedData.personalInfo.fullName}</p>
                    <p><strong>Title:</strong> {extractedData.personalInfo.professionalTitle}</p>
                    <p><strong>Phone:</strong> {extractedData.personalInfo.phone}</p>
                    <p><strong>Location:</strong> {extractedData.personalInfo.location}</p>
                    <p><strong>Skills:</strong> {extractedData.skills.join(', ')}</p>
                  </div>
                </div>

                {/* Confirm experience blocks parsed */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-indigo-650 uppercase tracking-wider border-b pb-1">
                    Experience Rounds Detected
                  </h4>
                  <div className="space-y-3">
                    {extractedData.experience.slice(0, 2).map((exp, i) => (
                      <div key={i} className="text-xs p-2 bg-slate-50 border rounded-lg">
                        <p className="font-bold text-slate-800">{exp.position}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{exp.company} | {exp.startDate} - {exp.endDate}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t">
                <Button onClick={handleAcceptExtraction} className="flex-1 flex items-center justify-center gap-2">
                  <Check className="h-4 w-4" />
                  Accept & Import Resume
                </Button>
                <Button variant="ghost" onClick={handleFinishOnboarding} className="text-slate-500">
                  Discard Suggestions
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
export default Onboarding;
