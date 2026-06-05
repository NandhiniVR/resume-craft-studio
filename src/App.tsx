import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// Public pages
import { Landing } from '@/pages/Landing';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { ForgotPassword } from '@/pages/ForgotPassword';

// App pages
import { Dashboard } from '@/pages/Dashboard';
import { Onboarding } from '@/pages/Onboarding';
import { Profile } from '@/pages/Profile';
import { Resumes } from '@/pages/Resumes';
import { ResumeBuilder } from '@/pages/ResumeBuilder';
import { CoverLetters } from '@/pages/CoverLetters';
import { AtsAnalysis } from '@/pages/AtsAnalysis';
import { JobMatch } from '@/pages/JobMatch';
import { Applications } from '@/pages/Applications';
import { Interviews } from '@/pages/Interviews';
import { Certificates } from '@/pages/Certificates';
import { Analytics } from '@/pages/Analytics';
import { Settings } from '@/pages/Settings';

// Layouts and components
import { Sidebar } from '@/components/Sidebar';
import { ToastContainer, toast } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Protected Route Guard
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, initialized, loading, onboarding, verifyEmail, reloadUser, logout } = useAuthStore();
  const location = useLocation();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);

  if (!initialized || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-650" />
          <span className="text-xs font-semibold text-slate-500">Loading Resume Craft workspace...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 1. Email Verification Guard (Only for email/password auth, Google is pre-verified)
  if (!user.emailVerified) {
    const handleResend = async () => {
      setResending(true);
      try {
        await verifyEmail();
        toast.success('Verification email sent! Please check your inbox.');
      } catch (err: any) {
        toast.error(err.message || 'Failed to send verification email.');
      } finally {
        setResending(false);
      }
    };

    const handleCheckVerification = async () => {
      setChecking(true);
      try {
        await reloadUser();
        toast.info('Checking verification status...');
      } catch (err) {
        toast.error('Failed to reload verification status.');
      } finally {
        setChecking(false);
      }
    };

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl text-center space-y-6">
          <div className="mx-auto h-16 w-16 bg-indigo-50 dark:bg-indigo-950/40 rounded-full flex items-center justify-center text-indigo-600">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-850 dark:text-white font-outfit">Verify your Email</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              We've sent a verification link to <span className="font-semibold text-slate-700 dark:text-slate-350">{user.email}</span>. Please verify your email address to unlock private dashboard features.
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <button
              type="button"
              onClick={handleCheckVerification}
              disabled={checking}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold h-10 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {checking && <div className="h-3 w-3 animate-spin border-2 border-white border-t-transparent rounded-full" />}
              I've Verified My Email
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-semibold h-9 rounded-lg transition-colors disabled:opacity-50"
              >
                {resending ? 'Sending...' : 'Resend Link'}
              </button>
              <button
                type="button"
                onClick={() => logout()}
                className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-red-500 text-[10px] font-semibold h-9 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Onboarding Completion Guard
  const isOnboardingPath = location.pathname === '/onboarding';
  
  if (onboarding && !onboarding.completed && !isOnboardingPath) {
    return <Navigate to="/onboarding" replace />;
  }

  if (onboarding && onboarding.completed && isOnboardingPath) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Application Layout Frame (With Sidebar)
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  const { settings } = useAuthStore();

  // Initialize theme class dynamically on load/change
  useEffect(() => {
    if (settings?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings?.theme]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Onboarding */}
          <Route
            path="/onboarding"
            element={
              <AuthGuard>
                <Onboarding />
              </AuthGuard>
            }
          />

          {/* Private SaaS Workspace Routes */}
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/profile"
            element={
              <AuthGuard>
                <AppLayout>
                  <Profile />
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/resumes"
            element={
              <AuthGuard>
                <AppLayout>
                  <Resumes />
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/resume-builder"
            element={
              <AuthGuard>
                <AppLayout>
                  <ResumeBuilder />
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/resumes/:resumeId/edit"
            element={
              <AuthGuard>
                <AppLayout>
                  <ResumeBuilder />
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/cover-letters"
            element={
              <AuthGuard>
                <AppLayout>
                  <CoverLetters />
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/ats-analysis"
            element={
              <AuthGuard>
                <AppLayout>
                  <AtsAnalysis />
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/job-match"
            element={
              <AuthGuard>
                <AppLayout>
                  <JobMatch />
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/applications"
            element={
              <AuthGuard>
                <AppLayout>
                  <Applications />
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/interviews"
            element={
              <AuthGuard>
                <AppLayout>
                  <Interviews />
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/certificates"
            element={
              <AuthGuard>
                <AppLayout>
                  <Certificates />
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/analytics"
            element={
              <AuthGuard>
                <AppLayout>
                  <Analytics />
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/settings"
            element={
              <AuthGuard>
                <AppLayout>
                  <Settings />
                </AppLayout>
              </AuthGuard>
            }
          />

          {/* Catch-all fallback redirection */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
