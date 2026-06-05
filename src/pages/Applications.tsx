import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useApplicationStore, type ApplicationDocument } from '@/store/applicationStore';
import { useResumeStore } from '@/store/resumeStore';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/Toast';
import { Plus, Briefcase, Trash2, Edit, Search } from 'lucide-react';

const APPLICATION_STATUSES = [
  'Wishlist',
  'Applied',
  'Viewed',
  'Assessment',
  'Interview Round 1',
  'Interview Round 2',
  'Interview Round 3',
  'HR Round',
  'Offer Received',
  'Rejected',
  'Withdrawn',
  'Joined',
] as const;

type ApplicationStatus = typeof APPLICATION_STATUSES[number];

const STATUS_COLORS: Record<ApplicationStatus, { bg: string; text: string; border: string }> = {
  Wishlist: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  Applied: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Viewed: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  Assessment: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Interview Round 1': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Interview Round 2': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Interview Round 3': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'HR Round': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Offer Received': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  Withdrawn: { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200' },
  Joined: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
};

const statusLabels: Record<ApplicationStatus, string> = {
  Wishlist: 'Wishlist',
  Applied: 'Applied',
  Viewed: 'Viewed',
  Assessment: 'Assessment',
  'Interview Round 1': 'Interview R1',
  'Interview Round 2': 'Interview R2',
  'Interview Round 3': 'Interview R3',
  'HR Round': 'HR Round',
  'Offer Received': 'Offer Offer',
  Rejected: 'Rejected',
  Withdrawn: 'Withdrawn',
  Joined: 'Joined',
};

const EMPTY_APP = {
  jobTitle: '',
  company: '',
  location: '',
  salary: '',
  source: 'LinkedIn' as const,
  dateApplied: new Date().toISOString().split('T')[0],
  status: 'Wishlist' as const,
  resumeId: '',
  coverLetterId: '',
  notes: '',
};

export const Applications: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    applications, 
    fetchApplications, 
    addApplication, 
    updateApplication, 
    deleteApplication, 
    loading 
  } = useApplicationStore();
  const { resumes, fetchResumes } = useResumeStore();

  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [showDialog, setShowDialog] = useState(false);
  const [editingApp, setEditingApp] = useState<ApplicationDocument | null>(null);
  const [form, setForm] = useState<Omit<ApplicationDocument, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'resumeVersionId'>>({
    jobTitle: '',
    company: '',
    location: '',
    salary: '',
    source: 'LinkedIn',
    dateApplied: new Date().toISOString().split('T')[0],
    status: 'Wishlist',
    resumeId: '',
    coverLetterId: '',
    notes: '',
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) { 
      fetchApplications(user.uid); 
      fetchResumes(user.uid); 
    }
  }, [user]);

  const openAdd = () => { 
    setForm({ ...EMPTY_APP }); 
    setEditingApp(null); 
    setShowDialog(true); 
  };
  
  const openEdit = (app: ApplicationDocument) => { 
    setForm({
      jobTitle: app.jobTitle || '',
      company: app.company || '',
      location: app.location || '',
      salary: app.salary || '',
      source: (app.source as any) || 'LinkedIn',
      dateApplied: app.dateApplied ? app.dateApplied.split('T')[0] : '',
      status: app.status || 'Wishlist',
      resumeId: app.resumeId || '',
      coverLetterId: app.coverLetterId || '',
      notes: app.notes || '',
    }); 
    setEditingApp(app); 
    setShowDialog(true); 
  };

  const handleSave = async () => {
    if (!user) return;
    if (!form.jobTitle || !form.company) { 
      toast.error('Job title and company are required.'); 
      return; 
    }
    setSaving(true);
    try {
      if (editingApp) {
        await updateApplication(editingApp.id, form);
        toast.success('Application updated!');
      } else {
        await addApplication({
          ...form,
          userId: user.uid,
          resumeVersionId: null,
        });
        toast.success('Application added!');
      }
      setShowDialog(false);
    } catch (err: any) { 
      console.error(err);
      toast.error('Failed to save application.'); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this application and all scheduled interviews?')) return;
    await deleteApplication(id);
    toast.success('Application deleted.');
  };

  const handleQuickStatus = async (id: string, status: ApplicationStatus) => {
    await updateApplication(id, { status });
    toast.success('Status updated!');
  };

  const filtered = applications.filter(a =>
    (statusFilter === 'ALL' || a.status === statusFilter) &&
    (a.jobTitle.toLowerCase().includes(search.toLowerCase()) || a.company.toLowerCase().includes(search.toLowerCase()))
  );

  const byStatus = APPLICATION_STATUSES.reduce((acc, s) => {
    acc[s] = filtered.filter(a => a.status === s);
    return acc;
  }, {} as Record<ApplicationStatus, ApplicationDocument[]>);

  if (loading && applications.length === 0) {
    return (
      <div className="p-6 space-y-4 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-outfit text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="h-7 w-7 text-indigo-650" /> Job Applications
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">{applications.length} total tracked applications</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-8 h-8 text-xs w-44" />
          </div>

          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-xs h-8 w-36">
            <option value="ALL">All Statuses</option>
            {APPLICATION_STATUSES.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
          </Select>

          <div className="flex rounded-md border border-slate-200 overflow-hidden bg-white">
            <button onClick={() => setView('kanban')} className={`px-3 h-8 text-xs font-semibold transition-colors ${view === 'kanban' ? 'bg-indigo-650 text-white' : 'hover:bg-slate-50 text-slate-650'}`}>
              Kanban
            </button>
            <button onClick={() => setView('table')} className={`px-3 h-8 text-xs font-semibold transition-colors ${view === 'table' ? 'bg-indigo-650 text-white' : 'hover:bg-slate-50 text-slate-655'}`}>
              Table
            </button>
          </div>

          <Button size="sm" className="text-xs flex gap-1.5 bg-indigo-650 hover:bg-indigo-750" onClick={openAdd}>
            <Plus className="h-3.5 w-3.5" /> Add Application
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-x-auto">
        {view === 'kanban' ? (
          <div className="flex gap-4 min-w-max pb-4">
            {APPLICATION_STATUSES.map(status => {
              const sc = STATUS_COLORS[status];
              const cards = byStatus[status] || [];
              return (
                <div key={status} className="flex flex-col w-72 shrink-0">
                  <div className={`flex items-center justify-between px-3 py-2 rounded-t-lg border border-b-0 ${sc.bg} ${sc.border}`}>
                    <span className={`text-xs font-bold ${sc.text}`}>{statusLabels[status]}</span>
                    <Badge variant="secondary" className={`text-[10px] ${sc.bg} ${sc.text} border-0`}>{cards.length}</Badge>
                  </div>
                  <div className="flex-grow bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 rounded-b-lg p-2.5 space-y-2.5 min-h-[500px] max-h-[calc(100vh-300px)] overflow-y-auto">
                    {cards.map(app => (
                      <div key={app.id} className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200/60 dark:border-slate-850/80 p-3 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex-grow overflow-hidden">
                            <p className="text-xs font-bold text-slate-850 dark:text-white truncate font-outfit">{app.jobTitle}</p>
                            <p className="text-[10px] text-slate-450 dark:text-slate-500 truncate mt-0.5">{app.company}</p>
                          </div>
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(app)} className="text-slate-400 hover:text-indigo-650 p-1 rounded"><Edit className="h-3 w-3" /></button>
                            <button onClick={() => handleDelete(app.id)} className="text-slate-400 hover:text-red-500 p-1 rounded"><Trash2 className="h-3 w-3" /></button>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          <Badge variant="secondary" className="text-[9px] bg-slate-100 text-slate-600 dark:bg-slate-850 dark:text-slate-400 border-0">{app.source}</Badge>
                          {app.salary && <Badge variant="outline" className="text-[9px] border-slate-200">{app.salary}</Badge>}
                        </div>
                        {app.dateApplied && <p className="text-[9px] text-slate-400 mt-2 font-medium">Applied: {new Date(app.dateApplied).toLocaleDateString()}</p>}
                        <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-850/60 flex flex-wrap gap-1">
                          {APPLICATION_STATUSES.filter(s => s !== status).slice(0, 2).map(s => (
                            <button key={s} onClick={() => handleQuickStatus(app.id, s)} className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${STATUS_COLORS[s].bg} ${STATUS_COLORS[s].text} ${STATUS_COLORS[s].border} hover:opacity-80 transition-opacity`}>
                              → {statusLabels[s]}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    {cards.length === 0 && (
                      <div className="flex items-center justify-center py-12 border border-dashed border-slate-200/50 rounded-lg">
                        <p className="text-[10px] text-slate-400 italic">No applications</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden shadow-sm">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-850/80">
                <tr>
                  {['Job Title', 'Company', 'Status', 'Applied', 'Source', 'Salary', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850/60">
                {filtered.map(app => {
                  const sc = STATUS_COLORS[app.status as ApplicationStatus];
                  return (
                    <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors group">
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">{app.jobTitle}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{app.company}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${sc.bg} ${sc.text} ${sc.border}`}>
                          {statusLabels[app.status as ApplicationStatus]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{app.dateApplied ? new Date(app.dateApplied).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-3 text-slate-500">{app.source}</td>
                      <td className="px-4 py-3 text-slate-500">{app.salary || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(app)} className="text-slate-400 hover:text-indigo-650"><Edit className="h-3.5 w-3.5" /></button>
                          <button onClick={() => handleDelete(app.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-400 italic">No applications found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog 
        isOpen={showDialog} 
        onClose={() => setShowDialog(false)} 
        title={editingApp ? 'Edit Application' : 'Add Application'}
      >
        <div className="grid gap-3 mt-4 max-h-[65vh] overflow-y-auto pr-1">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-655 dark:text-slate-300">Job Title *</label>
              <Input value={form.jobTitle} onChange={e => setForm(p => ({ ...p, jobTitle: e.target.value }))} placeholder="Frontend Engineer" className="text-xs h-8" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-655 dark:text-slate-300">Company *</label>
              <Input value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} placeholder="Acme Corp" className="text-xs h-8" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-655 dark:text-slate-300">Location</label>
              <Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="New York, NY" className="text-xs h-8" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-655 dark:text-slate-300">Status</label>
              <Select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as any }))} className="text-xs h-8">
                {APPLICATION_STATUSES.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-655 dark:text-slate-300">Applied Date</label>
              <Input type="date" value={form.dateApplied} onChange={e => setForm(p => ({ ...p, dateApplied: e.target.value }))} className="text-xs h-8" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-655 dark:text-slate-300">Source</label>
              <Select value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value as any }))} className="text-xs h-8">
                {['LinkedIn', 'Naukri', 'Indeed', 'Company Website', 'Referral', 'Placement', 'Other'].map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] font-semibold text-slate-655 dark:text-slate-300">Salary Range</label>
              <Input value={form.salary} onChange={e => setForm(p => ({ ...p, salary: e.target.value }))} placeholder="$80k - $100k" className="text-xs h-8" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] font-semibold text-slate-655 dark:text-slate-300">Resume Used</label>
              <Select value={form.resumeId} onChange={e => setForm(p => ({ ...p, resumeId: e.target.value }))} className="text-xs h-8">
                <option value="">— None —</option>
                {resumes.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-655 dark:text-slate-300">Notes</label>
            <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Interview notes, contacts, etc..." className="text-xs min-h-[72px]" />
          </div>
          <div className="flex gap-2 pt-2 justify-end">
            <Button variant="outline" className="text-xs h-8" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button className="text-xs h-8 bg-indigo-650 hover:bg-indigo-750" onClick={handleSave} loading={saving}>
              {editingApp ? 'Update Application' : 'Add Application'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Applications;
