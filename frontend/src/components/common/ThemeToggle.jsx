import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

const ThemeToggle = ({ className = '', showLabel = false }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 select-none ${
        isDark
          ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-750 hover:border-amber-400/50 shadow-sm'
          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-xs'
      } ${className}`}
      title={isDark ? t('light_mode', 'Light Mode') : t('dark_mode', 'Dark Mode')}
      aria-label="Toggle dark/light theme"
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-200" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-600 animate-in spin-in-90 duration-200" />
        )}
      </div>
      {showLabel && (
        <span className="text-xs font-medium">
          {isDark ? t('light_mode', 'Light Mode') : t('dark_mode', 'Dark Mode')}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
