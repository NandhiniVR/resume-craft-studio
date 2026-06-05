import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from './ui/Button';
import { Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLanding = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const borderClass = isLanding
    ? scrolled
      ? 'border-white/10 bg-slate-950/80 backdrop-blur-xl'
      : 'border-transparent bg-transparent'
    : 'border-slate-200/50 bg-white/80 dark:border-slate-800/50 dark:bg-slate-950/80 backdrop-blur-xl';

  const logoTextClass = isLanding ? 'text-white' : 'text-slate-900 dark:text-white';
  const navLinkClass = isLanding
    ? 'text-slate-300 hover:text-white'
    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white';

  return (
    <header className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${borderClass}`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-outfit font-extrabold text-sm transition-transform group-hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/30">
            RC
          </div>
          <span className={`font-outfit font-bold text-base tracking-tight transition-colors ${logoTextClass}`}>
            Resume Craft <span className="text-indigo-500">Studio</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden sm:flex items-center gap-2">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`font-medium text-xs ${navLinkClass}`}
                >
                  Dashboard
                </Button>
              </Link>
              <Button
                onClick={handleLogout}
                size="sm"
                variant="outline"
                className={isLanding
                  ? 'border-white/20 text-slate-300 hover:text-white hover:bg-white/10 text-xs'
                  : 'text-xs'
                }
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`font-medium text-xs ${navLinkClass}`}
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  size="sm"
                  className="text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-0 shadow-lg shadow-indigo-600/25"
                >
                  Get Started Free
                </Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          className={`sm:hidden ${navLinkClass} focus:outline-none`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className={`sm:hidden border-t ${isLanding ? 'border-white/10 bg-slate-950/95' : 'border-slate-200 bg-white dark:bg-slate-950'} px-4 py-4 flex flex-col gap-3`}>
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-sm">Dashboard</Button>
              </Link>
              <Button variant="outline" className="w-full text-sm" onClick={() => { setMobileOpen(false); handleLogout(); }}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-sm">Sign In</Button>
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)}>
                <Button className="w-full text-sm">Get Started Free</Button>
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};
