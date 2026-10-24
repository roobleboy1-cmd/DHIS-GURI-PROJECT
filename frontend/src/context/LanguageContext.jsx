import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../locales/translations';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('guridhis_lang') || 'so';
  });

  const setLang = (newLang) => {
    if (newLang === 'so' || newLang === 'en') {
      setLangState(newLang);
      localStorage.setItem('guridhis_lang', newLang);
      document.documentElement.setAttribute('lang', newLang);
    }
  };

  const toggleLang = () => {
    setLang(lang === 'so' ? 'en' : 'so');
  };

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const t = (key, fallback) => {
    if (!key) return '';
    const currentDict = translations[lang] || translations.so;
    if (currentDict && currentDict[key] !== undefined) {
      return currentDict[key];
    }
    // Fallback to English dict if not in Somali
    if (translations.en && translations.en[key] !== undefined) {
      return translations.en[key];
    }
    return fallback !== undefined ? fallback : key;
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        t,
        isSomali: lang === 'so'
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
