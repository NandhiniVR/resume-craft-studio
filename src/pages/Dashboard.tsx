import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { useAuthStore } from '@/store/authStore';
import { useResumeStore } from '@/store/resumeStore';
import { useApplicationStore } from '@/store/applicationStore';
import { calculateCareerMetrics } from '@/services/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import {
  FileText, ShieldCheck, Sparkles, Briefcase, Calendar, Award,
  TrendingUp, Plus, ArrowRight, Clock
} from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export const Dashboard: React.FC = () => {
  const { user, profile, stats } = useAuthStore();
  const { resumes, fetchResumes } = useResumeStore();
  const { applications, interviews, fetchApplications, fetchInterviews } = useApplicationStore();
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchResumes(user.uid);
    fetchApplications(user.uid);
    fetchInterviews(user.uid);

    // Fetch recent activity logs
    import('firebase/firestore').then(({ collection, query, where, orderBy, limit, getDocs }) => {
      import('@/firebase/config').then(({ db }) => {
        const q = query(
          collection(db, 'activityLogs'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(8)
        );
        getDocs(q).then(snap => {
          setActivityLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
          setLogsLoading(false);
        }).catch(() => setLogsLoading(false));
      });
    });
  }, [user]);

  const metrics = calculateCareerMetrics(applications, interviews, resumes);

  const profileCompletion = (() => {
    if (!profile) return 0;
    const fields = [profile.fullName, profile.email, profile.phone, profile.location,
      profile.linkedIn, profile.gitHub, profile.portfolio, profile.professionalTitle,
      profile.yearsOfExperience !== 0, profile.skills?.length > 0, profile.profilePhoto];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  })();

  const statCards = [
    { label: 'My Resumes', value: stats?.resumeCount ?? resumes.length, icon: FileText, to: '/resumes', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'ATS Analyses', value: stats?.atsAnalysisCount ?? 0, icon: ShieldCheck, to: '/ats-analysis', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Job Matches', value: stats?.jobMatchCount ?? 0, icon: Sparkles, to: '/job-match', color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { label: 'Applications', value: stats?.applicationsCount ?? applications.length, icon: Briefcase, to: '/applications', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Interviews', value: stats?.interviewsCount ?? interviews.length, icon: Calendar, to: '/interviews', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Certificates', value: stats?.certificatesCount ?? 0, icon: Award, to: '/certificates', color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const activityTypeIcons: Record<string, React.ReactNode> = {
    RESUME_CREATED: <FileText className="h-3 w-3" />,
    RESUME_EDITED: <FileText className="h-3 w-3" />,
    ATS_ANALYSIS: <ShieldCheck className="h-3 w-3" />,
    JOB_MATCH: <Sparkles className="h-3 w-3" />,
    APPLICATION_ADDED: <Briefcase className="h-3 w-3" />,
    INTERVIEW_SCHEDULED: <Calendar className="h-3 w-3" />,
    CERTIFICATE_ADDED: <Award className="h-3 w-3" />,
    COVER_LETTER_CREATED: <FileText className="h-3 w-3" />,
  };

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-slate-900">
            Welcome back, {profile?.fullName?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Here's what's happening with your career journey.</p>
        </div>
        <Link to="/resumes">
          <Button className="flex items-center gap-2 shadow-md shadow-indigo-600/10">
            <Plus className="h-4 w-4" />
            New Resume
          </Button>
        </Link>
      </div>

      {/* Profile Completion Banner */}
      {profileCompletion < 100 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-xl">
          <div className="flex-1">
            <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">
              Complete your profile — {profileCompletion}% done
            </p>
            <div className="mt-2 h-1.5 w-full max-w-xs rounded-full bg-indigo-100 overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${profileCompletion}%` }} />
            </div>
          </div>
          <Link to="/profile">
            <Button size="sm" variant="outline" className="border-indigo-300 text-indigo-700 hover:bg-indigo-100 flex items-center gap-1.5">
              Complete Profile <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map((card) => (
          <Link key={card.label} to={card.to}>
            <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
              <CardContent className="p-4 flex flex-col gap-3">
                <div className={`h-9 w-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold font-outfit text-slate-900 group-hover:text-indigo-700 transition-colors">
                    {card.value}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mt-0.5">{card.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Applications Trend */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
                Application Trend (Last 6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {metrics.monthlyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={metrics.monthlyTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="appsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="intsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Area type="monotone" dataKey="applications" name="Applications" stroke="#6366f1" fill="url(#appsGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="interviews" name="Interviews" stroke="#8b5cf6" fill="url(#intsGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-xs text-slate-400">
                  No applications yet. Start tracking your job hunt!
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Applications by Source Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-indigo-600" />
              By Source
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.bySource.length > 0 ? (
              <div className="flex flex-col items-center gap-3">
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={metrics.bySource} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={35}>
                      {metrics.bySource.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-2">
                  {metrics.bySource.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1 text-[10px] text-slate-600">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      {entry.name}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[150px] flex items-center justify-center text-xs text-slate-400 text-center">
                Add applications to see source breakdown.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Key Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Career Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Interview Rate', value: metrics.interviewRate, color: 'bg-indigo-500' },
              { label: 'Offer Rate', value: metrics.offerRate, color: 'bg-emerald-500' },
              { label: 'Acceptance Rate', value: metrics.acceptanceRate, color: 'bg-purple-500' },
            ].map((m) => (
              <div key={m.label} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-600">{m.label}</span>
                  <span className="font-bold text-slate-900">{m.value}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full ${m.color} rounded-full transition-all duration-700`} style={{ width: `${m.value}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-indigo-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-3 flex-1 rounded" />
                  </div>
                ))}
              </div>
            ) : activityLogs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No recent activity yet.</p>
            ) : (
              <div className="space-y-3">
                {activityLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                      {activityTypeIcons[log.type] || <Clock className="h-3 w-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700 font-medium truncate">{log.description}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
