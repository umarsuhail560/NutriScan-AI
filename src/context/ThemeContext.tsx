import React, { createContext, useContext, useEffect, useState } from 'react';
import { LANGUAGE_META, SupportedLanguage, TRANSLATIONS, Translations } from '../i18n/translations';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  language: SupportedLanguage;
  setLanguage: (lang: string) => void;
  t: Translations;
  isRTL: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function isSupportedLanguage(val: string): val is SupportedLanguage {
  return val in TRANSLATIONS;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('nutriscan_theme');
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });

  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('nutriscan_lang') || 'English';
    return isSupportedLanguage(saved) ? saved : 'English';
  });

  useEffect(() => {
    localStorage.setItem('nutriscan_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'dark' ? '#020617' : '#10B981');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('nutriscan_lang', language);
    const meta = LANGUAGE_META[language];
    document.documentElement.lang = meta.code;
    document.documentElement.dir = meta.dir;
  }, [language]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (next: Theme) => {
    setThemeState(next);
  };

  const setLanguage = (lang: string) => {
    if (isSupportedLanguage(lang)) {
      setLanguageState(lang);
    }
  };

  const t = TRANSLATIONS[language];
  const isRTL = LANGUAGE_META[language].dir === 'rtl';

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, language, setLanguage, t, isRTL }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
