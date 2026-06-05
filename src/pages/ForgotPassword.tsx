import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { toast } from '@/components/ui/Toast';

export const ForgotPassword: React.FC = () => {
  const { resetPassword } = useAuthStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your email.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      await resetPassword(email);
      setSuccess(true);
      toast.success('Password reset link sent to your email.');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      {/* Background radial effects */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] opacity-30" />

      <Card className="w-full max-w-md shadow-xl border-slate-200/60 dark:border-slate-800/40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
        <CardHeader className="text-center">
          <Link to="/" className="inline-flex items-center gap-1.5 justify-center mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-outfit font-extrabold text-sm shadow-md shadow-indigo-650/20">
              RC
            </div>
            <span className="font-outfit font-bold text-base tracking-tight text-slate-800 dark:text-slate-200">
              Resume Craft Studio
            </span>
          </Link>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            We'll email you a link to reset your account password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {success ? (
            <div className="space-y-4 text-center">
              <div className="p-3 text-xs bg-emerald-50 border border-emerald-250 rounded-lg text-emerald-800 font-semibold dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400">
                Check your inbox! We've sent a password reset email to <strong>{email}</strong>.
              </div>
              <Link to="/login">
                <Button className="w-full">Return to Sign In</Button>
              </Link>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div className="p-3 text-xs bg-red-50 border border-red-200 rounded-lg text-red-750 font-medium dark:bg-red-950/20 dark:border-red-900/40 dark:text-red-400">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full font-medium" loading={loading}>
                  Send Reset Link
                </Button>
              </form>

              <p className="text-center text-xs text-slate-500 mt-6">
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="text-indigo-650 font-bold hover:underline hover:text-indigo-700"
                >
                  Sign In
                </Link>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
export default ForgotPassword;
