import React from 'react';
import { Calendar, ShieldCheck, HardHat, User, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const getGreeting = (isSomali) => {
  const hour = new Date().getHours();
  if (isSomali) {
    if (hour < 12) return 'Subax wanaagsan';
    if (hour < 18) return 'Galab wanaagsan';
    return 'Habeen wanaagsan';
  }
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const getRoleBadge = (role, isSomali) => {
  switch (role) {
    case 'admin':
      return {
        label: isSomali ? 'Maamulaha Guud ee Nidaamka' : 'System Administrator',
        icon: ShieldCheck,
        color: 'bg-rose-500/20 text-rose-200 border-rose-500/30'
      };
    case 'engineer':
      return {
        label: isSomali ? 'Injineer Sare ee Dhismaha' : 'Licensed Lead Engineer',
        icon: HardHat,
        color: 'bg-sky-500/20 text-sky-200 border-sky-500/30'
      };
    case 'worker':
      return {
        label: isSomali ? 'Khabiirka Shaqada Goobta' : 'Certified Site Specialist',
        icon: HardHat,
        color: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30'
      };
    case 'client':
    default:
      return {
        label: isSomali ? 'Milkiilaha Guriga (Macmiil)' : 'Verified Property Owner',
        icon: User,
        color: 'bg-orange-500/20 text-orange-200 border-orange-500/30'
      };
  }
};

const WelcomeBanner = ({ subtitle, actions }) => {
  const { user } = useAuth();
  const { isSomali, t } = useLanguage();
  const greeting = getGreeting(isSomali);
  const roleBadge = getRoleBadge(user?.role, isSomali);
  const Icon = roleBadge.icon;

  const todayFormatted = new Intl.DateTimeFormat(isSomali ? 'so-SO' : 'en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const defaultSubtitle = isSomali
    ? 'Kormeerka tooska ah ee mashaariicda, naqshadaha guryaha, iyo howsha dhismaha goobaha.'
    : 'Real-time construction management, catalog engineering, and site execution.';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d2d4f] via-[#123C69] to-[#1a4f8a] text-white p-6 sm:p-8 shadow-xl border border-white/10 dark:border-slate-800">
      {/* Subtle background glow circles */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-orange-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 rounded-full bg-blue-400/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          {/* Top Pill Meta */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-xs ${roleBadge.color}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {roleBadge.label}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-slate-200 border border-white/10">
              <Calendar className="w-3.5 h-3.5 text-orange-300" />
              {todayFormatted}
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <span>
              {greeting}, {user?.full_name?.split(' ')[0] || (isSomali ? 'Isticmaale' : 'User')}
            </span>
            <Sparkles className="w-5 h-5 text-orange-400 shrink-0 hidden sm:inline" />
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            {subtitle || defaultSubtitle}
          </p>
        </div>

        {/* Action Buttons */}
        {actions && (
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeBanner;
