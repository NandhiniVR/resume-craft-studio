import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/Toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Moon, Sun, Shield, Trash2, Key } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, settings, updateSettings, loading } = useAuthStore();
  const { toast } = useToast();

  const handleThemeChange = async (theme: 'light' | 'dark') => {
    try {
      await updateSettings({ theme });
      toast({
        title: 'Theme updated',
        description: `Theme successfully changed to ${theme} mode.`,
      });
      
      // Update class in index.html/document
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (err: any) {
      toast({
        title: 'Failed to update theme',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const handleNotificationToggle = async () => {
    if (!settings) return;
    const newValue = !settings.emailNotifications;
    try {
      await updateSettings({ emailNotifications: newValue });
      toast({
        title: 'Notifications updated',
        description: newValue 
          ? 'You will now receive email notifications for analysis and updates.' 
          : 'Email notifications disabled.',
      });
    } catch (err: any) {
      toast({
        title: 'Update failed',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight font-outfit text-slate-900 dark:text-white">
          Account Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your system configurations, user interface theme, and notifications.
        </p>
      </div>

      <div className="space-y-6">
        {/* Preference Settings */}
        <Card className="border border-slate-200/60 shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="border-b border-slate-150/40 pb-4">
            <CardTitle className="font-outfit text-md font-semibold text-slate-800 dark:text-white">
              App Preferences
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Customize the look and feel of your Career Hub workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Dark Mode toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  Appearance Mode
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Switch between light and dark themes.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={`p-1.5 rounded-md transition-all ${
                    settings?.theme === 'light'
                      ? 'bg-white text-indigo-650 shadow-sm'
                      : 'text-slate-400 hover:text-slate-650'
                  }`}
                  disabled={loading}
                >
                  <Sun className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  className={`p-1.5 rounded-md transition-all ${
                    settings?.theme === 'dark'
                      ? 'bg-slate-950 text-indigo-400 shadow-sm'
                      : 'text-slate-505 hover:text-indigo-400'
                  }`}
                  disabled={loading}
                >
                  <Moon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/60 my-4" />

            {/* Email notification preferences */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  Email Notifications
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Receive email briefings and alerts on your ATS audit feedback.
                </p>
              </div>
              <button
                type="button"
                onClick={handleNotificationToggle}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings?.emailNotifications ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                }`}
                disabled={loading}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings?.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Security & Account Card */}
        <Card className="border border-slate-200/60 shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="border-b border-slate-150/40 pb-4">
            <CardTitle className="font-outfit text-md font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <Shield className="h-4 w-4 text-indigo-600" /> Account Security
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-indigo-600">
                <Key className="h-5 w-5" />
              </div>
              <div className="space-y-1.5 flex-1">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Account Credentials
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Logged in as: <span className="font-medium text-slate-700 dark:text-slate-350">{user?.email}</span>
                </p>
                <div className="flex gap-2 pt-2">
                  <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] py-0.5">
                    Provider: {user?.providerData[0]?.providerId || 'email'}
                  </Badge>
                  {user?.emailVerified ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-250 text-[10px] py-0.5">
                      Verified Account
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-[10px] py-0.5">
                      Unverified Account
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border border-red-200/60 dark:border-red-950 shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="border-b border-red-100/40 pb-4">
            <CardTitle className="font-outfit text-md font-semibold text-red-600 flex items-center gap-2">
              <Trash2 className="h-4 w-4" /> Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-850 dark:text-slate-200">
                  Delete Account
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Permanently delete your profile, resume files, and all custom cover letters.
                </p>
              </div>
              <Button
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs py-2 px-4 shadow-sm"
                onClick={() => {
                  toast({
                    title: 'Action Unavailable',
                    description: 'For your security, account deletion is managed via customer support.',
                    variant: 'destructive',
                  });
                }}
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
