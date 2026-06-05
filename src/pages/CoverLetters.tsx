import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useApplicationStore } from '@/store/applicationStore';
import type { CoverLetterDocument } from '@/store/applicationStore';
import { queryGemini } from '@/services/ai/geminiClient';
import { useToast } from '@/components/ui/Toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Dialog } from '@/components/ui/Dialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { 
  FileEdit, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Loader2, 
  Building, 
  User, 
  Copy, 
  Check 
} from 'lucide-react';

export const CoverLetters: React.FC = () => {
  const { user, profile } = useAuthStore();
  const { 
    coverLetters, 
    loading, 
    fetchCoverLetters, 
    addCoverLetter, 
    updateCoverLetter, 
    deleteCoverLetter 
  } = useApplicationStore();
  
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dialog State
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCl, setSelectedCl] = useState<CoverLetterDocument | null>(null);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientTitle, setRecipientTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [body, setBody] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCoverLetters(user.uid);
    }
  }, [user]);

  // Sync form fields when editing
  useEffect(() => {
    if (selectedCl) {
      setTitle(selectedCl.title || '');
      setRecipientName(selectedCl.recipientName || '');
      setRecipientTitle(selectedCl.recipientTitle || '');
      setCompanyName(selectedCl.companyName || '');
      setJobTitle(selectedCl.jobTitle || '');
      setBody(selectedCl.body || '');
    } else {
      setTitle('');
      setRecipientName('');
      setRecipientTitle('');
      setCompanyName('');
      setJobTitle('');
      setBody('');
    }
  }, [selectedCl]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({
      title: 'Copied to clipboard',
      description: 'The cover letter body has been copied.',
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenNew = () => {
    setSelectedCl(null);
    setIsOpen(true);
  };

  const handleOpenEdit = (cl: CoverLetterDocument) => {
    setSelectedCl(cl);
    setIsOpen(true);
  };

  const handleGenerateAI = async () => {
    if (!jobTitle || !companyName) {
      toast({
        title: 'Missing information',
        description: 'Please specify the Target Job Title and Company Name for AI generation.',
        variant: 'destructive',
      });
      return;
    }

    setGeneratingAI(true);
    try {
      const skillsText = profile?.skills?.join(', ') || 'software development';
      const expText = profile?.yearsOfExperience || 3;
      const candidateName = profile?.fullName || 'the Candidate';

      const prompt = `
Generate a cover letter for:
Candidate Name: ${candidateName}
Years of Experience: ${expText}
Skills: ${skillsText}
Target Role: ${jobTitle}
Target Company: ${companyName}
Recipient Name: ${recipientName || 'Hiring Manager'}
Recipient Title: ${recipientTitle || 'Recruiting Specialist'}
      `;

      const sysInstruction = `
You are an expert recruitment specialist and professional copywriter.
Write an outstanding, professional cover letter tailored precisely to the target role and company.
Keep the cover letter modern, enthusiastic, and concise (about 250-300 words).
Ensure it has standard business letter segments: Header greeting, strong opening, matching candidate qualifications, and a clear call to action closing.
DO NOT wrap output in JSON. Output only the plaintext body of the letter.
      `;

      let responseText = '';
      try {
        responseText = await queryGemini(prompt, sysInstruction, false);
      } catch (err: any) {
        if (err.message === 'NO_API_KEY') {
          responseText = getMockCoverLetter(candidateName, jobTitle, companyName, recipientName || 'Hiring Manager');
        } else {
          throw err;
        }
      }

      setBody(responseText);
      toast({
        title: 'AI Draft Generated',
        description: 'Successfully customized a draft cover letter.',
      });
    } catch (err: any) {
      toast({
        title: 'Generation failed',
        description: err.message || 'Failed to communicate with AI Coach.',
        variant: 'destructive',
      });
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      const payload = {
        userId: user.uid,
        title: title || `${jobTitle} Cover Letter - ${companyName}`,
        recipientName,
        recipientTitle,
        companyName,
        jobTitle,
        body,
      };

      if (selectedCl) {
        await updateCoverLetter(selectedCl.id, payload);
        toast({
          title: 'Cover letter updated',
          description: 'Your changes have been saved.',
        });
      } else {
        await addCoverLetter(payload);
        toast({
          title: 'Cover letter created',
          description: 'Your new cover letter is ready.',
        });
      }
      setIsOpen(false);
    } catch (err: any) {
      toast({
        title: 'Save failed',
        description: err.message || 'Unable to save cover letter.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCl = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteCoverLetter(id);
      toast({
        title: 'Deleted',
        description: 'Cover letter removed successfully.',
      });
    } catch (err: any) {
      toast({
        title: 'Delete failed',
        description: err.message || 'Failed to remove.',
        variant: 'destructive',
      });
    }
  };

  const filteredCoverLetters = coverLetters.filter(
    (cl) =>
      cl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cl.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cl.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight font-outfit text-slate-900 dark:text-white flex items-center gap-2">
            <FileEdit className="h-7 w-7 text-indigo-650" /> Cover Letters
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create, manage, and draft custom AI cover letters for your prospective career applications.
          </p>
        </div>
        <Button
          onClick={handleOpenNew}
          className="bg-indigo-600 hover:bg-indigo-750 text-white font-semibold text-xs py-2 px-4 shadow-sm flex items-center gap-2 self-start sm:self-center"
        >
          <Plus className="h-4 w-4" /> Create Cover Letter
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by title, role or company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 text-xs border-slate-200/80 bg-white"
        />
      </div>

      {/* Letters List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
      ) : filteredCoverLetters.length === 0 ? (
        <Card className="border border-slate-200/60 p-8 text-center bg-white dark:bg-slate-900 shadow-sm max-w-md mx-auto">
          <CardContent className="space-y-4 pt-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
              <FileEdit className="h-6 w-6" />
            </div>
            <h3 className="text-md font-bold text-slate-800 dark:text-white font-outfit">
              No Cover Letters Drafted
            </h3>
            <p className="text-xs text-slate-400">
              {searchQuery ? 'No letters match your keyword.' : 'Draft custom application letters or use AI-supported drafting to auto-generate from roles.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCoverLetters.map((cl) => (
            <Card key={cl.id} className="border border-slate-200/60 hover:border-slate-300 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
              <CardHeader className="pb-3 border-b border-slate-50 dark:border-slate-800/40">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <CardTitle className="font-outfit text-sm font-bold text-slate-900 dark:text-white">
                      {cl.title}
                    </CardTitle>
                    <CardDescription className="text-[10px] text-slate-400 mt-0.5">
                      Last edited: {new Date(cl.updatedAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1.5 text-slate-400 hover:text-indigo-650 hover:bg-slate-50 rounded"
                      onClick={() => handleOpenEdit(cl)}
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                      onClick={() => handleDeleteCl(cl.id, cl.title)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-650 dark:text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Building className="h-3.5 w-3.5 text-slate-400" /> {cl.companyName}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-slate-400" /> {cl.jobTitle}
                    </span>
                  </div>
                  <p className="text-xs text-slate-505 dark:text-slate-400 line-clamp-4 whitespace-pre-line bg-slate-50/50 dark:bg-slate-950/30 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/40">
                    {cl.body}
                  </p>
                </div>

                <div className="pt-3 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs font-semibold border-slate-200 text-slate-600 hover:bg-slate-55 flex items-center gap-1.5"
                    onClick={() => handleCopy(cl.id, cl.body)}
                  >
                    {copiedId === cl.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-650" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copy Letter
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog Modal */}
      <Dialog 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title={selectedCl ? 'Edit Cover Letter' : 'Create Cover Letter'}
        description="Provide recipient name and target job metadata, then draft the letter or trigger AI generation."
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-655 dark:text-slate-350">Document Title</label>
              <Input
                placeholder="e.g. Google Solutions Architect Letter"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-655 dark:text-slate-350">Recipient Name</label>
              <Input
                placeholder="e.g. Jane Smith (or Hiring Manager)"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-655 dark:text-slate-350">Recipient Title</label>
              <Input
                placeholder="e.g. Lead Talent Acquisition Partner"
                value={recipientTitle}
                onChange={(e) => setRecipientTitle(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-655 dark:text-slate-350">Company Name *</label>
              <Input
                placeholder="e.g. Google"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-655 dark:text-slate-350">Job Title *</label>
              <Input
                placeholder="e.g. Senior Frontend Developer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div className="space-y-1.5 relative">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-655 dark:text-slate-350">Letter Body *</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateAI}
                className="text-[10px] h-7 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold border-indigo-100 flex items-center gap-1"
                disabled={generatingAI || submitting}
              >
                {generatingAI ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" /> Drafting...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3" /> Draft with Gemini
                  </>
                )}
              </Button>
            </div>
            <Textarea
              rows={12}
              placeholder="Dear Hiring Team..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              disabled={submitting}
              className="font-mono text-xs p-3"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              disabled={submitting}
              className="text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-indigo-650 hover:bg-indigo-750 text-white font-semibold text-xs py-2 px-4 shadow-sm flex items-center gap-1.5"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" /> Saving...
                </>
              ) : (
                'Save Letter'
              )}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

function getMockCoverLetter(candidate: string, role: string, company: string, recipient: string) {
  return `Dear ${recipient},

I am writing to express my strong interest in the ${role} position at ${company}. With a robust background in building scalable web architectures and leading engineering initiatives, I am confident in my ability to make a significant contribution to your technical team.

Throughout my career, I have specialized in React, TypeScript, and modern frontend paradigms, delivering robust features that align with key user experiences. In my previous engagements, I successfully reduced application page-load times by 40% and pioneered clean, modular components that sped up product releases. I thrive in collaborative environments where high-quality standards and clean developer structures are valued.

${company}'s reputation for innovation and commitment to developer empowerment makes this opportunity particularly exciting. I am eager to apply my technical knowledge and passion for high-performance applications to help drive your project success.

Thank you for your time and consideration. I look forward to the opportunity of speaking with you to discuss how my skill set maps to your strategic needs.

Sincerely,

${candidate}`;
}

export default CoverLetters;
