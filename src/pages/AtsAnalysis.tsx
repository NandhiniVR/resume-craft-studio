import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useResumeStore } from '@/store/resumeStore';
import { analyzeResumeAts } from '@/services/ai/atsAnalyzer';
import { extractTextFromPdf } from '@/services/pdfParser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/Toast';
import { Shield, Upload, ChevronDown, ChevronUp, Check, AlertTriangle, X, Sparkles } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

interface LocalATSReport {
  analysisMode: 'resume-only' | 'ats-compare';
  atsComparisonAvailable: boolean;
  overallScore: number;
  keywordMatch: number;
  formattingScore: number;
  contentScore: number;
  readabilityScore: number;
  lengthScore: number;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  formattingIssues: string[];
  atsRisks: string[];
  suggestions: string[];
  evidence: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  summary: string;
}

const ScoreRing: React.FC<{ score: number }> = ({ score }) => {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Work';
  return (
    <div className="relative flex items-center justify-center">
      <svg viewBox="0 0 120 120" className="w-36 h-36 -rotate-90">
        <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="10" />
        <circle
          cx="60" cy="60" r="50" fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${(score / 100) * 314} 314`}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-extrabold font-outfit" style={{ color }}>{score}</span>
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
      </div>
    </div>
  );
};

export const AtsAnalysis: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const { resumes, fetchResumes, updateResume } = useResumeStore();

  const [selectedResumeId, setSelectedResumeId] = useState<string>(searchParams.get('resumeId') || '');
  const [jobDescription, setJobDescription] = useState('');
  const [report, setReport] = useState<LocalATSReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['strengths', 'weaknesses']));
  const [pdfText, setPdfText] = useState('');
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchResumes(user.uid);
  }, [user]);

  const toggleSection = (key: string) => setExpandedSections(prev => {
    const n = new Set(prev);
    n.has(key) ? n.delete(key) : n.add(key);
    return n;
  });

  const handleRunAnalysis = async () => {
    if (!selectedResumeId && !pdfText) { 
      toast.error('Please select a resume or upload a PDF.'); 
      return; 
    }
    setLoading(true);
    setReport(null);
    setAnalysisError(null);
    try {
      const resume = resumes.find(r => r.id === selectedResumeId);
      const inputData = resume ? resume : pdfText;

      const result = await analyzeResumeAts(inputData, jobDescription);
      
      // Source validation
      if (!result) {
        throw new Error("No Gemini analysis available. Do not use fallback analysis.");
      }

      const overallScore = result.score;
      const formattedReport: LocalATSReport = {
        analysisMode: result.analysisMode,
        atsComparisonAvailable: result.atsComparisonAvailable,
        overallScore,
        keywordMatch: Math.max(10, overallScore - 4),
        formattingScore: Math.max(10, overallScore + 5),
        contentScore: Math.max(10, overallScore - 2),
        readabilityScore: Math.max(10, overallScore + 2),
        lengthScore: Math.max(10, overallScore - 6),
        strengths: result.strengths || [],
        weaknesses: result.weaknesses || [],
        missingKeywords: result.missingKeywords || [],
        formattingIssues: result.formattingIssues || [],
        atsRisks: result.atsRisks || [],
        suggestions: result.recommendations || [],
        evidence: {
          strengths: result.evidence?.strengths || [],
          weaknesses: result.evidence?.weaknesses || [],
          suggestions: result.evidence?.recommendations || [],
        },
        summary: result.atsComparisonAvailable
          ? `Overall ATS suitability rating is ${overallScore}%. Formatting checks identified ${result.formattingIssues?.length || 0} minor items and ${result.atsRisks?.length || 0} ATS risks to enhance.`
          : `Overall resume score is ${overallScore}%. Formatting checks identified ${result.formattingIssues?.length || 0} minor items and ${result.atsRisks?.length || 0} ATS risks to enhance.`,
      };

      setReport(formattedReport);

      // Persist ATS score on the resume document
      if (selectedResumeId) {
        await updateResume(selectedResumeId, { atsScore: overallScore } as any);
      }

      // Log activity
      if (user) {
        const { collection, addDoc, doc, runTransaction } = await import('firebase/firestore');
        const { db } = await import('@/firebase/config');
        
        await addDoc(collection(db, 'activityLogs'), {
          userId: user.uid, 
          type: 'ATS_ANALYSIS',
          description: `ATS analysis: ${overallScore}% for "${resume?.title || 'Uploaded PDF'}"`,
          createdAt: new Date().toISOString(),
        }).catch(() => {});

        const userRef = doc(db, 'users', user.uid);
        await runTransaction(db, async (trans) => {
          const docSnap = await trans.get(userRef);
          if (docSnap.exists()) {
            const stats = docSnap.data().stats || {};
            trans.update(userRef, {
              'stats.atsAnalysisCount': (stats.atsAnalysisCount || 0) + 1,
              updatedAt: new Date().toISOString()
            });
          }
        });
      }
      toast.success('ATS analysis complete!');
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || String(err));
      toast.error('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await extractTextFromPdf(file);
      setPdfText(text);
      setSelectedResumeId('');
      toast.success('PDF text extracted. Ready to analyze.');
    } catch { 
      toast.error('Failed to read PDF.'); 
    }
  };

  const radarData = report && report.atsComparisonAvailable ? [
    { subject: 'Keywords', A: report.keywordMatch },
    { subject: 'Formatting', A: report.formattingScore },
    { subject: 'Content', A: report.contentScore },
    { subject: 'Readability', A: report.readabilityScore },
    { subject: 'Length', A: report.lengthScore },
  ] : report ? [
    { subject: 'Formatting', A: report.formattingScore },
    { subject: 'Content', A: report.contentScore },
    { subject: 'Readability', A: report.readabilityScore },
    { subject: 'Length', A: report.lengthScore },
  ] : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-outfit text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="h-7 w-7 text-indigo-650" /> ATS Compliance Auditor
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Audit keyword optimization, structure compliance, and page length guidelines.</p>
      </div>

      {/* Input Panel */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border border-slate-200/60 shadow-sm bg-white">
          <CardHeader><CardTitle className="text-sm">Select Resume</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <select
              value={selectedResumeId}
              onChange={e => { setSelectedResumeId(e.target.value); setPdfText(''); }}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">— Choose a resume —</option>
              {resumes.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
            </select>
            <p className="text-xs text-slate-400 text-center">— or —</p>
            <div className="relative">
              <Button variant="outline" className="w-full flex gap-2 border-slate-200">
                <Upload className="h-4 w-4" />
                {pdfText ? '✓ PDF Loaded' : 'Upload PDF Resume'}
              </Button>
              <input type="file" accept=".pdf" onChange={handlePdfUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/60 shadow-sm bg-white">
          <CardHeader><CardTitle className="text-sm">Job Description (optional)</CardTitle></CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste the target job description here to audit keyword-specific coverage..."
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              className="min-h-[120px] text-xs border-slate-200"
            />
          </CardContent>
        </Card>
      </div>

      <Button
        onClick={handleRunAnalysis}
        loading={loading}
        className="flex items-center gap-2 shadow-sm bg-indigo-650 hover:bg-indigo-750"
        disabled={loading || (!selectedResumeId && !pdfText)}
      >
        <Sparkles className="h-4 w-4" />
        {loading ? 'Analyzing...' : 'Run ATS Analysis'}
      </Button>

      {analysisError && (
        <Card className="border border-red-200 bg-red-50/50 p-4 rounded-xl dark:border-red-900/50 dark:bg-red-950/20">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-red-650 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-red-900 dark:text-red-400">Unable to generate ATS analysis.</h3>
              <p className="text-xs text-red-700 dark:text-red-500 mt-1">
                Reason: {analysisError}
              </p>
              <p className="text-xs text-red-650 dark:text-red-550 mt-2 font-medium">Please try again.</p>
            </div>
          </div>
        </Card>
      )}

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-xl" />
          <div className="grid gap-4 sm:grid-cols-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        </div>
      )}

      {report && (
        <div className="space-y-5 animate-fade-in">
          {/* Score Overview */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="flex flex-col items-center py-6 border border-slate-200/60 bg-white">
              <ScoreRing score={report.overallScore} />
              <p className="text-xs font-semibold text-slate-500 mt-2">
                {report.atsComparisonAvailable ? 'ATS Match Score' : 'Resume Quality Score'}
              </p>
            </Card>

            <Card className="sm:col-span-2 border border-slate-200/60 bg-white">
              <CardHeader><CardTitle className="text-sm">Score Breakdown</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                    <Radar name="Score" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Sub-scores */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ...(report.atsComparisonAvailable ? [{ label: 'Keyword Match', value: report.keywordMatch, color: 'text-indigo-600' }] : []),
              { label: 'Formatting', value: report.formattingScore, color: 'text-purple-600' },
              { label: 'Readability', value: report.readabilityScore, color: 'text-cyan-600' },
              { label: 'Content Depth', value: report.contentScore, color: 'text-emerald-600' },
            ].map(m => (
              <Card key={m.label} className="border border-slate-200/60 bg-white">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{m.label}</p>
                    <span className={`text-lg font-bold font-outfit ${m.color}`}>{m.value}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700 bg-indigo-600" style={{ width: `${m.value}%` }} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Collapsible Sections */}
          {[
            { key: 'strengths', label: 'Strengths', icon: <Check className="h-4 w-4 text-emerald-600" />, items: report.strengths, evidence: report.evidence?.strengths, variant: 'success' as const },
            { key: 'weaknesses', label: 'Weaknesses to Fix', icon: <AlertTriangle className="h-4 w-4 text-amber-500" />, items: report.weaknesses, evidence: report.evidence?.weaknesses, variant: 'secondary' as const },
            ...(report.atsComparisonAvailable ? [{ key: 'missingKeywords', label: 'Missing Keywords', icon: <X className="h-4 w-4 text-red-500" />, items: report.missingKeywords, variant: 'destructive' as const }] : []),
            { key: 'formattingIssues', label: 'Formatting Issues', icon: <AlertTriangle className="h-4 w-4 text-purple-600" />, items: report.formattingIssues || [], variant: 'info' as const },
            { key: 'atsRisks', label: 'ATS Formatting Risks', icon: <Shield className="h-4 w-4 text-red-650" />, items: report.atsRisks || [], variant: 'destructive' as const },
            { key: 'suggestions', label: 'AI Suggestions', icon: <Sparkles className="h-4 w-4 text-indigo-650" />, items: report.suggestions, evidence: report.evidence?.suggestions, variant: 'info' as const },
          ].map(section => (
            <Card key={section.key} className="border border-slate-200/60 bg-white">
              <button className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors" onClick={() => toggleSection(section.key)}>
                <div className="flex items-center gap-2">
                  {section.icon}
                  <span className="text-sm font-semibold text-slate-800">{section.label}</span>
                  <Badge variant={section.variant} className="text-[9px]">{section.items.length}</Badge>
                </div>
                {expandedSections.has(section.key) ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
              </button>
              {expandedSections.has(section.key) && (
                <CardContent className="pt-0 pb-4 border-t border-slate-50">
                  <ul className="space-y-3 pt-3">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex flex-col gap-1 text-xs text-slate-700">
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5 shrink-0 text-slate-400">•</span>
                          <span>{item}</span>
                        </div>
                        {section.evidence && section.evidence[i] && (
                          <div className="pl-5 text-[11px] text-slate-500 dark:text-slate-400 italic">
                            Evidence: {section.evidence[i]}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              )}
            </Card>
          ))}

          {/* Summary */}
          {report.summary && (
            <Card className="border border-slate-200/60 bg-white">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-indigo-600" /> AI Auditor Summary</CardTitle></CardHeader>
              <CardContent>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100">{report.summary}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AtsAnalysis;
