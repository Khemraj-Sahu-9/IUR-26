import React, { createContext, useContext, useState, useMemo } from 'react';
import { translations, Language, TranslationKey } from '@/locales/translations';

export type TranslationFunction = {
  (key: TranslationKey | string): string;
} & Record<TranslationKey, string>;

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: TranslationFunction;
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
    const merged = {
      ...fallbackDict,
      ...currentDict,
    };

    const fn = (key: TranslationKey | string): string => {
      const k = key as string;
      return (merged as Record<string, string>)[k] || (fallbackDict as Record<string, string>)[k] || k;
    };

    return Object.assign(fn, merged) as TranslationFunction;
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
