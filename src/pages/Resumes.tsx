import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useResumeStore, ResumeDocument } from '@/store/resumeStore';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/Toast';
import { uploadFileGetUrl } from '@/services/cloudinary';
import { extractTextFromPdf } from '@/services/pdfParser';
import { extractResumeData } from '@/services/ai/resumeExtractor';
import { TEMPLATES } from '@/templates';
import {
  Plus, Upload, Edit, Trash2, Copy, Clock, Shield
} from 'lucide-react';

export const Resumes: React.FC = () => {
  const { user } = useAuthStore();
  const { resumes, fetchResumes, createResume, duplicateResume, deleteResume, loading } = useResumeStore();
  const navigate = useNavigate();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newTemplate, setNewTemplate] = useState<ResumeDocument['template']>('professional');
  const [useProfile, setUseProfile] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [creating, setCreating] = useState(false);

  const { profile } = useAuthStore();

  useEffect(() => {
    if (user) fetchResumes(user.uid);
  }, [user]);

  const handleCreate = async () => {
    if (!user || !newTitle.trim()) return;
    setCreating(true);
    try {
      const initialData = useProfile && profile ? {
        personalInfo: {
          fullName: profile.fullName,
          email: profile.email,
          phone: profile.phone,
          location: profile.location,
          linkedIn: profile.linkedIn,
          gitHub: profile.gitHub,
          portfolio: profile.portfolio,
          professionalTitle: profile.professionalTitle,
        },
        skills: profile.skills,
      } : undefined;

      const created = await createResume(user.uid, newTitle.trim(), newTemplate, initialData as any);
      toast.success('Resume created!');
      setShowCreateDialog(false);
      navigate(`/resumes/${created.id}/edit`);
    } catch {
      toast.error('Failed to create resume.');
    } finally {
      setCreating(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    await duplicateResume(id);
    toast.success('Resume duplicated!');
  };

  const handleDelete = async (id: string) => {
    await deleteResume(id);
    setShowDeleteDialog(null);
    toast.success('Resume deleted.');
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.type !== 'application/pdf') { toast.error('Only PDF files allowed.'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('File must be under 10 MB.'); return; }

    setExtracting(true);
    try {
      // Upload to Cloudinary for permanent storage
      await uploadFileGetUrl(file, user.uid, 'imports');

      // Extract text + run AI
      const rawText = await extractTextFromPdf(file);
      const parsed = await extractResumeData(rawText);

      // Save parsed resume
      const created = await createResume(user.uid, parsed.personalInfo.fullName ? `${parsed.personalInfo.fullName}'s Resume` : 'Imported Resume', 'professional', parsed as any);
      toast.success('Resume extracted and saved!');
      navigate(`/resumes/${created.id}/edit`);
    } catch (err) {
      toast.error('Failed to extract resume content.');
    } finally {
      setExtracting(false);
    }
  };

  if (loading && resumes.length === 0) {
    return (
      <div className="p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-52 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-slate-900">My Resumes</h1>
          <p className="text-sm text-slate-500">Manage, edit and download all your resume variations.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Button variant="outline" className="flex items-center gap-2" disabled={extracting}>
              <Upload className="h-4 w-4" />
              {extracting ? 'Extracting...' : 'Import PDF'}
            </Button>
            <input
              type="file"
              accept=".pdf"
              onChange={handlePdfUpload}
              className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
              disabled={extracting}
            />
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2 shadow-md shadow-indigo-600/10">
            <Plus className="h-4 w-4" />
            New Resume
          </Button>
        </div>
      </div>

      {/* Resume Grid */}
      {resumes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
            <Plus className="h-8 w-8 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-base font-bold font-outfit text-slate-800">No Resumes Yet</h3>
            <p className="text-xs text-slate-400 mt-1">Create your first resume or import an existing PDF.</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>Create First Resume</Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => {
            const tpl = TEMPLATES[resume.template];
            return (
              <Card key={resume.id} className="group hover:shadow-lg transition-all duration-200">
                {/* Template Preview Thumbnail */}
                <div className="relative h-36 bg-gradient-to-br from-slate-50 to-indigo-50/30 border-b border-slate-100 overflow-hidden flex items-center justify-center">
                  <div className="scale-[0.25] origin-top pointer-events-none w-[210mm]">
                    <tpl.Preview data={resume} />
                  </div>
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/30 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="text-xs"
                      onClick={() => navigate(`/resumes/${resume.id}/edit`)}
                    >
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-sm text-slate-900 font-outfit leading-tight">{resume.title}</h3>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <Badge variant="secondary" className="text-[10px]">{tpl.name}</Badge>
                        {resume.atsScore !== null && (
                          <Badge variant={resume.atsScore >= 80 ? 'success' : resume.atsScore >= 60 ? 'info' : 'destructive'} className="text-[10px]">
                            ATS: {resume.atsScore}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Clock className="h-3 w-3 text-slate-400" />
                      <span className="text-[10px] text-slate-400">
                        {new Date(resume.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 flex-wrap pt-1 border-t border-slate-100">
                    <Button size="sm" variant="ghost" className="text-[10px] h-7 px-2" onClick={() => navigate(`/resumes/${resume.id}/edit`)}>
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="ghost" className="text-[10px] h-7 px-2" onClick={() => handleDuplicate(resume.id)}>
                      <Copy className="h-3 w-3 mr-1" /> Duplicate
                    </Button>
                    <Button size="sm" variant="ghost" className="text-[10px] h-7 px-2" onClick={() => navigate(`/ats-analysis?resumeId=${resume.id}`)}>
                      <Shield className="h-3 w-3 mr-1" /> ATS
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-[10px] h-7 px-2 text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto"
                      onClick={() => setShowDeleteDialog(resume.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Resume Dialog */}
      <Dialog isOpen={showCreateDialog} onClose={() => setShowCreateDialog(false)} title="Create New Resume">
        <div className="space-y-4 mt-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Resume Title</label>
            <input
              className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="e.g. Frontend Developer Resume"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Template</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(TEMPLATES) as Array<ResumeDocument['template']>).map((key) => (
                <button
                  key={key}
                  onClick={() => setNewTemplate(key)}
                  className={`p-3 rounded-lg border text-left transition-all ${newTemplate === key ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <p className="text-xs font-bold">{TEMPLATES[key].name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{TEMPLATES[key].description}</p>
                </button>
              ))}
            </div>
          </div>

          {profile?.fullName && (
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input type="checkbox" checked={useProfile} onChange={(e) => setUseProfile(e.target.checked)} className="rounded" />
              Prefill with my profile details
            </label>
          )}

          <div className="flex gap-2 pt-2">
            <Button className="flex-1" onClick={handleCreate} loading={creating} disabled={!newTitle.trim()}>
              Create Resume
            </Button>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
          </div>
        </div>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog isOpen={!!showDeleteDialog} onClose={() => setShowDeleteDialog(null)} title="Delete Resume" description="This action cannot be undone. All versions will be deleted.">
        <div className="flex gap-2 mt-4">
          <Button variant="destructive" className="flex-1" onClick={() => showDeleteDialog && handleDelete(showDeleteDialog)}>
            Yes, Delete
          </Button>
          <Button variant="outline" onClick={() => setShowDeleteDialog(null)}>Cancel</Button>
        </div>
      </Dialog>
    </div>
  );
};

export default Resumes;
