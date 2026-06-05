import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import {
  Sparkles,
  ShieldCheck,
  FileText,
  Briefcase,
  Calendar,
  ArrowRight,
  Check,
  Zap,
  Globe,
  BarChart3,
  Star,
} from 'lucide-react';

/* ────────────────────────────────────────────────────────────
   Floating animated orb (purely decorative)
──────────────────────────────────────────────────────────── */
const Orb: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`absolute rounded-full blur-3xl opacity-25 animate-pulse pointer-events-none ${className}`} />
);

/* ────────────────────────────────────────────────────────────
   Feature card
──────────────────────────────────────────────────────────── */
interface FeatureProps {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
}
const FeatureCard: React.FC<FeatureProps> = ({ icon: Icon, title, description, gradient }) => (
  <div className="group relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 overflow-hidden">
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient}`} />
    <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 border border-white/20 text-white shadow-inner">
      <Icon className="h-5 w-5" />
    </div>
    <div className="relative z-10">
      <h3 className="text-base font-bold text-white font-outfit">{title}</h3>
      <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
  </div>
);

/* ────────────────────────────────────────────────────────────
   Stat badge
──────────────────────────────────────────────────────────── */
const StatBadge: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="flex flex-col items-center gap-1 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
    <span className="text-3xl font-extrabold font-outfit bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
      {value}
    </span>
    <span className="text-xs text-slate-400 font-medium tracking-wide">{label}</span>
  </div>
);

/* ────────────────────────────────────────────────────────────
   Step card
──────────────────────────────────────────────────────────── */
const StepCard: React.FC<{ number: string; title: string; desc: string }> = ({ number, title, desc }) => (
  <div className="relative flex flex-col items-center text-center gap-3">
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-outfit font-black text-xl shadow-lg shadow-indigo-600/30">
      {number}
    </div>
    <h3 className="text-base font-bold text-white font-outfit">{title}</h3>
    <p className="text-sm text-slate-400 leading-relaxed max-w-[200px]">{desc}</p>
  </div>
);

/* ────────────────────────────────────────────────────────────
   Main page
──────────────────────────────────────────────────────────── */
export const Landing: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  // Subtle mouse parallax on the hero gradient
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const xPct = (clientX / innerWidth - 0.5) * 20;
      const yPct = (clientY / innerHeight - 0.5) * 20;
      hero.style.backgroundPosition = `${50 + xPct}% ${50 + yPct}%`;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const features: FeatureProps[] = [
    {
      icon: FileText,
      title: 'ATS-Optimized Templates',
      description: 'Layouts engineered around recruiter-system parsing rules — no columns, no graphics, zero screen-outs.',
      gradient: 'bg-gradient-to-br from-indigo-600/10 to-transparent',
    },
    {
      icon: ShieldCheck,
      title: 'Live ATS Score Audit',
      description: 'Get instant Gemini AI reviews on keyword density, formatting compliance, and editing recommendations.',
      gradient: 'bg-gradient-to-br from-purple-600/10 to-transparent',
    },
    {
      icon: Sparkles,
      title: 'JD Match Intelligence',
      description: 'Paste any job description and get a deep match analysis with gap detection and tailoring suggestions.',
      gradient: 'bg-gradient-to-br from-cyan-600/10 to-transparent',
    },
    {
      icon: Briefcase,
      title: 'Kanban Job Tracker',
      description: 'Drag-and-drop boards spanning wishlists, assessments, interview rounds, offers, and rejections.',
      gradient: 'bg-gradient-to-br from-emerald-600/10 to-transparent',
    },
    {
      icon: Calendar,
      title: 'Interview Scheduler',
      description: 'Schedule rounds, write feedback, track preparation notes, and link everything to your application.',
      gradient: 'bg-gradient-to-br from-amber-600/10 to-transparent',
    },
    {
      icon: BarChart3,
      title: 'Career Analytics',
      description: 'Visualize monthly application trend, channel efficiency, offer rate, and get AI coaching insights.',
      gradient: 'bg-gradient-to-br from-rose-600/10 to-transparent',
    },
  ];

  const perks = [
    'AI-powered resume extraction from PDF',
    'Unlimited resume versions & history',
    'Gemini-generated cover letters',
    'One-click PDF export',
    'Dark mode workspace',
    'Real-time autosave',
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* ── HERO ───────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative overflow-hidden px-4 pt-24 pb-32 sm:px-6 lg:px-8 lg:pt-36 lg:pb-44 text-center transition-[background-position] duration-75"
        style={{
          background:
            'radial-gradient(ellipse 90% 70% at 50% -20%, hsl(243,75%,30%) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, hsl(260,80%,20%) 0%, transparent 60%), #020617',
        }}
      >
        {/* Decorative orbs */}
        <Orb className="h-96 w-96 bg-indigo-600 -top-24 -left-24" />
        <Orb className="h-64 w-64 bg-purple-700 top-32 right-0" />

        {/* Grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        <div className="relative z-10 mx-auto max-w-4xl space-y-7">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-sm">
            <Zap className="h-3.5 w-3.5 text-indigo-400" />
            Powered by Gemini 2.5 Flash — Next-Gen Career AI
          </div>

          {/* Headline */}
          <h1 className="font-outfit text-5xl font-extrabold tracking-tight sm:text-7xl leading-[1.08]">
            Craft the Perfect Resume.
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Land Your Dream Job.
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="mx-auto max-w-2xl text-base text-slate-400 sm:text-lg leading-relaxed">
            Resume Craft Studio is an AI-powered career management platform — from ATS-optimized builders and live
            score audits to Kanban job trackers and interview schedulers, all in one premium workspace.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link to="/register">
              <Button
                size="lg"
                className="relative group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-0 shadow-2xl shadow-indigo-600/40 text-white font-semibold px-8"
              >
                Start for Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/30 backdrop-blur-sm"
              >
                Sign In
              </Button>
            </Link>
          </div>

          {/* Trust line */}
          <p className="text-xs text-slate-500">
            No credit card required · Free forever on core features
          </p>
        </div>

        {/* Bottom fade */}
        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-slate-950 to-transparent" />
      </section>

      {/* ── STATS ──────────────────────────────────────────── */}
      <section className="relative px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatBadge value="92%" label="ATS Pass Rate" />
          <StatBadge value="3×" label="More Callbacks" />
          <StatBadge value="4.9★" label="User Rating" />
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
              <Globe className="h-3 w-3" />
              Everything You Need
            </div>
            <h2 className="text-3xl font-extrabold font-outfit sm:text-4xl">
              One platform. Every career tool.
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Stop juggling five different tools. Resume Craft Studio brings your entire job search into a single
              intelligent workspace.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 border-y border-white/5 bg-white/[0.02]">
        <div className="mx-auto max-w-5xl space-y-14">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold font-outfit sm:text-4xl">Get hired in 3 steps</h2>
            <p className="text-sm text-slate-400">From blank slate to offer letter — faster than ever.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 relative">
            {/* connector line */}
            <div className="hidden sm:block absolute top-7 left-[16%] right-[16%] h-px bg-gradient-to-r from-indigo-600/0 via-indigo-600/50 to-indigo-600/0" />
            <StepCard number="1" title="Build Your Resume" desc="Choose a template, fill in details, and let AI polish every bullet." />
            <StepCard number="2" title="Run ATS Audit" desc="Paste a job description and get a real-time compliance score." />
            <StepCard number="3" title="Track & Win" desc="Manage every application on a Kanban board until you land the offer." />
          </div>
        </div>
      </section>

      {/* ── PERKS LIST ─────────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl grid gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Check className="h-3 w-3" />
              Included Free
            </div>
            <h2 className="text-3xl font-extrabold font-outfit leading-tight">
              Everything a modern job seeker needs
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              No paywalls on the essentials. Every core feature — resume building, ATS auditing, job tracking — is
              available from day one.
            </p>
            <Link to="/register">
              <Button
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-0 shadow-xl shadow-indigo-600/30 font-semibold"
              >
                Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {perks.map((perk) => (
              <div
                key={perk}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm text-slate-300 font-medium">{perk}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 border-t border-white/5 bg-white/[0.015]">
        <div className="mx-auto max-w-5xl space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold font-outfit sm:text-3xl">Loved by job seekers everywhere</h2>
            <p className="text-sm text-slate-400">Real stories from people who landed their roles with Resume Craft Studio.</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {[
              {
                quote: "The ATS audit caught formatting issues my old resume had for months. Got a callback within 3 days of fixing them.",
                name: 'Priya K.',
                role: 'Frontend Engineer @ Google',
              },
              {
                quote: "I imported my old PDF, the AI reconstructed it perfectly, and I had a polished resume ready in under 10 minutes.",
                name: 'Marcus L.',
                role: 'Product Manager @ Stripe',
              },
              {
                quote: "The Kanban board keeps my applications organized across 40+ companies. I finally feel in control of my job search.",
                name: 'Aisha T.',
                role: 'Data Scientist @ OpenAI',
              },
            ].map((t) => (
              <div
                key={t.name}
                className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
              >
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed flex-1">"{t.quote}"</p>
                <div>
                  <p className="text-sm font-bold text-white font-outfit">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FOOTER ─────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8 text-center">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 50%, hsl(243,75%,25%) 0%, transparent 70%), #020617',
          }}
        />
        <Orb className="h-80 w-80 bg-indigo-700 top-0 left-1/4 -translate-x-1/2" />
        <Orb className="h-56 w-56 bg-purple-700 bottom-0 right-1/4 translate-x-1/2" />
        <div className="relative z-10 mx-auto max-w-2xl space-y-6">
          <h2 className="text-3xl font-extrabold font-outfit sm:text-5xl leading-tight">
            Ready to take control of your career?
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Join thousands of job seekers who have streamlined their search, optimized their resumes, and landed more
            callbacks — all with Resume Craft Studio.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link to="/register">
              <Button
                size="lg"
                className="bg-white text-slate-950 hover:bg-slate-100 font-bold shadow-2xl shadow-white/10 px-8"
              >
                Create My Free Account <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <p className="text-xs text-slate-600">No credit card required. Free plan. Cancel anytime.</p>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-outfit font-extrabold text-xs">
              RC
            </div>
            <span className="font-outfit font-bold text-sm text-slate-400">Resume Craft Studio</span>
          </div>
          <p className="text-xs text-slate-600">© 2026 Resume Craft Studio. Built for professionals.</p>
          <div className="flex gap-4">
            <Link to="/login" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Login</Link>
            <Link to="/register" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
