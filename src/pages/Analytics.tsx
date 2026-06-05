import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useResumeStore } from '@/store/resumeStore';
import { useApplicationStore } from '@/store/applicationStore';
import { calculateCareerMetrics, type CareerMetrics } from '@/services/analytics';
import { getCareerInsights, type CareerInsightsResult } from '@/services/ai/careerInsights';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Briefcase,
  Award,
  Sparkles,
  Calendar,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  Loader2,
} from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

export const Analytics: React.FC = () => {
  const { user } = useAuthStore();
  const { resumes, fetchResumes } = useResumeStore();
  const { 
    applications, 
    interviews, 
    fetchApplications, 
    fetchInterviews 
  } = useApplicationStore();
  
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [refreshingInsights, setRefreshingInsights] = useState(false);
  const [metrics, setMetrics] = useState<CareerMetrics | null>(null);
  const [insights, setInsights] = useState<CareerInsightsResult | null>(null);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await Promise.all([
        fetchResumes(user.uid),
        fetchApplications(user.uid),
        fetchInterviews(user.uid),
      ]);
    } catch (error: any) {
      toast({
        title: 'Error loading analytics',
        description: error.message || 'Failed to fetch some history records.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Recalculate metrics whenever stores receive new updates
  useEffect(() => {
    if (applications && interviews && resumes) {
      const calculated = calculateCareerMetrics(applications, interviews, resumes);
      setMetrics(calculated);
    }
  }, [applications, interviews, resumes]);

  // Load AI Insights
  useEffect(() => {
    const loadInsights = async () => {
      if (!user || !applications || !interviews || !resumes) return;
      setRefreshingInsights(true);
      try {
        const aiInsights = await getCareerInsights(resumes, applications, interviews);
        setInsights(aiInsights);
      } catch (err) {
        console.error('Failed to get career insights:', err);
      } finally {
        setRefreshingInsights(false);
      }
    };
    if (user && applications.length > 0) {
      loadInsights();
    }
  }, [user, applications, interviews, resumes]);

  const handleRefreshInsights = async () => {
    if (!user) return;
    setRefreshingInsights(true);
    try {
      const aiInsights = await getCareerInsights(resumes, applications, interviews);
      setInsights(aiInsights);
      toast({
        title: 'AI Insights Updated',
        description: 'Refreshed success patterns based on your latest search log.',
      });
    } catch (err: any) {
      toast({
        title: 'Refresh failed',
        description: err.message || 'Could not fetch updated recommendations.',
        variant: 'destructive',
      });
    } finally {
      setRefreshingInsights(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  const hasData = applications.length > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight font-outfit text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-indigo-650" /> Career Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time monitoring of your application conversion funnel, resume success, and AI job matching efficiency.
          </p>
        </div>
        <Button
          onClick={() => loadData()}
          variant="outline"
          size="sm"
          className="self-start sm:self-center border-slate-200 text-slate-650 hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Reload Data
        </Button>
      </div>

      {!hasData ? (
        <Card className="border border-slate-200/60 p-8 text-center bg-white dark:bg-slate-900 shadow-sm max-w-md mx-auto">
          <CardContent className="space-y-4 pt-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-indigo-55 flex items-center justify-center text-indigo-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-md font-bold text-slate-800 dark:text-white font-outfit">
              No Application Data Found
            </h3>
            <p className="text-xs text-slate-400">
              Add some active job listings or applications in the Job Tracker to begin aggregating analytics reports.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Key Metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-slate-200/60 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6 flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Submissions</span>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-outfit">
                    {metrics?.totalApplications}
                  </p>
                </div>
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-indigo-650">
                  <Briefcase className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/60 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6 flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Scheduled Interviews</span>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-outfit">
                    {metrics?.totalInterviews}
                  </p>
                </div>
                <div className="p-2 bg-violet-50 dark:bg-violet-950/40 rounded-lg text-violet-600">
                  <Calendar className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/60 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6 flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Interview Call Rate</span>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-outfit">
                    {metrics?.interviewRate}%
                  </p>
                </div>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/60 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6 flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Offer Success Rate</span>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-outfit">
                    {metrics?.offerRate}%
                  </p>
                </div>
                <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-lg text-amber-600">
                  <Award className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Career Insights */}
          <Card className="border border-indigo-100 dark:border-indigo-950 bg-gradient-to-tr from-indigo-50/30 to-indigo-100/10 dark:from-slate-900 dark:to-indigo-950/20 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-indigo-100/30 pb-4">
              <div>
                <CardTitle className="font-outfit text-md font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-indigo-600" /> AI Coach Strategy Insights
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Automated analysis based on application success patterns.
                </CardDescription>
              </div>
              <Button
                onClick={handleRefreshInsights}
                variant="ghost"
                size="sm"
                className="text-indigo-650 hover:bg-indigo-100/50"
                disabled={refreshingInsights}
              >
                {refreshingInsights ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Highlight metrics */}
              <div className="space-y-4">
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/50 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-bold block">BEST PERFORMING RESUME</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-white font-outfit mt-1 block">
                    {insights?.bestPerformingResume || 'N/A'}
                  </span>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    {insights?.bestResumeVersion || 'N/A'}
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/50 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-bold block">MOST SUCCESSFUL JOB SOURCE</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-white font-outfit mt-1 block">
                    {insights?.mostSuccessfulJobSource || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Action items */}
              <div className="space-y-4">
                {insights?.rejectionPatterns && insights.rejectionPatterns.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> RISK PATTERNS DETECTED
                    </span>
                    <ul className="space-y-1">
                      {insights.rejectionPatterns.map((p, i) => (
                        <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                          <span className="text-red-500 mt-1">•</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {insights?.improvementSuggestions && insights.improvementSuggestions.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-1">
                      <Lightbulb className="h-3 w-3" /> COACH RECOMMENDATIONS
                    </span>
                    <ul className="space-y-1">
                      {insights.improvementSuggestions.map((s, i) => (
                        <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                          <ArrowRight className="h-3 w-3 text-indigo-500 mt-1 shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Trend AreaChart */}
            <Card className="lg:col-span-2 border border-slate-200/60 bg-white dark:bg-slate-900 shadow-sm">
              <CardHeader>
                <CardTitle className="font-outfit text-md font-semibold text-slate-800 dark:text-white">
                  Job Pipeline Trend
                </CardTitle>
                <CardDescription className="text-xs text-slate-450">
                  Applications submitted vs. interview callback conversions over the last 6 months.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics?.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorInts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Legend iconSize={10} verticalAlign="top" height={36} />
                    <Area
                      type="monotone"
                      dataKey="applications"
                      name="Submissions"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorApps)"
                    />
                    <Area
                      type="monotone"
                      dataKey="interviews"
                      name="Interviews"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorInts)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Applications by Source PieChart */}
            <Card className="border border-slate-200/60 bg-white dark:bg-slate-900 shadow-sm">
              <CardHeader>
                <CardTitle className="font-outfit text-md font-semibold text-slate-800 dark:text-white">
                  Applications by Source
                </CardTitle>
                <CardDescription className="text-xs text-slate-450">
                  Distribution of leads from channels.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex flex-col justify-center items-center">
                {metrics?.bySource && metrics.bySource.length > 0 ? (
                  <div className="w-full h-full relative">
                    <ResponsiveContainer width="100%" height="75%">
                      <PieChart>
                        <Pie
                          data={metrics.bySource}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {metrics.bySource.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-[34%] left-[50%] -translate-x-[50%] text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Top Source</span>
                      <span className="text-sm font-extrabold text-slate-850 dark:text-white font-outfit mt-0.5 block">
                        {metrics.bySource.reduce((a, b) => (a.value > b.value ? a : b)).name}
                      </span>
                    </div>
                    {/* Legend */}
                    <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 text-[10px] font-medium text-slate-500 overflow-y-auto max-h-16 pt-2">
                      {metrics.bySource.map((entry, idx) => (
                        <div key={entry.name} className="flex items-center gap-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                          />
                          <span>
                            {entry.name} ({entry.value})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">No source tags defined yet.</span>
                )}
              </CardContent>
            </Card>

            {/* Resume Performance BarChart */}
            <Card className="lg:col-span-3 border border-slate-200/60 bg-white dark:bg-slate-900 shadow-sm">
              <CardHeader>
                <CardTitle className="font-outfit text-md font-semibold text-slate-800 dark:text-white">
                  Resume Success Ratios
                </CardTitle>
                <CardDescription className="text-xs text-slate-450">
                  Comparing applications vs. actual callback conversions across custom resumes.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {metrics?.resumePerformance && metrics.resumePerformance.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.resumePerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Legend iconSize={10} verticalAlign="top" height={36} />
                      <Bar dataKey="applications" name="Applications Linked" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="callbacks" name="Callbacks Received" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-xs text-slate-400">No resumes linked to tracking entries.</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
