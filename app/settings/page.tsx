'use client';

import { useState, type ChangeEvent } from 'react';

interface SettingsState {
  language: string;
  autoSaveSessions: boolean;
  shareAnalytics: boolean;
  enableVoiceFeedback: boolean;
  reduceMotion: boolean;
  highContrastMode: boolean;
  largeText: boolean;
}

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  description?: string;
}

function ToggleSwitch({
  id,
  checked,
  onChange,
  label,
  description,
}: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <label
          htmlFor={id}
          className="text-white block cursor-pointer text-sm font-medium"
        >
          {label}
        </label>
        {description && (
          <p className="text-gray-300 mt-1 text-xs">{description}</p>
        )}
      </div>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        onClick={onChange}
        className={`rounded-full focus:ring-blue-500 focus:ring-offset-gray-800 relative inline-flex h-6 w-11 items-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          checked ? 'bg-blue-600' : 'bg-gray-600'
        }`}
      >
        <span className="sr-only">{label}</span>
        <span
          className={`rounded-full bg-white inline-block h-4 w-4 transform transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>({
    language: 'en-CA',
    autoSaveSessions: true,
    shareAnalytics: false,
    enableVoiceFeedback: true,
    reduceMotion: false,
    highContrastMode: false,
    largeText: false,
  });

  const [showToast, setShowToast] = useState<boolean>(false);

  const languages = [
    { value: 'en-CA', label: 'English (Canadian)' },
    { value: 'fr', label: 'Français' },
    { value: 'tl', label: 'Tagalog (Filipino)' },
    { value: 'es', label: 'Español' },
    { value: 'hi', label: 'हिन्दी (Hindi)' },
    { value: 'bo', label: 'བོད་སྐད (Tibetan)' },
  ];

  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSettings((prev) => ({ ...prev, language: event.target.value }));
  };

  const handleToggle = (key: keyof SettingsState) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#1B365D] p-4">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <h1 className="text-white text-3xl font-bold">
            Settings & Preferences
          </h1>
          <p className="text-gray-300 mt-2">
            Customize your experience and accessibility options
          </p>
        </header>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <section className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
            <fieldset>
              <legend className="text-white mb-4 text-lg font-semibold">
                Language Preferences
              </legend>
              <div>
                <label
                  htmlFor="language-select"
                  className="text-white mb-2 block text-sm font-medium"
                >
                  Select Language
                </label>
                <select
                  id="language-select"
                  value={settings.language}
                  onChange={handleLanguageChange}
                  className="bg-gray-800 border-gray-600 text-white focus:ring-blue-500 focus:border-transparent w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2"
                  aria-describedby="language-help"
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
                <p id="language-help" className="text-gray-300 mt-1 text-xs">
                  Choose your preferred language for the interface
                </p>
              </div>
            </fieldset>
          </section>

          <section className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
            <fieldset>
              <legend className="text-white mb-4 text-lg font-semibold">
                Privacy Settings
              </legend>
              <div className="space-y-4">
                <ToggleSwitch
                  id="auto-save"
                  checked={settings.autoSaveSessions}
                  onChange={() => handleToggle('autoSaveSessions')}
                  label="Auto-save sessions"
                  description="Automatically save your session data for quick recovery"
                />
                <ToggleSwitch
                  id="share-analytics"
                  checked={settings.shareAnalytics}
                  onChange={() => handleToggle('shareAnalytics')}
                  label="Share analytics"
                  description="Help improve our service by sharing anonymous usage data"
                />
                <ToggleSwitch
                  id="voice-feedback"
                  checked={settings.enableVoiceFeedback}
                  onChange={() => handleToggle('enableVoiceFeedback')}
                  label="Enable voice feedback"
                  description="Receive audio notifications and feedback"
                />
              </div>
            </fieldset>
          </section>

          <section className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
            <fieldset>
              <legend className="text-white mb-4 text-lg font-semibold">
                Accessibility Options
              </legend>
              <div className="space-y-4">
                <ToggleSwitch
                  id="reduce-motion"
                  checked={settings.reduceMotion}
                  onChange={() => handleToggle('reduceMotion')}
                  label="Reduce motion"
                  description="Minimize animations and transitions for better accessibility"
                />
                <ToggleSwitch
                  id="high-contrast"
                  checked={settings.highContrastMode}
                  onChange={() => handleToggle('highContrastMode')}
                  label="High contrast mode"
                  description="Increase contrast for better visibility"
                />
                <ToggleSwitch
                  id="large-text"
                  checked={settings.largeText}
                  onChange={() => handleToggle('largeText')}
                  label="Large text"
                  description="Increase text size throughout the application"
                />
              </div>
            </fieldset>
          </section>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="text-white rounded-lg bg-[#D4A574] px-6 py-3 font-semibold transition-colors hover:bg-[#C19660] focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:ring-offset-2 focus:ring-offset-[#1B365D]"
            >
              Save Preferences
            </button>
          </div>
        </form>

        {showToast && (
          <div
            role="alert"
            aria-live="polite"
            className="bg-green-600 text-white fixed bottom-4 right-4 rounded-lg px-6 py-3 shadow-lg"
          >
            Preferences saved successfully!
          </div>
        )}
      </div>
    </div>
  );
}
