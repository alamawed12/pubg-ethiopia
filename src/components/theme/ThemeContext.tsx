'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'night' | 'light';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  isNight: boolean;
  isLight: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('night');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pubgm_theme') as ThemeMode | null;
      if (saved === 'light' || saved === 'night') {
        setThemeState(saved);
        applyTheme(saved);
      } else {
        applyTheme('night');
      }
    } catch {
      applyTheme('night');
    }
  }, []);

  const applyTheme = (mode: ThemeMode) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const body = document.body;
    if (mode === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
      body?.classList.add('theme-light');
      body?.classList.remove('theme-night');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      root.setAttribute('data-theme', 'night');
      body?.classList.add('theme-night');
      body?.classList.remove('theme-light');
    }
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    applyTheme(mode);
    try {
      localStorage.setItem('pubgm_theme', mode);
    } catch {}
  };

  const toggleTheme = () => {
    const next = theme === 'night' ? 'light' : 'night';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        isNight: theme === 'night',
        isLight: theme === 'light',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'night' as ThemeMode,
      toggleTheme: () => {},
      setTheme: () => {},
      isNight: true,
      isLight: false,
    };
  }
  return context;
}
