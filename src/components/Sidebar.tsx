import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from './ui/Avatar';
import {
  LayoutDashboard,
  User,
  FileText,
  FileEdit,
  ShieldCheck,
  Sparkles,
  Briefcase,
  Calendar,
  Award,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

const menuGroups = [
  {
    label: 'Workspace',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/profile', label: 'My Profile', icon: User },
    ],
  },
  {
    label: 'Resume & AI',
    items: [
      { to: '/resumes', label: 'My Resumes', icon: FileText },
      { to: '/cover-letters', label: 'Cover Letters', icon: FileEdit },
      { to: '/ats-analysis', label: 'ATS Auditor', icon: ShieldCheck },
      { to: '/job-match', label: 'JD Match', icon: Sparkles },
    ],
  },
  {
    label: 'Job Search',
    items: [
      { to: '/applications', label: 'Applications', icon: Briefcase },
      { to: '/interviews', label: 'Interviews', icon: Calendar },
      { to: '/certificates', label: 'Certificates', icon: Award },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const { profile, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const completionPct = (() => {
    if (!profile) return 0;
    const fields = [
      profile.fullName, profile.email, profile.phone, profile.location,
      profile.linkedIn, profile.gitHub, profile.portfolio,
      profile.professionalTitle,
      profile.yearsOfExperience !== 0,
      profile.skills?.length > 0,
      profile.profilePhoto,
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  })();

  const SidebarContent = () => (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200/60 dark:border-slate-800/50 bg-white dark:bg-slate-950">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-100 dark:border-slate-800/50 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-outfit font-extrabold text-xs shadow-md shadow-indigo-600/30">
          RC
        </div>
        <span className="font-outfit font-bold text-sm text-slate-900 dark:text-white">
          Resume Craft <span className="text-indigo-600 dark:text-indigo-400">Studio</span>
        </span>
      </div>

      {/* User card */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800/50">
        <div className="flex items-center gap-3 mb-3">
          <Avatar
            src={profile?.profilePhoto}
            fallback={profile?.fullName || 'User'}
            className="h-9 w-9 ring-2 ring-indigo-100 dark:ring-indigo-900/50"
          />
          <div className="overflow-hidden flex-1">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate font-outfit">
              {profile?.fullName || 'Anonymous User'}
            </h4>
            <p className="text-[10px] text-slate-400 truncate">
              {profile?.professionalTitle || 'Career Builder'}
            </p>
          </div>
        </div>

        {/* Profile completion */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-medium">Profile strength</span>
            <span className={`text-[10px] font-bold ${completionPct >= 80 ? 'text-emerald-600' : completionPct >= 50 ? 'text-amber-600' : 'text-indigo-600'}`}>
              {completionPct}%
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${completionPct >= 80 ? 'bg-emerald-500' : completionPct >= 50 ? 'bg-amber-500' : 'bg-indigo-600'}`}
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation groups */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {menuGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="px-3 pb-1 text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-150 ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                      <span className="flex-1">{item.label}</span>
                      {isActive && <ChevronRight className="h-3 w-3 text-indigo-400 opacity-60" />}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-150"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex h-14 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 md:hidden sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-outfit font-extrabold text-xs">RC</div>
          <span className="font-outfit font-bold text-sm text-slate-900 dark:text-white tracking-tight">Resume Craft Studio</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-slate-500 dark:text-slate-400 focus:outline-none hover:text-slate-900 dark:hover:text-white"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:h-screen md:sticky md:top-0 md:shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile drawer */}
      {isOpen && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm md:hidden"
          />
          <div className="fixed inset-y-0 left-0 z-50 md:hidden">
            <SidebarContent />
          </div>
        </>
      )}
    </>
  );
};
