'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

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
  const initialSettings = useMemo(() => {
    if (typeof window === 'undefined') {
      return {
        language: 'en-CA',
        highContrast: false,
        largeText: false,
        reducedMotion: false,
        autoSave: true,
      };
    }

    let storedSettings: Partial<SettingsContextType> | null = null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      storedSettings = raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error('Failed to parse settings:', error);
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return {
      language: storedSettings?.language ?? 'en-CA',
      highContrast: storedSettings?.highContrast ?? false,
      largeText: storedSettings?.largeText ?? false,
      reducedMotion:
        typeof storedSettings?.reducedMotion === 'boolean'
          ? storedSettings.reducedMotion
          : prefersReducedMotion,
      autoSave:
        typeof storedSettings?.autoSave === 'boolean'
          ? storedSettings.autoSave
          : true,
    };
  }, []);

  const [language, setLanguageState] = useState(initialSettings.language);
  const [highContrast, setHighContrastState] = useState(
    initialSettings.highContrast
  );
  const [largeText, setLargeTextState] = useState(initialSettings.largeText);
  const [reducedMotion, setReducedMotionState] = useState(
    initialSettings.reducedMotion
  );
  const [autoSave, setAutoSaveState] = useState(initialSettings.autoSave);

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
