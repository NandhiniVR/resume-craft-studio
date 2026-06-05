/**
 * Analytics Service Layer.
 * Aggregates application logs and database records to calculate clean statistics
 * for Recharts visual displays and AI Career Coach insights.
 */

export interface CareerMetrics {
  totalApplications: number;
  totalInterviews: number;
  interviewRate: number; // Percentage
  offerRate: number; // Percentage
  acceptanceRate: number; // Percentage
  bySource: Array<{ name: string; value: number }>;
  byStatus: Array<{ name: string; value: number }>;
  monthlyTrend: Array<{ month: string; applications: number; interviews: number }>;
  resumePerformance: Array<{ name: string; applications: number; callbacks: number }>;
}

/**
 * Computes all metrics from raw Firestore logs synchronously.
 * Separates data processing logic from UI presentation layers.
 */
export function calculateCareerMetrics(
  applications: any[],
  interviews: any[],
  resumes: any[]
): CareerMetrics {
  const totalApplications = applications.filter(a => a.status !== 'Wishlist').length;
  const totalInterviews = interviews.length;

  // Track statuses that imply an interview callback
  const callbackStatuses = [
    'Interview Round 1',
    'Interview Round 2',
    'Interview Round 3',
    'HR Round',
    'Offer Received',
    'Joined',
  ];

  const callbacksCount = applications.filter(a => callbackStatuses.includes(a.status)).length;
  const offersCount = applications.filter(a => ['Offer Received', 'Joined'].length > 0 && (a.status === 'Offer Received' || a.status === 'Joined')).length;
  
  const interviewRate = totalApplications > 0 ? Math.round((callbacksCount / totalApplications) * 100) : 0;
  const offerRate = totalApplications > 0 ? Math.round((offersCount / totalApplications) * 100) : 0;
  const acceptanceRate = offersCount > 0 ? Math.round((applications.filter(a => a.status === 'Joined').length / offersCount) * 100) : 0;

  // Aggregate by Source
  const sourceMap: Record<string, number> = {};
  applications.forEach(a => {
    if (a.status === 'Wishlist') return;
    const src = a.source || 'Other';
    sourceMap[src] = (sourceMap[src] || 0) + 1;
  });
  const bySource = Object.entries(sourceMap).map(([name, value]) => ({ name, value }));

  // Aggregate by Status
  const statusMap: Record<string, number> = {};
  applications.forEach(a => {
    statusMap[a.status] = (statusMap[a.status] || 0) + 1;
  });
  const byStatus = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

  // Aggregate Monthly Trend (last 6 months)
  const monthMap: Record<string, { apps: number; ints: number }> = {};
  const now = new Date();
  
  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
    monthMap[label] = { apps: 0, ints: 0 };
  }

  applications.forEach(a => {
    if (a.status === 'Wishlist' || !a.dateApplied) return;
    const date = a.dateApplied.toDate ? a.dateApplied.toDate() : new Date(a.dateApplied);
    const label = date.toLocaleString('default', { month: 'short', year: '2-digit' });
    if (monthMap[label]) {
      monthMap[label].apps += 1;
    }
  });

  interviews.forEach(int => {
    if (!int.date) return;
    const date = new Date(int.date);
    const label = date.toLocaleString('default', { month: 'short', year: '2-digit' });
    if (monthMap[label]) {
      monthMap[label].ints += 1;
    }
  });

  const monthlyTrend = Object.entries(monthMap).map(([month, val]) => ({
    month,
    applications: val.apps,
    interviews: val.ints,
  }));

  // Aggregate Resume Performance
  const resumePerformance = resumes.map(res => {
    const linkedApps = applications.filter(a => a.resumeId === res.id && a.status !== 'Wishlist');
    const linkedCallbacks = linkedApps.filter(a => callbackStatuses.includes(a.status));
    return {
      name: res.title || 'Untitled Resume',
      applications: linkedApps.length,
      callbacks: linkedCallbacks.length,
    };
  });

  return {
    totalApplications,
    totalInterviews,
    interviewRate,
    offerRate,
    acceptanceRate,
    bySource,
    byStatus,
    monthlyTrend,
    resumePerformance,
  };
}
