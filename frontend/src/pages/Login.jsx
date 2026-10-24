import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Building2,
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  HardHat,
  Home,
  Hammer,
  Zap,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import InputField from '../components/forms/InputField';
import ThemeToggle from '../components/common/ThemeToggle';
import LanguageToggle from '../components/common/LanguageToggle';

const Login = () => {
  const { login } = useAuth();
  const { t, isSomali } = useLanguage();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('admin@guridhis.com');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState(null);
  const [error, setError] = useState('');

  const redirectPath = new URLSearchParams(location.search).get('redirect') || '/dashboard';

  // Standard form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(
        err.message ||
          (isSomali
            ? 'Xogta galitaanka ma saxna. Fadlan hubi email-ka iyo furaha sirta.'
            : 'Invalid credentials. Please verify your email and password.')
      );
    } finally {
      setLoading(false);
    }
  };

  // Instant 1-Click Auto Login for Role Cards
  const handleQuickLogin = async (roleEmail, rolePassword, roleKey) => {
    setEmail(roleEmail);
    setPassword(rolePassword);
    setError('');
    setLoadingRole(roleKey);
    setLoading(true);

    try {
      await login(roleEmail, rolePassword);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(
        err.message ||
          (isSomali
            ? 'Khalad ayaa dhacay intii lagu jiray galitaanka tooska ah.'
            : 'An error occurred during quick auto-login.')
      );
    } finally {
      setLoading(false);
      setLoadingRole(null);
    }
  };

  const roleAccounts = [
    {
      key: 'admin',
      roleName: isSomali ? 'Maamulaha Guud' : 'Administrator',
      roleBadge: 'Admin',
      name: 'System Admin',
      email: 'admin@guridhis.com',
      password: 'Admin@123',
      icon: ShieldCheck,
      color: 'from-purple-500 to-indigo-600',
      borderColor: 'border-purple-200 dark:border-purple-900/60 hover:border-purple-500',
      badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
      desc: isSomali ? 'Xakameynta buuxda ee nidaamka' : 'Full system control & oversight'
    },
    {
      key: 'engineer',
      roleName: isSomali ? 'Injineer Sare' : 'Lead Engineer',
      roleBadge: 'Engineer',
      name: 'Eng. Fadumo',
      email: 'fadumo.eng@guridhis.com',
      password: 'Engineer@123',
      icon: HardHat,
      color: 'from-sky-500 to-blue-600',
      borderColor: 'border-sky-200 dark:border-sky-900/60 hover:border-sky-500',
      badgeBg: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
      desc: isSomali ? 'Naqshadaha & kormeerka dhismaha' : 'Blueprints & technical supervision'
    },
    {
      key: 'client',
      roleName: isSomali ? 'Macmiilka Guriga' : 'Client Owner',
      roleBadge: 'Client',
      name: 'Cabdiweli (Macmiil)',
      email: 'abdiweli.client@guridhis.com',
      password: 'Client@123',
      icon: Home,
      color: 'from-emerald-500 to-teal-600',
      borderColor: 'border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-500',
      badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
      desc: isSomali ? 'Dalbashada guryaha & horumarka' : 'Track house requests & progress'
    },
    {
      key: 'worker',
      roleName: isSomali ? 'Shaqaale Dhismaha' : 'Field Specialist',
      roleBadge: 'Worker',
      name: 'Cali (Shaqaale)',
      email: 'ali.worker@guridhis.com',
      password: 'Worker@123',
      icon: Hammer,
      color: 'from-amber-500 to-orange-600',
      borderColor: 'border-amber-200 dark:border-amber-900/60 hover:border-amber-500',
      badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
      desc: isSomali ? 'Diiwaanka howlaha maalinlaha' : 'Daily work logs & site activities'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col justify-center py-10 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Top Floating Controls: Language & Theme */}
      <div className="fixed top-4 right-4 z-20 flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform">
            <Building2 className="w-7 h-7" />
          </div>
        </Link>
        <h2 className="text-2xl font-black text-[#123c69] dark:text-white tracking-tight">
          GURI DHIS
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          {t('login_subtitle', 'Sign in to access your construction management workspace')}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-7 px-6 sm:px-9 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/40 space-y-5 transition-all">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label={t('email_label', 'Email Address')}
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              icon={Mail}
              required
            />

            <InputField
              label={t('password_label', 'Password')}
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={Lock}
              required
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-800"
                />
                <span>{t('remember_me', 'Remember me')}</span>
              </label>

              <Link
                to="/forgot-password"
                className="font-semibold text-[#123c69] dark:text-orange-400 hover:text-orange-600 transition-colors"
              >
                {t('forgot_password', 'Forgot password?')}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#123c69] hover:bg-[#1a4f8a] active:bg-[#0d2d4f] shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && !loadingRole ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t('signing_in', 'Signing in...')}</span>
                </>
              ) : (
                <>
                  <span>{t('sign_in_btn', 'Sign In')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-center text-xs text-slate-500 dark:text-slate-400">
            {t('dont_have_account', "Don't have an account yet?")}{' '}
            <Link
              to="/register"
              className="font-bold text-[#123c69] dark:text-orange-400 hover:text-orange-500 transition-colors"
            >
              {t('create_account', 'Create Account')}
            </Link>
          </div>
        </div>

        {/* 4 Quick Role Auto-Login Cards */}
        <div className="mt-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-lg shadow-slate-200/40 dark:shadow-black/30 space-y-3.5 transition-all">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center text-orange-500">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  {t('quick_role_login', 'Quick Role Login (1-Click Auto Login):')}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  {t('quick_login_hint', 'Click any role below to log in directly without typing')}
                </p>
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {roleAccounts.map((item) => {
              const Icon = item.icon;
              const isCurrentLoading = loadingRole === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin(item.email, item.password, item.key)}
                  className={`group relative p-3 rounded-2xl border text-left transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    item.borderColor
                  } ${
                    isCurrentLoading
                      ? 'bg-orange-50/80 dark:bg-orange-950/30 border-orange-500 scale-[0.99] ring-2 ring-orange-500/20'
                      : 'bg-slate-50/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shadow-sm shrink-0 group-hover:scale-105 transition-transform`}
                      >
                        {isCurrentLoading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-extrabold text-xs text-slate-800 dark:text-white truncate">
                            {item.roleName}
                          </p>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                          {item.email}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded-md shrink-0 uppercase tracking-wider ${item.badgeBg}`}
                    >
                      {item.roleBadge}
                    </span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 dark:text-slate-400 truncate max-w-[170px]">
                      {item.desc}
                    </span>
                    <span className="font-bold text-orange-500 dark:text-orange-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 shrink-0">
                      {isCurrentLoading ? (
                        <span>{isSomali ? 'Galaya...' : 'Logging in...'}</span>
                      ) : (
                        <>
                          <span>{isSomali ? 'Toos u gal' : 'Auto Login'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </>
                      )}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="text-center pt-1">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>
                {isSomali
                  ? 'Guji doorka aad doonto — wuxuu ku geynayaa dashboodhkiisa si toos ah'
                  : 'Click any role — automatically signs in and navigates to its dashboard'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
