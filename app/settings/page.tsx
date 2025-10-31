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
    <div className="flex items-center justify-between p-4 rounded-glass-md liquid-glass-light border border-white/10 hover:border-white/20 transition-all">
      <div className="flex-1">
        <label
          htmlFor={id}
          className="text-white block cursor-pointer text-base font-semibold"
        >
          {label}
        </label>
        {description && (
          <p className="text-white/60 mt-1 text-sm">{description}</p>
        )}
      </div>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        onClick={onChange}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-[var(--tcs-gold)]/50 touch-target ${
          checked 
            ? 'bg-[var(--tcs-gold)] shadow-[0_4px_15px_rgba(201,160,99,0.5)]' 
            : 'bg-white/20 border border-white/30'
        }`}
      >
        <span className="sr-only">{label}</span>
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-[0_2px_8px_rgba(0,0,0,0.3)] ${
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
    <div className="min-h-screen bg-gradient-to-br from-tcs-blue-primary via-tcs-blue-mid to-tcs-blue-light p-4 md:p-6 lg:p-8 relative overflow-hidden">
      {/* Enhanced background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[var(--tcs-gold)]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[var(--tcs-blue-light)]/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl">
        <header className="mb-8 text-center">
          <h1 className="text-white text-4xl md:text-5xl font-bold mb-3 drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
            Settings & Preferences
          </h1>
          <p className="text-white/70 text-lg">
            Customize your experience and accessibility options
          </p>
        </header>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {/* Language & Region Section */}
          <section className="liquid-glass-card rounded-glass-lg p-6 md:p-8 border border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
            <fieldset>
              <legend className="text-white mb-6 text-xl font-bold">
                Language & Region
              </legend>
              <div className="space-y-4">
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
                    className="liquid-glass-light text-white w-full rounded-glass-md border border-white/20 px-4 py-3 focus:border-[var(--tcs-gold)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--tcs-gold)]/30 transition-all"
                    aria-describedby="language-help"
                  >
                    {languages.map((lang) => (
                      <option key={lang.value} value={lang.value} className="bg-[var(--tcs-blue-dark)]">
                        {lang.label}
                      </option>
                    ))}
                  </select>
                  <p id="language-help" className="text-white/60 mt-2 text-xs">
                    Choose your preferred language for the interface
                  </p>
                </div>
              </div>
            </fieldset>
          </section>

          {/* Privacy & Data Section */}
          <section className="liquid-glass-card rounded-glass-lg p-6 md:p-8 border border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
            <fieldset>
              <legend className="text-white mb-6 text-xl font-bold">
                Privacy & Data
              </legend>
              <div className="space-y-6">
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

          {/* Accessibility Options Section */}
          <section className="liquid-glass-card rounded-glass-lg p-6 md:p-8 border border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
            <fieldset>
              <legend className="text-white mb-6 text-xl font-bold">
                Accessibility Options
              </legend>
              <div className="space-y-6">
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => {
                setSettings({
                  language: 'en-CA',
                  autoSaveSessions: true,
                  shareAnalytics: false,
                  enableVoiceFeedback: true,
                  reduceMotion: false,
                  highContrastMode: false,
                  largeText: false,
                });
              }}
              className="liquid-glass-light text-white rounded-glass-lg px-6 py-3 font-semibold transition-all border border-white/20 hover:border-white/30 shadow-[0_10px_25px_rgba(0,0,0,0.3)] touch-target"
            >
              Reset to Defaults
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="touch-target liquid-glass-gold text-[var(--tcs-blue-deep)] rounded-glass-lg px-8 py-4 font-bold text-lg transition-all shadow-[0_15px_40px_rgba(201,160,99,0.4)] hover:shadow-[0_20px_50px_rgba(201,160,99,0.5)] focus:outline-none focus:ring-4 focus:ring-[var(--tcs-gold)]/50"
            >
              Save Preferences
            </button>
          </div>
        </form>

        {/* Enhanced Toast Notification */}
        {showToast && (
          <div
            role="alert"
            aria-live="polite"
            className="liquid-glass-card text-white fixed bottom-6 right-6 rounded-glass-lg px-6 py-4 shadow-[0_20px_50px_rgba(74,222,128,0.4)] border border-green-400/40 animate-slide-up z-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-green-400/30 flex items-center justify-center">
                ✓
              </div>
              <span className="font-semibold">Preferences saved successfully!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
