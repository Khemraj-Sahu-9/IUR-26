import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '@/locales/translations';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations['en'];
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('asha_lang');
    return (saved === 'en' || saved === 'hi') ? saved : 'hi';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('asha_lang', newLang);
  };

  const toggleLang = () => {
    setLang(lang === 'hi' ? 'en' : 'hi');
  };

  const t = translations[lang] || translations.en;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
