import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { Language } from '@/locales/translations';

interface LanguageSelectorProps {
  variant?: 'header' | 'inline' | 'compact';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { lang, setLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const languages: { code: Language; label: string; nativeLabel: string }[] = [
    { code: 'en', label: 'English', nativeLabel: 'English' },
    { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (code: Language) => {
    setLang(code);
    setIsOpen(false);
  };

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {languages.map((l) => {
          const isSelected = l.code === lang;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => handleSelect(l.code)}
              aria-pressed={isSelected}
              className={`min-h-[48px] px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600 ring-offset-2'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>{l.nativeLabel}</span>
              {isSelected && <Check className="w-4 h-4 ml-1" />}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select Language / भाषा चुनें"
        title="Change Language"
        className="min-h-[44px] px-3 py-1.5 flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-semibold text-xs transition-colors shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="font-bold text-slate-800">
          {lang === 'hi' ? 'हिन्दी' : 'EN'}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Languages"
          className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-white border border-slate-200 shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3 py-1.5 border-b border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Language / भाषा
            </p>
          </div>
          {languages.map((l) => {
            const isSelected = l.code === lang;
            return (
              <button
                key={l.code}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(l.code)}
                className={`w-full min-h-[48px] px-3.5 py-2.5 flex items-center justify-between text-left text-sm transition-colors ${
                  isSelected
                    ? 'bg-emerald-50 text-emerald-900 font-bold'
                    : 'text-slate-700 hover:bg-slate-50 font-medium'
                }`}
              >
                <div className="flex flex-col">
                  <span>{l.nativeLabel}</span>
                  <span className="text-[11px] text-slate-400 font-normal">{l.label}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
