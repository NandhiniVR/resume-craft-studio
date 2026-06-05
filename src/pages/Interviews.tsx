import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useApplicationStore, type InterviewDocument } from '@/store/applicationStore';
import { queryGemini } from '@/services/ai/geminiClient';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Dialog } from '@/components/ui/Dialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/Toast';
import { Calendar, Video, Building2, Phone, Plus, Edit, Trash2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

const INTERVIEW_TYPES = [
  'Virtual',
  'In-Person',
  'Phone'
] as const;

const ROUND_TYPES = [
  'Phone Screen',
  'Technical Interview',
  'Behavioral Interview',
  'System Design',
  'HR Round',
  'Final Interview'
];

const EMPTY_INTERVIEW = {
  applicationId: '',
  date: new Date().toISOString().split('T')[0],
  time: '10:00',
  interviewType: 'Virtual' as const,
  round: 'Technical Interview',
  interviewer: '',
  notes: '',
  feedback: '',
};

const typeIcons: Record<string, React.ReactNode> = {
  Virtual: <Video className="h-3.5 w-3.5" />,
  'In-Person': <Building2 className="h-3.5 w-3.5" />,
  Phone: <Phone className="h-3.5 w-3.5" />,
};

// Practice Questions Generator Helper
async function generateInterviewQuestions(role: string, round: string, company: string) {
  try {
    const prompt = `Generate 5 realistic interview practice questions for a candidate interviewing for: Role: ${role}, Round: ${round}, Company: ${company}`;
    const sysInstruction = `You are a senior hiring manager. Generate 5 realistic, high-impact practice questions for this interview. Output MUST strictly follow the JSON schema: { "questions": ["string"] }`;
    const res = await queryGemini(prompt, sysInstruction, true);
    return JSON.parse(res) as { questions: string[] };
  } catch {
    return {
      questions: [
        `What experience do you have with the core technologies required for the ${role} position?`,
        `Can you describe a challenging technical problem you solved at your previous company?`,
        `How do you handle conflict or differing technical opinions within a development team?`,
        `What steps do you take to optimize application performance and scalability?`,
        `Why are you interested in joining ${company} as a ${role}?`
      ]
    };
  }
}

export const Interviews: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    interviews, 
    applications, 
    fetchInterviews, 
    fetchApplications, 
    addInterview, 
    updateInterview, 
    deleteInterview 
  } = useApplicationStore();
  
  const [showDialog, setShowDialog] = useState(false);
  const [editingInterview, setEditingInterview] = useState<InterviewDocument | null>(null);
  const [form, setForm] = useState<Omit<InterviewDocument, 'id' | 'userId' | 'createdAt'>>({
    applicationId: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    interviewType: 'Virtual',
    round: 'Technical Interview',
    interviewer: '',
    notes: '',
    feedback: '',
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [aiQuestionsDialogOpen, setAiQuestionsDialogOpen] = useState(false);
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [aiQuestionsLoading, setAiQuestionsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchInterviews(user.uid), 
        fetchApplications(user.uid)
      ]).finally(() => setLoading(false));
    }
  }, [user]);

  const openAdd = () => { 
    setForm({ ...EMPTY_INTERVIEW }); 
    setEditingInterview(null); 
    setShowDialog(true); 
  };
  
  const openEdit = (iv: InterviewDocument) => { 
    setForm({
      applicationId: iv.applicationId || '',
      date: iv.date || '',
      time: iv.time || '',
      interviewType: iv.interviewType || 'Virtual',
      round: iv.round || '',
      interviewer: iv.interviewer || '',
      notes: iv.notes || '',
      feedback: iv.feedback || '',
    }); 
    setEditingInterview(iv); 
    setShowDialog(true); 
  };

  const handleSave = async () => {
    if (!user) return;
    if (!form.applicationId) { 
      toast.error('Please link this interview to a Job Application.'); 
      return; 
    }
    setSaving(true);
    try {
      if (editingInterview) {
        await updateInterview(editingInterview.id, form);
        toast.success('Interview updated!');
      } else {
        await addInterview({
          ...form,
          userId: user.uid,
        });
        toast.success('Interview added!');
      }
      setShowDialog(false);
    } catch (err: any) { 
      console.error(err);
      toast.error('Failed to save interview.'); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this interview record?')) return;
    await deleteInterview(id);
    toast.success('Interview deleted.');
  };

  const handlePracticeQuestions = async (iv: InterviewDocument) => {
    const app = applications.find(a => a.id === iv.applicationId);
    const role = app?.jobTitle || 'Developer';
    const company = app?.company || 'Company';
    
    setAiQuestionsLoading(true);
    setAiQuestionsDialogOpen(true);
    try {
      const result = await generateInterviewQuestions(role, iv.round, company);
      setAiQuestions(result.questions);
    } catch { 
      toast.error('Failed to generate practice questions.'); 
      setAiQuestionsDialogOpen(false); 
    } finally { 
      setAiQuestionsLoading(false); 
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-64" />
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-outfit text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-7 w-7 text-indigo-650" /> Interviews
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{interviews.length} interviews scheduled</p>
        </div>
        <Button onClick={openAdd} className="flex items-center gap-2 self-start sm:self-center bg-indigo-650 hover:bg-indigo-750">
          <Plus className="h-4 w-4" /> Schedule Interview
        </Button>
      </div>

      {interviews.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-4 text-center max-w-md mx-auto">
          <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-650">
            <Calendar className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-base font-bold font-outfit text-slate-800 dark:text-white">No Interviews Scheduled</h3>
            <p className="text-xs text-slate-400 mt-1">Track interview timeline rounds and generate practice questions tailored to each role description.</p>
          </div>
          <Button onClick={openAdd} className="bg-indigo-650 hover:bg-indigo-750 text-xs">Schedule First Interview</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map(iv => {
            const isExpanded = expandedId === iv.id;
            const app = applications.find(a => a.id === iv.applicationId);
            const company = app?.company || 'Job Application';
            const role = app?.jobTitle || 'Linked Position';
            
            return (
              <Card key={iv.id} className="overflow-hidden border border-slate-200/60 dark:border-slate-850 shadow-sm">
                <button className="w-full text-left" onClick={() => setExpandedId(isExpanded ? null : iv.id)}>
                  <div className="flex items-center gap-3 p-4">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-650">
                      {typeIcons[iv.interviewType] || <Calendar className="h-4 w-4" />}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-bold text-slate-850 dark:text-white truncate font-outfit">{company}</p>
                      <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">{role} — {iv.round}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-xs text-slate-500 text-right">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{iv.date}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{iv.time}</p>
                      </div>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-3 border-t border-slate-100 dark:border-slate-850/60 space-y-4 animate-fade-in bg-slate-50/30 dark:bg-slate-900/10">
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Interviewer</p>
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1">{iv.interviewer || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Round Type</p>
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1">{iv.round}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Format</p>
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1">{iv.interviewType}</p>
                      </div>
                    </div>

                    {iv.notes && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Preparation / Study Notes</p>
                        <p className="text-xs text-slate-650 dark:text-slate-405 leading-relaxed bg-white dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-850/60">{iv.notes}</p>
                      </div>
                    )}

                    {iv.feedback && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Outcome / Feedback</p>
                        <p className="text-xs text-slate-655 dark:text-slate-405 leading-relaxed bg-white dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-850/60">{iv.feedback}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-850/40">
                      <Button size="sm" variant="outline" className="text-[10px] h-7 bg-indigo-50/50 text-indigo-700 border-indigo-100 hover:bg-indigo-100" onClick={() => handlePracticeQuestions(iv)}>
                        <Sparkles className="h-3 w-3 mr-1" /> AI Coach Questions
                      </Button>
                      <Button size="sm" variant="ghost" className="text-[10px] h-7 text-slate-500 hover:bg-slate-100" onClick={() => openEdit(iv)}>
                        <Edit className="h-3 w-3 mr-1" /> Edit Details
                      </Button>
                      <Button size="sm" variant="ghost" className="text-[10px] h-7 text-red-500 hover:bg-red-50 ml-auto" onClick={() => handleDelete(iv.id)}>
                        <Trash2 className="h-3 w-3 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog 
        isOpen={showDialog} 
        onClose={() => setShowDialog(false)} 
        title={editingInterview ? 'Edit Interview' : 'Schedule Interview'}
      >
        <div className="space-y-3 mt-4 max-h-[65vh] overflow-y-auto pr-1">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] font-semibold text-slate-655 dark:text-slate-300">Linked Job Application *</label>
              <Select 
                value={form.applicationId} 
                onChange={e => setForm(p => ({ ...p, applicationId: e.target.value }))}
                className="text-xs h-8"
              >
                <option value="">— Select active job application —</option>
                {applications.map(app => (
                  <option key={app.id} value={app.id}>{app.company} — {app.jobTitle}</option>
                ))}
              </Select>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-655 dark:text-slate-300">Round Description</label>
              <Select value={form.round} onChange={e => setForm(p => ({ ...p, round: e.target.value }))} className="text-xs h-8">
                {ROUND_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-655 dark:text-slate-300">Format</label>
              <Select value={form.interviewType} onChange={e => setForm(p => ({ ...p, interviewType: e.target.value as any }))} className="text-xs h-8">
                {INTERVIEW_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
              </Select>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-655 dark:text-slate-300">Date</label>
              <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="text-xs h-8" />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-655 dark:text-slate-300">Time</label>
              <Input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} className="text-xs h-8" />
            </div>
            
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] font-semibold text-slate-655 dark:text-slate-300">Interviewer Details</label>
              <Input value={form.interviewer} onChange={e => setForm(p => ({ ...p, interviewer: e.target.value }))} className="text-xs h-8" placeholder="e.g. Sarah Jenkins (Lead Recruiter)" />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-655 dark:text-slate-300">Preparation Notes / Focus Areas</label>
            <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="text-xs min-h-[60px]" placeholder="System design topics, architectural principles, behavioural answers..." />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-655 dark:text-slate-300">Feedback / Outcome Notes</label>
            <Textarea value={form.feedback} onChange={e => setForm(p => ({ ...p, feedback: e.target.value }))} className="text-xs min-h-[60px]" placeholder="Summary of question answers, follow-up timelines..." />
          </div>
          
          <div className="flex gap-2 pt-2 justify-end">
            <Button variant="outline" className="text-xs h-8" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button className="text-xs h-8 bg-indigo-650 hover:bg-indigo-750" onClick={handleSave} loading={saving}>
              {editingInterview ? 'Update Interview' : 'Add Interview'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* AI Practice Questions Dialog */}
      <Dialog 
        isOpen={aiQuestionsDialogOpen} 
        onClose={() => setAiQuestionsDialogOpen(false)} 
        title="AI Practice Questions"
      >
        {aiQuestionsLoading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <div className="h-6 w-6 animate-spin border-2 border-indigo-600 border-t-transparent rounded-full" />
            <span className="text-xs text-slate-500">Drafting tailored questions...</span>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Tailored Interview Questions</p>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {aiQuestions.map((q, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 bg-indigo-50/40 dark:bg-slate-900 border border-indigo-100/50 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">{i + 1}.</span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-3">
              <Button variant="outline" className="text-xs h-8" onClick={() => setAiQuestionsDialogOpen(false)}>Close Practice</Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default Interviews;
