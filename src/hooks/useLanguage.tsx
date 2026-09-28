import React, { createContext, useContext, useState, useMemo } from 'react';
import { translations, Language, TranslationKey } from '@/locales/translations';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Record<TranslationKey, string>;
  toggleLang: () => void;
  availableLanguages: { code: Language; label: string; nativeLabel: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const AVAILABLE_LANGUAGES: { code: Language; label: string; nativeLabel: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
];

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('asha_lang');
      return (saved === 'en' || saved === 'hi') ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('asha_lang', newLang);
      document.documentElement.lang = newLang;
    } catch (err) {
      console.warn('Could not persist language preference:', err);
    }
  };

  const toggleLang = () => {
    setLangState((prev) => {
      const next: Language = prev === 'hi' ? 'en' : 'hi';
      try {
        localStorage.setItem('asha_lang', next);
        document.documentElement.lang = next;
      } catch {
        /* fallback */
      }
      return next;
    });
  };

  // Safe fallback translation dictionary: English acts as universal fallback for missing keys
  const t = useMemo(() => {
    const currentDict = translations[lang] || translations.en;
    const fallbackDict = translations.en;

    // Merge fallback so every key is guaranteed to resolve
    return {
      ...fallbackDict,
      ...currentDict,
    } as Record<TranslationKey, string>;
  }, [lang]);

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t,
        toggleLang,
        availableLanguages: AVAILABLE_LANGUAGES,
      }}
    >
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
