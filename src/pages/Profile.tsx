import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { uploadFileGetUrl } from '@/services/cloudinary';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Loader2, Save, Upload, X, Mail, MapPin, Linkedin, Github, Globe, Briefcase } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, profile, updateProfile, loading } = useAuthStore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    location: '',
    linkedIn: '',
    gitHub: '',
    portfolio: '',
    professionalTitle: '',
    yearsOfExperience: 0,
    skills: [] as string[],
    profilePhoto: '',
  });

  const [newSkill, setNewSkill] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Sync with auth store profile
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        location: profile.location || '',
        linkedIn: profile.linkedIn || '',
        gitHub: profile.gitHub || '',
        portfolio: profile.portfolio || '',
        professionalTitle: profile.professionalTitle || '',
        yearsOfExperience: profile.yearsOfExperience || 0,
        skills: profile.skills || [],
        profilePhoto: profile.profilePhoto || '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'yearsOfExperience' ? Number(value) : value,
    }));
  };

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      e.preventDefault();
      if (!formData.skills.includes(newSkill.trim())) {
        setFormData((prev) => ({
          ...prev,
          skills: [...prev.skills, newSkill.trim()],
        }));
      }
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingPhoto(true);
    try {
      const photoUrl = await uploadFileGetUrl(file, user.uid, 'profile');
      setFormData((prev) => ({
        ...prev,
        profilePhoto: photoUrl,
      }));
      toast({
        title: 'Success',
        description: 'Profile photo uploaded successfully. Save changes to persist.',
        variant: 'default',
      });
    } catch (err: any) {
      toast({
        title: 'Upload Failed',
        description: err.message || 'Failed to upload profile photo.',
        variant: 'destructive',
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      toast({
        title: 'Profile Updated',
        description: 'Your professional profile details have been saved successfully.',
        variant: 'default',
      });
    } catch (err: any) {
      toast({
        title: 'Update Failed',
        description: err.message || 'Something went wrong.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight font-outfit text-slate-900 dark:text-white">
          Professional Profile
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your personal branding info, social handles, and primary developer skills.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: Avatar & Primary Details */}
        <Card className="lg:col-span-1 border border-slate-200/60 shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
            <div className="relative group">
              <Avatar
                src={formData.profilePhoto}
                fallback={formData.fullName || 'User'}
                className="h-28 w-28 ring-4 ring-indigo-50 dark:ring-indigo-950/50 shadow-md transition-all duration-300"
              />
              <label className="absolute bottom-0 right-0 p-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-full cursor-pointer shadow-md transition-colors duration-200 group-hover:scale-105">
                {uploadingPhoto ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploadingPhoto || loading}
                />
              </label>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-outfit">
                {formData.fullName || 'New Candidate'}
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {formData.professionalTitle || 'Software Engineer'}
              </p>
            </div>

            <div className="w-full border-t border-slate-100 dark:border-slate-800/60 my-2 pt-4 space-y-3 text-left">
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <Mail className="h-4 w-4 text-slate-400" />
                <span className="truncate">{user?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span>{formData.location || 'Location not specified'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <Briefcase className="h-4 w-4 text-slate-400" />
                <span>{formData.yearsOfExperience} years of experience</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Content: Profile Fields form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-slate-200/60 shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="border-b border-slate-150/40 pb-4">
              <CardTitle className="font-outfit text-md font-semibold text-slate-800 dark:text-white">
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-450">
                    Full Name
                  </label>
                  <Input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-450">
                    Phone Number
                  </label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +1 555 123 4567"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-450">
                    Location
                  </label>
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. San Francisco, CA"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-450">
                    Professional Title
                  </label>
                  <Input
                    name="professionalTitle"
                    value={formData.professionalTitle}
                    onChange={handleChange}
                    placeholder="e.g. Senior Frontend Developer"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-450">
                    Years of Experience
                  </label>
                  <Input
                    type="number"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                    placeholder="e.g. 5"
                    disabled={loading}
                    min="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/60 shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="border-b border-slate-150/40 pb-4">
              <CardTitle className="font-outfit text-md font-semibold text-slate-800 dark:text-white">
                Social Profiles & Portfolio
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-450 flex items-center gap-1.5">
                    <Linkedin className="h-3.5 w-3.5 text-indigo-600" /> LinkedIn URL
                  </label>
                  <Input
                    name="linkedIn"
                    value={formData.linkedIn}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/username"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-450 flex items-center gap-1.5">
                    <Github className="h-3.5 w-3.5 text-slate-950 dark:text-white" /> GitHub URL
                  </label>
                  <Input
                    name="gitHub"
                    value={formData.gitHub}
                    onChange={handleChange}
                    placeholder="https://github.com/username"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-450 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-emerald-600" /> Personal Website / Portfolio
                  </label>
                  <Input
                    name="portfolio"
                    value={formData.portfolio}
                    onChange={handleChange}
                    placeholder="https://yourportfolio.com"
                    disabled={loading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/60 shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="border-b border-slate-150/40 pb-4">
              <CardTitle className="font-outfit text-md font-semibold text-slate-800 dark:text-white">
                Technical Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-450">
                  Skills (Type and press Enter to add)
                </label>
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={handleAddSkill}
                  placeholder="e.g. React, Typescript, Rust, Docker"
                  disabled={loading}
                />
              </div>

              {formData.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-2">
                  {formData.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="px-2.5 py-1 text-xs font-medium flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-850 dark:bg-slate-800 dark:text-slate-200 transition-colors"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No skills added yet.</p>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-750 text-white font-semibold text-sm px-6 py-2 rounded-md shadow-sm transition-colors duration-200 flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Profile;
