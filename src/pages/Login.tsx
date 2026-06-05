import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toast';
import { Eye, EyeOff, Mail, Lock, Sparkles } from 'lucide-react';

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24">
    <path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 12 4.9c1.76 0 3.35.65 4.58 1.7l3.4-3.4A12 12 0 0 0 .14 10.68l3.84 2.98a7.14 7.14 0 0 1 1.29-3.9z"/>
    <path fill="#34A853" d="M12 19.1a7.08 7.08 0 0 1-6.73-4.88L1.43 17.2A12 12 0 0 0 12 24c3.23 0 5.96-1.18 8-3.11l-3.61-2.8c-1.17.67-2.6 1-4.39 1z"/>
    <path fill="#FBBC05" d="M19.83 5.2c.47.88.82 1.84.99 2.87H12v4.52h6.96c-.35 1.58-1.26 2.93-2.61 3.82l3.61 2.8C21.82 17.08 23 14.74 23 12c0-.82-.1-1.62-.27-2.4L19.83 5.2z"/>
    <path fill="#4285F4" d="M12 9.07h10.73a12.18 12.18 0 0 0-.17-2.15l-10.56.01v2.14z"/>
  </svg>
);

export const Login: React.FC = () => {
  const { login, loginWithGoogle } = useAuthStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setErrorMsg('Please fill in all fields.'); return; }
    setLoading(true);
    setErrorMsg(null);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setErrorMsg(null);
    try {
      await loginWithGoogle();
      toast.success('Signed in with Google!');
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col items-start justify-between p-12 overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 70% at 30% 30%, hsl(243,75%,28%) 0%, transparent 65%), radial-gradient(ellipse 60% 60% at 80% 80%, hsl(260,80%,20%) 0%, transparent 60%), #020617',
          }}
        />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-outfit font-extrabold text-sm shadow-lg shadow-indigo-600/30">RC</div>
          <span className="font-outfit font-bold text-white text-base">Resume Craft <span className="text-indigo-400">Studio</span></span>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
            <Sparkles className="h-3 w-3" /> AI-Powered Career Platform
          </div>
          <h1 className="font-outfit text-4xl font-extrabold text-white leading-tight">
            Your next role<br />starts here.
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
            Join thousands of professionals who use Resume Craft Studio to land callbacks and track their job search smarter.
          </p>

          {/* Feature pills */}
          <div className="flex flex-col gap-2">
            {['ATS-Optimized Resume Builder', 'Gemini AI Score & Match Analysis', 'Kanban Application Tracker'].map(f => (
              <div key={f} className="flex items-center gap-2 text-xs text-slate-300">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-600">© 2026 Resume Craft Studio</p>
      </div>

      {/* Right Panel — Form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 bg-white dark:bg-slate-900">
        <div className="w-full max-w-sm space-y-7">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-outfit font-extrabold text-xs">RC</div>
              <span className="font-outfit font-bold text-slate-900 dark:text-white text-sm">Resume Craft Studio</span>
            </Link>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold font-outfit text-slate-900 dark:text-white">Welcome back</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Sign in to your workspace</p>
          </div>

          {/* Google button */}
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2.5 h-11 font-medium text-sm border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            onClick={handleGoogle}
            loading={googleLoading}
          >
            <GoogleIcon />
            Continue with Google
          </Button>

          <div className="relative flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">or</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 px-4 py-3 text-xs text-red-600 dark:text-red-400 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Email/password form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-9 h-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-9 pr-10 h-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-semibold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-0 shadow-lg shadow-indigo-600/25"
              loading={loading}
            >
              Sign In
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-700">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
