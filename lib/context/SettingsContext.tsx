'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsContextType {
  language: string;
  setLanguage: (lang: string) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  largeText: boolean;
  setLargeText: (enabled: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (enabled: boolean) => void;
  autoSave: boolean;
  setAutoSave: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

const STORAGE_KEY = 'psw_settings';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState('en-CA');
  const [highContrast, setHighContrastState] = useState(false);
  const [largeText, setLargeTextState] = useState(false);
  const [reducedMotion, setReducedMotionState] = useState(false);
  const [autoSave, setAutoSaveState] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const settings = JSON.parse(stored);
        setLanguageState(settings.language || 'en-CA');
        setHighContrastState(settings.highContrast || false);
        setLargeTextState(settings.largeText || false);
        setReducedMotionState(settings.reducedMotion || false);
        setAutoSaveState(
          settings.autoSave !== undefined ? settings.autoSave : true
        );
      } catch (e) {
        console.error('Failed to parse settings:', e);
      }
    }

    // Check system preference for reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setReducedMotionState(true);
    }
  }, []);

  // Save to localStorage whenever settings change
  useEffect(() => {
    const settings = {
      language,
      highContrast,
      largeText,
      reducedMotion,
      autoSave,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

    // Apply accessibility classes to document
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('high-contrast', highContrast);
      document.documentElement.classList.toggle('large-text', largeText);
      document.documentElement.classList.toggle('reduce-motion', reducedMotion);
    }
  }, [language, highContrast, largeText, reducedMotion, autoSave]);

  const setLanguage = (lang: string) => setLanguageState(lang);
  const setHighContrast = (enabled: boolean) => setHighContrastState(enabled);
  const setLargeText = (enabled: boolean) => setLargeTextState(enabled);
  const setReducedMotion = (enabled: boolean) => setReducedMotionState(enabled);
  const setAutoSave = (enabled: boolean) => setAutoSaveState(enabled);

  return (
    <SettingsContext.Provider
      value={{
        language,
        setLanguage,
        highContrast,
        setHighContrast,
        largeText,
        setLargeText,
        reducedMotion,
        setReducedMotion,
        autoSave,
        setAutoSave,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
