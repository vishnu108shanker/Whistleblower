import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  MapPin, Droplet, Trash2, Zap, Heart, GraduationCap,
  ArrowRight, Search, Lock, Eye, Activity, FilePlus, ChevronRight
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Roads',       icon: MapPin,         desc: 'Potholes, obstructions, damaged signage, and roadway hazards.' },
  { name: 'Water',       icon: Droplet,        desc: 'Pipeline failures, contamination, drainage blockages.' },
  { name: 'Sanitation',  icon: Trash2,         desc: 'Waste accumulation, public sanitation failures, illegal dumping.' },
  { name: 'Electricity', icon: Zap,            desc: 'Grid outages, exposed wiring, transformer malfunctions.' },
  { name: 'Health',      icon: Heart,          desc: 'Public health violations, sanitation hazards, vector control.' },
  { name: 'Education',   icon: GraduationCap,  desc: 'Facility deficiencies, resource shortages, policy violations.' },
];

const CAPABILITIES = [
  {
    icon: Lock,
    title: '256-Bit Encrypted',
    desc: 'All submissions are encrypted in transit and at rest. Your data never leaves without authorization.',
  },
  {
    icon: Lock,
    title: 'Strictly Confidential',
    desc: 'Reporters are strictly confidential. Your identity is protected and only disclosed if you explicitly choose to do so.',
  },
  {
    icon: Activity,
    title: 'Real-Time Tracking',
    desc: 'Every report is assigned a unique token. Track investigation status live at any time.',
  },
];

export default function Home() {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const [token,   setToken]       = useState('');
  const [scores,  setScores]      = useState({});

  // Fetch real scores from API — only display if data exists
  useEffect(() => {
    api.get('/stats')
      .then(res => {
        if (res.data.success) {
          const map = {};
          res.data.stats.forEach(s => { map[s.department] = s.score; });
          setScores(map);
        }
      })
      .catch(() => {}); // Silent fail — scores are optional
  }, []);

  const handleTrack = (e) => {
    e.preventDefault();
    if (token.trim()) navigate(`/track?token=${encodeURIComponent(token.trim())}`);
  };

  return (
    <div className="bg-slate-50 dark:bg-[#0A0F1E]">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0F1E] bg-grid">
        {/* Radial glow */}
        <div className="absolute inset-0 bg-radial-[ellipse_80%_50%_at_50%_-10%] from-sky-500/8 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-24 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-sky-500/20 bg-sky-500/5 dark:bg-sky-500/8">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 tracking-wide">
              Secure Institutional Complaint Platform
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-[56px] font-extrabold font-display text-slate-900 dark:text-slate-50 tracking-tight leading-[1.1] mb-5">
            Secure.{' '}
            <span className="text-sky-500">Confidential.</span>
            {' '}Accountable.
          </h1>

          {/* Sub */}
          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Submit, track, and escalate institutional complaints with end-to-end transparency.
            Every report is encrypted, token-tracked, and investigator-assigned.
          </p>

          {/* Track input card */}
          <div className="max-w-xl mx-auto mb-10">
            <form
              onSubmit={handleTrack}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 flex gap-2 shadow-card"
            >
              <div className="relative flex-grow">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  placeholder="Enter Report ID  (e.g. WB-2026-XXXXXX)"
                  className="w-full pl-10 pr-4 py-2.5 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none text-sm font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
              >
                Track Status
              </button>
            </form>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={user ? '/report' : '/login?redirect=/report'}
              className="inline-flex items-center gap-2 border-2 border-sky-500 text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-500/10 font-semibold px-7 py-2.5 rounded-lg text-sm transition-colors w-full sm:w-auto justify-center"
            >
              <FilePlus className="w-4 h-4" />
              Submit a Complaint
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/scores"
              className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold px-7 py-3 rounded-lg text-sm transition-colors w-full sm:w-auto justify-center"
            >
              View Credibility Index
            </Link>
          </div>
          <div className="mt-4 flex justify-center">
            <Link
              to="/recent"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 text-sm font-medium transition-colors"
            >
              <Activity className="w-4 h-4" />
              View Recent Complaints
            </Link>
          </div>
        </div>
      </section>

      {/* ── Capability Strip ── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CAPABILITIES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col gap-3 shadow-soft"
            >
              <div className="w-9 h-9 rounded-lg bg-sky-500/10 dark:bg-sky-500/10 flex items-center justify-center">
                <Icon className="w-4.5 h-4.5 text-sky-500" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                {title === '256-Bit Encrypted' && <Lock className="w-3.5 h-3.5 text-sky-500" />}
                {title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Complaint Categories ── */}
      <section className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0F1E]">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="mb-10">
            <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
              Supported Complaint Categories
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5">
              Credibility scores are calculated automatically from actual resolution data.
              Displayed only when data exists.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 italic">
              * Scores reflect institutional resolution rates over the last 90 days.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
            {CATEGORIES.map(({ name, icon: Icon, desc }) => {
              const score = scores[name] ?? null;
              return (
                <div
                  key={name}
                  className="group bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-sky-500/30 dark:hover:border-sky-500/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                  onClick={() => navigate('/report')}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-sky-500/10 transition-colors">
                      <Icon className="w-4.5 h-4.5 text-slate-600 dark:text-slate-400 group-hover:text-sky-500 transition-colors" />
                    </div>
                    {score !== null ? (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        score >= 75
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                          : score >= 45
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                          : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400'
                      }`}>
                        {score}/100
                      </span>
                    ) : null}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">{name}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
                  {score !== null && (
                    <div className="mt-3 w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          score >= 75 ? 'bg-emerald-500' : score >= 45 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
