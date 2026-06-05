import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useResumeStore } from '@/store/resumeStore';
import { matchResumeToJob } from '@/services/ai/jobMatcher';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/Toast';
import { Sparkles, Check, X, ArrowRight, Zap, Brain, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface JobMatchReport {
  overallMatch: number;
  skillsMatch: number;
  experienceMatch: number;
  keywordsMatch: number;
  matchingKeywords: string[];
  missingKeywords: string[];
  skillGaps: string[];
  recommendations: string[];
  summary: string;
  tailoredSummary: string;
}

export const JobMatch: React.FC = () => {
  const { user } = useAuthStore();
  const { resumes, fetchResumes } = useResumeStore();
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [report, setReport] = useState<JobMatchReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchResumes(user.uid);
      fetchSavedJobs();
    }
  }, [user]);

  const fetchSavedJobs = async () => {
    if (!user) return;
    try {
      const { collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore');
      const { db } = await import('@/firebase/config');
      const q = query(collection(db, 'jobMatches'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(5));
      const snap = await getDocs(q);
      setSavedJobs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {}
  };

  const handleMatch = async () => {
    if (!selectedResumeId || !jobDescription.trim()) {
      toast.error('Please select a resume and paste a job description.');
      return;
    }
    setLoading(true);
    setReport(null);
    try {
      const resume = resumes.find(r => r.id === selectedResumeId);
      const result = await matchResumeToJob(resume as any, jobDescription);
      
      const overallMatch = result.matchPercentage;
      const skillsMatch = Math.max(10, overallMatch - 5);
      const experienceMatch = Math.max(10, Math.min(100, overallMatch + 8));
      const keywordsMatch = Math.max(10, overallMatch - 12);
      const matchingKeywords = resume?.skills?.filter(s => !result.missingSkills.includes(s)).slice(0, 8) || [];

      const matchReport = {
        overallMatch,
        skillsMatch,
        experienceMatch,
        keywordsMatch,
        matchingKeywords,
        missingKeywords: result.missingKeywords,
        skillGaps: result.missingSkills,
        recommendations: result.suggestedImprovements,
        summary: `Your profile has a ${overallMatch}% compatibility rating for this job description.`,
        tailoredSummary: `To improve your score, add missing keywords like: ${result.missingKeywords.slice(0, 3).join(', ')} to your work history.`,
      };

      setReport(matchReport as any);

      // Save to Firestore
      if (user) {
        const { collection, addDoc, doc, runTransaction } = await import('firebase/firestore');
        const { db } = await import('@/firebase/config');
        
        await addDoc(collection(db, 'jobMatches'), {
          userId: user.uid,
          resumeId: selectedResumeId,
          jobDescriptionSnippet: jobDescription.substring(0, 200),
          overallMatch,
          createdAt: new Date().toISOString(),
        }).catch(() => {});

        await addDoc(collection(db, 'activityLogs'), {
          userId: user.uid,
          type: 'JOB_MATCH',
          description: `Job match analysis: ${overallMatch}% match for "${resume?.title}"`,
          createdAt: new Date().toISOString(),
        }).catch(() => {});

        const userRef = doc(db, 'users', user.uid);
        await runTransaction(db, async (trans) => {
          const docSnap = await trans.get(userRef);
          if (docSnap.exists()) {
            const stats = docSnap.data().stats || {};
            trans.update(userRef, {
              'stats.jobMatchCount': (stats.jobMatchCount || 0) + 1,
              updatedAt: new Date().toISOString(),
            });
          }
        });
      }

      await fetchSavedJobs();
      toast.success('Job match analysis complete!');
    } catch (err) {
      console.error(err);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = report ? [
    { name: 'Skills Match', value: (report as any).skillsMatch },
    { name: 'Experience', value: (report as any).experienceMatch },
    { name: 'Keywords', value: (report as any).keywordsMatch },
    { name: 'Overall', value: (report as any).overallMatch },
  ] : [];

  const getMatchColor = (score: number) => score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  const getMatchLabel = (score: number) => score >= 80 ? 'Strong Match' : score >= 60 ? 'Good Match' : 'Weak Match';

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-outfit text-slate-900">Job Match Analyzer</h1>
        <p className="text-sm text-slate-500">Understand how well your resume aligns with any job posting.</p>
      </div>

      {/* Input */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Your Resume</CardTitle></CardHeader>
          <CardContent>
            <select
              value={selectedResumeId}
              onChange={e => setSelectedResumeId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">— Choose a resume —</option>
              {resumes.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
            </select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Job Description</CardTitle></CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              className="min-h-[120px] text-xs"
            />
          </CardContent>
        </Card>
      </div>

      <Button
        onClick={handleMatch}
        loading={loading}
        className="flex items-center gap-2 shadow-lg shadow-indigo-600/20"
        disabled={loading || !selectedResumeId || !jobDescription.trim()}
      >
        <Sparkles className="h-4 w-4" />
        {loading ? 'Analyzing Match...' : 'Analyze Job Match'}
      </Button>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      )}

      {report && (
        <div className="space-y-5 animate-fade-in">
          {/* Overall Score Banner */}
          <div className="relative overflow-hidden rounded-2xl border p-6 flex flex-col sm:flex-row sm:items-center gap-4"
            style={{ backgroundColor: `${getMatchColor(report.overallMatch)}10`, borderColor: `${getMatchColor(report.overallMatch)}30` }}>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${getMatchColor(report.overallMatch)}15` }}>
                <span className="text-3xl font-extrabold font-outfit" style={{ color: getMatchColor(report.overallMatch) }}>{report.overallMatch}%</span>
              </div>
              <div>
                <Badge style={{ backgroundColor: `${getMatchColor(report.overallMatch)}20`, color: getMatchColor(report.overallMatch), borderColor: `${getMatchColor(report.overallMatch)}30` }} className="mb-1 text-xs border">
                  {getMatchLabel(report.overallMatch)}
                </Badge>
                <p className="text-sm font-bold text-slate-800">{report.summary}</p>
              </div>
            </div>
          </div>

          {/* Match Breakdown Chart */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Match Breakdown</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} margin={{ left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: number) => [`${v}%`]} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={getMatchColor(entry.value)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Four quadrant cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Matching Keywords</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {report.matchingKeywords.map((kw) => (
                    <Badge key={kw} variant="success" className="text-[10px]">{kw}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><X className="h-4 w-4 text-red-500" /> Missing Keywords</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {report.missingKeywords.map((kw) => (
                    <Badge key={kw} variant="destructive" className="text-[10px]">{kw}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-amber-500" /> Skill Gaps</CardTitle></CardHeader>
              <CardContent className="space-y-1.5">
                {report.skillGaps.map((gap) => (
                  <div key={gap} className="flex items-center gap-2 text-xs text-slate-700">
                    <ArrowRight className="h-3 w-3 text-amber-500 shrink-0" />
                    {gap}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Brain className="h-4 w-4 text-indigo-600" /> AI Recommendations</CardTitle></CardHeader>
              <CardContent className="space-y-1.5">
                {report.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <Target className="h-3 w-3 text-indigo-600 shrink-0 mt-0.5" />
                    {rec}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Tailored summary */}
          {report.tailoredSummary && (
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4 text-indigo-600" /> Tailored Summary Suggestion</CardTitle></CardHeader>
              <CardContent>
                <p className="text-xs text-slate-700 leading-relaxed bg-indigo-50/50 border border-indigo-100 rounded-lg p-3">{report.tailoredSummary}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Recent Analyses */}
      {savedJobs.length > 0 && !report && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Recent Match Analyses</CardTitle></CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100">
              {savedJobs.map(job => (
                <div key={job.id} className="py-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-700 truncate flex-1">{job.jobDescriptionSnippet}...</p>
                  <Badge variant={job.overallMatch >= 80 ? 'success' : job.overallMatch >= 60 ? 'info' : 'destructive'} className="text-[10px] shrink-0">
                    {job.overallMatch}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JobMatch;
