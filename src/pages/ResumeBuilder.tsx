import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAuthStore } from '@/store/authStore';
import { useResumeStore, ResumeDocument } from '@/store/resumeStore';
import { useAutosave } from '@/hooks/useAutosave';
import { TEMPLATES } from '@/templates';
import { ResumePDFView } from '@/components/ResumePDFView';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { toast } from '@/components/ui/Toast';
import { generateSummaries } from '@/services/ai/summaryGenerator';
import type { ResumeData, ResumeExperience, ResumeEducation, ResumeProject, ResumeCertification, ResumeLanguage } from '@/templates/types';
import {
  GripVertical, Plus, Sparkles, Save, Eye, EyeOff, ChevronDown, ChevronUp, X, Check
} from 'lucide-react';

// Sortable section handle
const SortableSection: React.FC<{ id: string; label: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ id, label, children, defaultOpen = true }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const [open, setOpen] = useState(defaultOpen);
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-50/80 cursor-pointer" onClick={() => setOpen(!open)}>
        <div {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-slate-600">
          <GripVertical className="h-4 w-4" />
        </div>
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex-1">{label}</span>
        {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </div>
      {open && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );
};

// ID generator
const genId = () => Math.random().toString(36).substring(2, 9);

// Default empty entries
const emptyExp = (): ResumeExperience => ({ id: genId(), company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: [''] });
const emptyEdu = (): ResumeEducation => ({ id: genId(), institution: '', degree: '', fieldOfStudy: '', location: '', startDate: '', endDate: '', current: false, gpa: '' });
const emptyProj = (): ResumeProject => ({ id: genId(), name: '', role: '', url: '', startDate: '', endDate: '', description: [''] });
const emptyCert = (): ResumeCertification => ({ id: genId(), name: '', issuer: '', issueDate: '', expiryDate: '', url: '', showInResume: true });
const emptyLang = (): ResumeLanguage => ({ language: '', proficiency: 'Professional' });

export const ResumeBuilder: React.FC = () => {
  const { resumeId } = useParams<{ resumeId: string }>();
  const { user } = useAuthStore();
  const { resumes, updateResume, createVersionSnapshot, fetchResumes } = useResumeStore();
  const navigate = useNavigate();

  const [data, setData] = useState<ResumeData | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [generatedSummaries, setGeneratedSummaries] = useState<string[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newAchievement, setNewAchievement] = useState('');
  const [newInterest, setNewInterest] = useState('');

  // Load resume
  useEffect(() => {
    if (!user) return;
    if (resumes.length === 0) fetchResumes(user.uid);
  }, [user]);

  useEffect(() => {
    const resume = resumes.find(r => r.id === resumeId);
    if (resume) setData(resume);
  }, [resumes, resumeId]);

  // Autosave
  const saveFn = useCallback(async (currentData: ResumeData) => {
    if (!resumeId) return;
    await updateResume(resumeId, currentData as Partial<ResumeDocument>);
  }, [resumeId]);

  const { saveState, triggerSave } = useAutosave(saveFn, 5000);

  const update = (patch: Partial<ResumeData>) => {
    if (!data) return;
    const updated = { ...data, ...patch };
    setData(updated);
    triggerSave(updated);
  };

  const updatePersonalInfo = (field: string, value: string) => {
    if (!data) return;
    const updated = { ...data, personalInfo: { ...data.personalInfo, [field]: value } };
    setData(updated);
    triggerSave(updated);
  };

  // DnD section reorder
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && data) {
      const oldIndex = data.sectionOrder.indexOf(active.id as string);
      const newIndex = data.sectionOrder.indexOf(over.id as string);
      update({ sectionOrder: arrayMove(data.sectionOrder, oldIndex, newIndex) });
    }
  };

  const handleGenerateSummary = async () => {
    if (!data) return;
    setSummaryLoading(true);
    setSummaryDialogOpen(true);
    try {
      const result = await generateSummaries(data.skills, 3, data.personalInfo.professionalTitle || 'Professional');
      setGeneratedSummaries(result.summaries);
    } catch {
      toast.error('Failed to generate summaries.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleSaveVersion = async () => {
    if (!resumeId) return;
    try {
      await createVersionSnapshot(resumeId);
      toast.success('Version snapshot saved!');
    } catch {
      toast.error('Failed to save version.');
    }
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full p-12">
        <p className="text-sm text-slate-400">Loading resume...</p>
      </div>
    );
  }

  const tpl = TEMPLATES[data.template];

  // Helper renderers for array sections
  const renderExperiences = () => (
    <>
      {data.experience.map((exp, idx) => (
        <div key={exp.id} className="p-3 border border-slate-200 rounded-lg space-y-2 bg-slate-50/50 relative">
          <button onClick={() => update({ experience: data.experience.filter((_, i) => i !== idx) })} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input placeholder="Job Title" value={exp.position} onChange={e => { const arr = [...data.experience]; arr[idx] = { ...exp, position: e.target.value }; update({ experience: arr }); }} className="text-xs h-8" />
            <Input placeholder="Company" value={exp.company} onChange={e => { const arr = [...data.experience]; arr[idx] = { ...exp, company: e.target.value }; update({ experience: arr }); }} className="text-xs h-8" />
            <Input placeholder="Location" value={exp.location} onChange={e => { const arr = [...data.experience]; arr[idx] = { ...exp, location: e.target.value }; update({ experience: arr }); }} className="text-xs h-8" />
            <div className="flex gap-1.5">
              <Input placeholder="Start" value={exp.startDate} onChange={e => { const arr = [...data.experience]; arr[idx] = { ...exp, startDate: e.target.value }; update({ experience: arr }); }} className="text-xs h-8" />
              {!exp.current && <Input placeholder="End" value={exp.endDate} onChange={e => { const arr = [...data.experience]; arr[idx] = { ...exp, endDate: e.target.value }; update({ experience: arr }); }} className="text-xs h-8" />}
            </div>
          </div>
          <label className="flex items-center gap-1.5 text-[10px] font-medium text-slate-600 cursor-pointer">
            <input type="checkbox" checked={exp.current} onChange={e => { const arr = [...data.experience]; arr[idx] = { ...exp, current: e.target.checked }; update({ experience: arr }); }} />
            Currently working here
          </label>
          {exp.description.map((bullet, bIdx) => (
            <div key={bIdx} className="flex gap-1.5">
              <Textarea
                placeholder="• Describe an achievement with metrics..."
                value={bullet}
                onChange={e => { const arr = [...data.experience]; arr[idx] = { ...exp, description: exp.description.map((b, i) => i === bIdx ? e.target.value : b) }; update({ experience: arr }); }}
                className="text-xs min-h-[56px]"
              />
              <button onClick={() => { const arr = [...data.experience]; arr[idx] = { ...exp, description: exp.description.filter((_, i) => i !== bIdx) }; update({ experience: arr }); }} className="text-slate-400 hover:text-red-500">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <Button size="sm" variant="ghost" className="text-[10px] h-7" onClick={() => { const arr = [...data.experience]; arr[idx] = { ...exp, description: [...exp.description, ''] }; update({ experience: arr }); }}>
            <Plus className="h-3 w-3 mr-1" /> Add Bullet
          </Button>
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={() => update({ experience: [...data.experience, emptyExp()] })} className="text-xs">
        <Plus className="h-3.5 w-3.5 mr-1" /> Add Experience
      </Button>
    </>
  );

  const renderEducation = () => (
    <>
      {data.education.map((edu, idx) => (
        <div key={edu.id} className="p-3 border border-slate-200 rounded-lg space-y-2 bg-slate-50/50 relative">
          <button onClick={() => update({ education: data.education.filter((_, i) => i !== idx) })} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input placeholder="Degree" value={edu.degree} onChange={e => { const arr = [...data.education]; arr[idx] = { ...edu, degree: e.target.value }; update({ education: arr }); }} className="text-xs h-8" />
            <Input placeholder="Field of Study" value={edu.fieldOfStudy} onChange={e => { const arr = [...data.education]; arr[idx] = { ...edu, fieldOfStudy: e.target.value }; update({ education: arr }); }} className="text-xs h-8" />
            <Input placeholder="Institution" value={edu.institution} onChange={e => { const arr = [...data.education]; arr[idx] = { ...edu, institution: e.target.value }; update({ education: arr }); }} className="text-xs h-8" />
            <Input placeholder="Location" value={edu.location} onChange={e => { const arr = [...data.education]; arr[idx] = { ...edu, location: e.target.value }; update({ education: arr }); }} className="text-xs h-8" />
            <Input placeholder="Start Date" value={edu.startDate} onChange={e => { const arr = [...data.education]; arr[idx] = { ...edu, startDate: e.target.value }; update({ education: arr }); }} className="text-xs h-8" />
            <Input placeholder="End Date" value={edu.endDate} onChange={e => { const arr = [...data.education]; arr[idx] = { ...edu, endDate: e.target.value }; update({ education: arr }); }} className="text-xs h-8" />
            <Input placeholder="GPA (optional)" value={edu.gpa} onChange={e => { const arr = [...data.education]; arr[idx] = { ...edu, gpa: e.target.value }; update({ education: arr }); }} className="text-xs h-8" />
          </div>
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={() => update({ education: [...data.education, emptyEdu()] })} className="text-xs">
        <Plus className="h-3.5 w-3.5 mr-1" /> Add Education
      </Button>
    </>
  );

  const renderProjects = () => (
    <>
      {data.projects.map((proj, idx) => (
        <div key={proj.id} className="p-3 border border-slate-200 rounded-lg space-y-2 bg-slate-50/50 relative">
          <button onClick={() => update({ projects: data.projects.filter((_, i) => i !== idx) })} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input placeholder="Project Name" value={proj.name} onChange={e => { const arr = [...data.projects]; arr[idx] = { ...proj, name: e.target.value }; update({ projects: arr }); }} className="text-xs h-8" />
            <Input placeholder="Your Role" value={proj.role} onChange={e => { const arr = [...data.projects]; arr[idx] = { ...proj, role: e.target.value }; update({ projects: arr }); }} className="text-xs h-8" />
            <Input placeholder="Project URL" value={proj.url} onChange={e => { const arr = [...data.projects]; arr[idx] = { ...proj, url: e.target.value }; update({ projects: arr }); }} className="text-xs h-8" />
            <div className="flex gap-1.5">
              <Input placeholder="Start" value={proj.startDate} onChange={e => { const arr = [...data.projects]; arr[idx] = { ...proj, startDate: e.target.value }; update({ projects: arr }); }} className="text-xs h-8" />
              <Input placeholder="End" value={proj.endDate} onChange={e => { const arr = [...data.projects]; arr[idx] = { ...proj, endDate: e.target.value }; update({ projects: arr }); }} className="text-xs h-8" />
            </div>
          </div>
          {proj.description.map((bullet, bIdx) => (
            <div key={bIdx} className="flex gap-1.5">
              <Textarea
                placeholder="Describe what you built and the impact..."
                value={bullet}
                onChange={e => { const arr = [...data.projects]; arr[idx] = { ...proj, description: proj.description.map((b, i) => i === bIdx ? e.target.value : b) }; update({ projects: arr }); }}
                className="text-xs min-h-[56px]"
              />
              <button onClick={() => { const arr = [...data.projects]; arr[idx] = { ...proj, description: proj.description.filter((_, i) => i !== bIdx) }; update({ projects: arr }); }} className="text-slate-400 hover:text-red-500">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="text-[10px] h-7" onClick={() => { const arr = [...data.projects]; arr[idx] = { ...proj, description: [...proj.description, ''] }; update({ projects: arr }); }}>
              <Plus className="h-3 w-3 mr-1" /> Add Bullet
            </Button>
          </div>
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={() => update({ projects: [...data.projects, emptyProj()] })} className="text-xs">
        <Plus className="h-3.5 w-3.5 mr-1" /> Add Project
      </Button>
    </>
  );

  const sectionComponents: Record<string, React.ReactNode> = {
    summary: (
      <div className="space-y-2">
        <div className="flex gap-2">
          <Textarea
            placeholder="A compelling professional summary..."
            value={data.professionalSummary}
            onChange={e => update({ professionalSummary: e.target.value })}
            className="text-xs min-h-[100px]"
          />
        </div>
        <Button size="sm" variant="outline" className="text-[10px]" onClick={handleGenerateSummary}>
          <Sparkles className="h-3.5 w-3.5 mr-1 text-indigo-600" /> AI Generate Summary
        </Button>
      </div>
    ),
    skills: (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {data.skills.map((skill) => (
            <span key={skill} className="flex items-center gap-1 bg-slate-100 border text-[10px] px-2 py-0.5 rounded-full text-slate-700 font-medium">
              {skill}
              <button onClick={() => update({ skills: data.skills.filter(s => s !== skill) })}><X className="h-2.5 w-2.5 text-slate-400 hover:text-red-500" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input placeholder="Add skill, press Enter" value={newSkill} onChange={e => setNewSkill(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (newSkill.trim()) { update({ skills: [...data.skills, newSkill.trim()] }); setNewSkill(''); } } }}
            className="text-xs h-8" />
          <Button size="sm" onClick={() => { if (newSkill.trim()) { update({ skills: [...data.skills, newSkill.trim()] }); setNewSkill(''); } }}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    ),
    experience: renderExperiences(),
    education: renderEducation(),
    projects: renderProjects(),
    certifications: (
      <div className="space-y-2">
        {data.certifications.map((cert, idx) => (
          <div key={cert.id} className="p-3 border border-slate-200 rounded-lg space-y-2 bg-slate-50/50 relative">
            <button onClick={() => update({ certifications: data.certifications.filter((_, i) => i !== idx) })} className="absolute top-2 right-2 text-slate-400 hover:text-red-500"><X className="h-3.5 w-3.5" /></button>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input placeholder="Certificate Name" value={cert.name} onChange={e => { const arr = [...data.certifications]; arr[idx] = { ...cert, name: e.target.value }; update({ certifications: arr }); }} className="text-xs h-8" />
              <Input placeholder="Issuing Organization" value={cert.issuer} onChange={e => { const arr = [...data.certifications]; arr[idx] = { ...cert, issuer: e.target.value }; update({ certifications: arr }); }} className="text-xs h-8" />
              <Input placeholder="Issue Date" value={cert.issueDate} onChange={e => { const arr = [...data.certifications]; arr[idx] = { ...cert, issueDate: e.target.value }; update({ certifications: arr }); }} className="text-xs h-8" />
              <Input placeholder="Expiry Date" value={cert.expiryDate} onChange={e => { const arr = [...data.certifications]; arr[idx] = { ...cert, expiryDate: e.target.value }; update({ certifications: arr }); }} className="text-xs h-8" />
            </div>
            <label className="flex items-center gap-1.5 text-[10px] font-medium text-slate-600 cursor-pointer">
              <input type="checkbox" checked={cert.showInResume} onChange={e => { const arr = [...data.certifications]; arr[idx] = { ...cert, showInResume: e.target.checked }; update({ certifications: arr }); }} />
              Show in resume
            </label>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => update({ certifications: [...data.certifications, emptyCert()] })} className="text-xs">
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Certification
        </Button>
      </div>
    ),
    achievements: (
      <div className="space-y-2">
        {data.achievements.map((ach, idx) => (
          <div key={idx} className="flex gap-1.5">
            <Input value={ach} onChange={e => { const arr = [...data.achievements]; arr[idx] = e.target.value; update({ achievements: arr }); }} className="text-xs h-8" placeholder="Describe an achievement..." />
            <button onClick={() => update({ achievements: data.achievements.filter((_, i) => i !== idx) })} className="text-slate-400 hover:text-red-500"><X className="h-3.5 w-3.5" /></button>
          </div>
        ))}
        <div className="flex gap-2">
          <Input placeholder="Add achievement, press Enter" value={newAchievement} onChange={e => setNewAchievement(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (newAchievement.trim()) { update({ achievements: [...data.achievements, newAchievement.trim()] }); setNewAchievement(''); } } }}
            className="text-xs h-8" />
          <Button size="sm" onClick={() => { if (newAchievement.trim()) { update({ achievements: [...data.achievements, newAchievement.trim()] }); setNewAchievement(''); } }}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    ),
    languages: (
      <div className="space-y-2">
        {data.languages.map((lang, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <Input placeholder="Language" value={lang.language} onChange={e => { const arr = [...data.languages]; arr[idx] = { ...lang, language: e.target.value }; update({ languages: arr }); }} className="text-xs h-8" />
            <Select value={lang.proficiency} onChange={e => { const arr = [...data.languages]; arr[idx] = { ...lang, proficiency: e.target.value as any }; update({ languages: arr }); }} className="text-xs h-8">
              {['Native', 'Fluent', 'Professional', 'Conversational', 'Basic'].map(p => <option key={p} value={p}>{p}</option>)}
            </Select>
            <button onClick={() => update({ languages: data.languages.filter((_, i) => i !== idx) })} className="text-slate-400 hover:text-red-500"><X className="h-3.5 w-3.5" /></button>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => update({ languages: [...data.languages, emptyLang()] })} className="text-xs">
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Language
        </Button>
      </div>
    ),
    interests: (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {data.interests.map((int) => (
            <span key={int} className="flex items-center gap-1 bg-slate-100 border text-[10px] px-2 py-0.5 rounded-full text-slate-700 font-medium">
              {int}
              <button onClick={() => update({ interests: data.interests.filter(s => s !== int) })}><X className="h-2.5 w-2.5 text-slate-400 hover:text-red-500" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input placeholder="Add interest, press Enter" value={newInterest} onChange={e => setNewInterest(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (newInterest.trim()) { update({ interests: [...data.interests, newInterest.trim()] }); setNewInterest(''); } } }}
            className="text-xs h-8" />
          <Button size="sm" onClick={() => { if (newInterest.trim()) { update({ interests: [...data.interests, newInterest.trim()] }); setNewInterest(''); } }}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    ),
  };

  const sectionLabels: Record<string, string> = {
    summary: 'Professional Summary', skills: 'Skills', experience: 'Work Experience',
    education: 'Education', projects: 'Projects', certifications: 'Certifications',
    achievements: 'Achievements', languages: 'Languages', interests: 'Interests',
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-white shadow-sm z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/resumes')} className="text-xs text-slate-500 hover:text-slate-800 font-medium">← Back</button>
          <h2 className="font-outfit font-bold text-sm text-slate-800 truncate max-w-[200px]">{data.title}</h2>
          <Badge variant={saveState === 'saved' ? 'success' : saveState === 'saving' ? 'info' : saveState === 'error' ? 'destructive' : 'secondary'} className="text-[9px]">
            {saveState === 'saving' ? 'Saving...' : saveState === 'saved' ? '✓ Saved' : saveState === 'error' ? 'Error' : 'Unsaved'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Select value={data.template} onChange={e => update({ template: e.target.value as any })} className="text-xs h-8 w-40">
            {Object.entries(TEMPLATES).map(([key, tpl]) => <option key={key} value={key}>{tpl.name}</option>)}
          </Select>
          <Button size="sm" variant="outline" className="text-[10px] h-8" onClick={handleSaveVersion}>
            <Save className="h-3 w-3 mr-1" /> Version
          </Button>
          <Button size="sm" variant="ghost" className="h-8 text-[10px]" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </Button>
          <ResumePDFView data={data} fileName={`${data.title}.pdf`} />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Editor */}
        <div className={`overflow-y-auto p-4 space-y-3 ${showPreview ? 'w-full lg:w-[45%]' : 'w-full'} flex-shrink-0`}>
          {/* Personal Info */}
          <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-slate-50/80">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Personal Information</span>
            </div>
            <div className="p-4 grid gap-3 sm:grid-cols-2">
              {[
                { label: 'Full Name', key: 'fullName' }, { label: 'Professional Title', key: 'professionalTitle' },
                { label: 'Email', key: 'email' }, { label: 'Phone', key: 'phone' },
                { label: 'Location', key: 'location' }, { label: 'LinkedIn', key: 'linkedIn' },
                { label: 'GitHub', key: 'gitHub' }, { label: 'Portfolio', key: 'portfolio' },
              ].map(({ label, key }) => (
                <div key={key} className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-600">{label}</label>
                  <Input
                    value={(data.personalInfo as any)[key] || ''}
                    onChange={e => updatePersonalInfo(key, e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Sections with DnD */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={data.sectionOrder} strategy={verticalListSortingStrategy}>
              {data.sectionOrder.map(sectionKey => (
                sectionComponents[sectionKey] ? (
                  <SortableSection key={sectionKey} id={sectionKey} label={sectionLabels[sectionKey] || sectionKey}>
                    {sectionComponents[sectionKey]}
                  </SortableSection>
                ) : null
              ))}
            </SortableContext>
          </DndContext>
        </div>

        {/* Right Panel - Preview */}
        {showPreview && (
          <div className="hidden lg:flex flex-1 overflow-y-auto bg-slate-100/60 p-6 items-start justify-center border-l border-slate-200">
            <div className="w-full max-w-2xl">
              <tpl.Preview data={data} />
            </div>
          </div>
        )}
      </div>

      {/* AI Summary Generator Dialog */}
      <Dialog isOpen={summaryDialogOpen} onClose={() => setSummaryDialogOpen(false)} title="AI-Generated Summaries" description="Select a summary to apply it to your resume.">
        {summaryLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full" />
            <span className="ml-2 text-xs text-slate-500">Generating summaries...</span>
          </div>
        ) : (
          <div className="space-y-3 mt-3">
            {generatedSummaries.map((s, i) => (
              <div key={i} className="p-3 border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed hover:border-indigo-300 hover:bg-indigo-50/30 cursor-pointer transition-colors group"
                onClick={() => { update({ professionalSummary: s }); setSummaryDialogOpen(false); toast.success('Summary applied!'); }}>
                <div className="flex items-start justify-between gap-2">
                  <p>{s}</p>
                  <Check className="h-4 w-4 text-indigo-600 opacity-0 group-hover:opacity-100 shrink-0 mt-0.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default ResumeBuilder;
