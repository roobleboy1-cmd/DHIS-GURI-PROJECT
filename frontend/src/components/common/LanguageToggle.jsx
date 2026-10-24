import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

const LanguageToggle = ({ className = '', showLabel = true }) => {
  const { lang, toggleLang, isSomali } = useLanguage();
  const { isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleLang}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-200 select-none ${
        isDark
          ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750 hover:border-slate-600 shadow-sm'
          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-xs'
      } ${className}`}
      title={isSomali ? 'Switch to English' : 'U beddel Af-Soomaali'}
      aria-label="Toggle language"
    >
      <Globe className="w-3.5 h-3.5 text-orange-500" />
      <span className="flex items-center gap-1">
        <span className={isSomali ? 'text-orange-500 font-extrabold' : 'text-slate-400 font-normal'}>SO</span>
        <span className="text-slate-400">/</span>
        <span className={!isSomali ? 'text-orange-500 font-extrabold' : 'text-slate-400 font-normal'}>EN</span>
      </span>
      {showLabel && (
        <span className="hidden sm:inline text-[11px] font-medium text-slate-500 dark:text-slate-400 ml-1">
          {isSomali ? 'Soomaali' : 'English'}
        </span>
      )}
    </button>
  );
};

export default LanguageToggle;
