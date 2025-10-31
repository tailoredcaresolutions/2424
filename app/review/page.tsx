'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const SAMPLE_PARAGRAPH = `Patient John Doe presented with acute chest pain radiating to the left arm. Initial assessment revealed elevated troponin levels and ECG changes consistent with myocardial infarction. Patient was immediately started on dual antiplatelet therapy and prepared for emergency cardiac catheterization.

The procedure revealed 90% occlusion of the left anterior descending artery. Successful percutaneous coronary intervention was performed with drug-eluting stent placement. Post-procedure, patient remained hemodynamically stable with resolution of chest pain.

Patient will continue on optimal medical therapy including aspirin, clopidogrel, atorvastatin, and metoprolol. Follow-up echocardiogram scheduled in 6 weeks to assess left ventricular function recovery.`;

const SAMPLE_DAR = `{
  "patient": {
    "name": "John Doe",
    "age": 58,
    "gender": "Male",
    "mrn": "12345678"
  },
  "data": {
    "chief_complaint": "Acute chest pain",
    "vital_signs": {
      "bp": "140/90",
      "hr": 95,
      "temp": "98.6°F",
      "spo2": "98%"
    },
    "labs": {
      "troponin": "elevated",
      "ck_mb": "elevated"
    }
  },
  "assessment": {
    "primary_diagnosis": "ST-elevation myocardial infarction",
    "procedures": ["Cardiac catheterization", "PCI with stent"]
  },
  "response": {
    "treatment_outcome": "Successful revascularization",
    "complications": "None",
    "discharge_plan": "Optimal medical therapy"
  }
}`;

type TabId = 'paragraph' | 'json';
type ActionVariant = 'primary' | 'ghost' | 'accent' | 'outline';

export default function ReviewPage() {
  const [activeTab, setActiveTab] = useState<TabId>('paragraph');
  const [paragraphReport] = useState(SAMPLE_PARAGRAPH);
  const [jsonReport] = useState(SAMPLE_DAR);
  const [status, setStatus] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const statusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shortcuts = useMemo(
    () => [
      { combo: 'Ctrl + E', action: 'Edit report' },
      { combo: 'Ctrl + S', action: 'Save report' },
      { combo: 'Ctrl + Shift + C', action: 'Copy current tab' },
    ],
    []
  );

  const updateStatus = useCallback((message: string) => {
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
    }
    setStatus(message);
    statusTimeoutRef.current = setTimeout(() => {
      setStatus(null);
    }, 4000);
  }, []);

  const copyText = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      updateStatus(`${label} copied to clipboard.`);
    } catch (error) {
      console.error('Copy failed', error);
      updateStatus('Sorry, unable to copy. Please try again.');
    }
  }, [updateStatus]);

  const copyActiveTab = useCallback(() => {
    if (activeTab === 'paragraph') {
      void copyText(paragraphReport, 'Paragraph report');
    } else {
      void copyText(jsonReport, 'DAR JSON');
    }
  }, [activeTab, copyText, jsonReport, paragraphReport]);

  const handleEdit = useCallback(() => {
    updateStatus('Editing mode would open a detailed editor (coming soon).');
  }, [updateStatus]);

  const handleSave = useCallback(() => {
    updateStatus('Report saved locally for review.');
  }, [updateStatus]);

  const handleExport = useCallback(() => {
    updateStatus('Export stub triggered. Connect to local exporter to finalize.');
  }, [updateStatus]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && !event.metaKey) {
        if (event.key.toLowerCase() === 'e') {
          event.preventDefault();
          handleEdit();
        } else if (event.key.toLowerCase() === 's') {
          event.preventDefault();
          handleSave();
        } else if (event.shiftKey && event.key.toLowerCase() === 'c') {
          event.preventDefault();
          copyActiveTab();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [copyActiveTab, handleEdit, handleSave]);

  useEffect(
    () => () => {
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
    },
    []
  );

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-tcs-blue-primary via-tcs-blue-mid to-tcs-blue-light p-6 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,165,116,0.18),transparent_35%),radial-gradient(circle_at_bottom,rgba(212,165,116,0.1),transparent_40%)]" />
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8">
        <header className="rounded-glass-lg liquid-glass-card p-8">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#E6C5A1]">
                Documentation Review
              </p>
              <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
                Finalize & Sign Off
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-[#F3D7B7]/80">
                Validate the narrative summary and DAR JSON export before submitting to clinical records. Keyboard shortcuts keep reviewers in flow.
              </p>
            </div>
            <div className="relative flex h-32 w-32 items-center justify-center">
              <ReviewOrb prefersReducedMotion={prefersReducedMotion} />
            </div>
          </div>
        </header>

        <section className="rounded-glass-lg liquid-glass-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
            <nav className="flex gap-2" role="tablist" aria-label="Report format tabs">
              <TabButton
                id="paragraph-tab"
                controls="paragraph-panel"
                isActive={activeTab === 'paragraph'}
                onSelect={() => setActiveTab('paragraph')}
              >
                Paragraph Report
              </TabButton>
              <TabButton
                id="json-tab"
                controls="json-panel"
                isActive={activeTab === 'json'}
                onSelect={() => setActiveTab('json')}
              >
                DAR JSON
              </TabButton>
            </nav>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[#F3D7B7]/85">
              {shortcuts.map((shortcut) => (
                <span key={shortcut.combo} className="flex items-center gap-2 rounded-full border border-[#F3D7B7]/25 bg-[#0E1F3D]/60 px-3 py-1 backdrop-blur">
                  <kbd className="rounded border border-[#F3D7B7]/40 bg-[#0B1830]/80 px-2 py-0.5 text-[11px] font-semibold text-[#FCE9CC]">
                    {shortcut.combo}
                  </kbd>
                  <span>{shortcut.action}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-6">
            <TabPanel
              id="paragraph-panel"
              labelledBy="paragraph-tab"
              isActive={activeTab === 'paragraph'}
              heading="Clinical Narrative"
              description="Review the summarized narrative before approval."
              onCopy={() => void copyText(paragraphReport, 'Paragraph report')}
            >
              <pre className="max-h-[420px] overflow-y-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-[#101D38]/80 p-6 font-sans leading-relaxed text-[#F8E4CA]">
                {paragraphReport}
              </pre>
            </TabPanel>

            <TabPanel
              id="json-panel"
              labelledBy="json-tab"
              isActive={activeTab === 'json'}
              heading="DAR JSON Export"
              description="Validate DAR structure before distributing downstream."
              onCopy={() => void copyText(jsonReport, 'DAR JSON')}
            >
              <pre className="max-h-[420px] overflow-y-auto whitespace-pre-wrap rounded-2xl border border-white/12 bg-[#101D38]/80 p-6 font-mono text-sm text-[#FCE9CC]">
                {jsonReport}
              </pre>
            </TabPanel>
          </div>

          <div className="mt-8 flex flex-wrap justify-end gap-3">
            <ActionButton variant="ghost" onClick={handleEdit} ariaLabel="Edit report (Ctrl + E)">
              Edit
            </ActionButton>
            <ActionButton variant="primary" onClick={handleSave} ariaLabel="Save report (Ctrl + S)">
              Save
            </ActionButton>
            <ActionButton variant="accent" onClick={handleExport} ariaLabel="Export report">
              Export
            </ActionButton>
            <ActionButton variant="outline" onClick={copyActiveTab} ariaLabel="Copy active tab (Ctrl + Shift + C)">
              Copy Active
            </ActionButton>
          </div>
        </section>

        <div role="status" aria-live="polite" className="text-sm text-[#FCE9CC]/90">
          {status ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FCE9CC]/30 bg-[#0D1A32]/80 px-4 py-2 shadow-[0_20px_40px_rgba(5,12,24,0.45)]">
              <span className="h-2 w-2 rounded-full bg-[#FCE9CC]" aria-hidden="true" />
              {status}
            </div>
          ) : (
            <span className="sr-only">No status updates</span>
          )}
        </div>
      </div>
    </main>
  );
}

function TabButton({
  id,
  controls,
  isActive,
  onSelect,
  children,
}: {
  id: string;
  controls: string;
  isActive: boolean;
  onSelect: () => void;
  children: ReactNode;
}) {
  return (
    <button
      id={id}
      role="tab"
      aria-selected={isActive}
      aria-controls={controls}
      className={`rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A574] ${
        isActive
          ? 'bg-[#D4A574] text-[#10213D] shadow-[0_10px_25px_rgba(214,173,117,0.45)]'
          : 'border border-[#D4A574]/35 text-[#F8E4CA]/80 hover:bg-[#D4A574]/10'
      }`}
      onClick={onSelect}
      type="button"
    >
      {children}
    </button>
  );
}

function TabPanel({
  id,
  labelledBy,
  isActive,
  heading,
  description,
  onCopy,
  children,
}: {
  id: string;
  labelledBy: string;
  isActive: boolean;
  heading: string;
  description: string;
  onCopy: () => void;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      role="tabpanel"
      aria-labelledby={labelledBy}
      aria-hidden={!isActive}
      className={isActive ? 'block' : 'hidden'}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#FCE9CC]">{heading}</h2>
          <p className="text-xs text-[#F8E4CA]/70">{description}</p>
        </div>
        <ActionButton variant="outline" onClick={onCopy} ariaLabel={`Copy ${heading}`}>
          Copy
        </ActionButton>
      </div>
      {children}
    </section>
  );
}

function ActionButton({
  variant,
  onClick,
  children,
  ariaLabel,
}: {
  variant: ActionVariant;
  onClick: () => void;
  children: ReactNode;
  ariaLabel: string;
}) {
  const base =
    'inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A574]';

  const styles: Record<ActionVariant, string> = {
    primary: `${base} bg-[#D4A574] text-[#0E1F3D] shadow-[0_12px_30px_rgba(214,173,117,0.45)] hover:bg-[#C89657]`,
    accent: `${base} bg-gradient-to-r from-[#F6E3CB] to-[#D4A574] text-[#0E1F3D] hover:from-[#F0D5B1] hover:to-[#C89657]`,
    outline: `${base} border border-[#D4A574]/50 text-[#FCE9CC] hover:bg-[#D4A574]/15`,
    ghost: `${base} border border-transparent text-[#FCE9CC]/85 hover:bg-[#D4A574]/10`,
  };

  return (
    <button type="button" onClick={onClick} aria-label={ariaLabel} className={styles[variant]}>
      {children}
    </button>
  );
}

function ReviewOrb({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#22345E] to-[#090F1D] blur-3xl opacity-70" />
      <motion.div
        initial={{ scale: prefersReducedMotion ? 1 : 0.92, opacity: 0 }}
        animate={{
          scale: prefersReducedMotion ? 1 : [0.9, 1.06, 0.9],
          opacity: 1,
          rotate: prefersReducedMotion ? 0 : [0, 8, -6, 0],
        }}
        transition={{
          duration: prefersReducedMotion ? 0.6 : 6,
          repeat: prefersReducedMotion ? 0 : Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        }}
        className="relative z-10 flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[#F8E4CA] via-[#DDB17D] to-[#B67A3A] shadow-[0_0_50px_rgba(212,165,116,0.45)]"
        aria-hidden="true"
      >
        <motion.div
          initial={{ opacity: prefersReducedMotion ? 0.4 : 0 }}
          animate={{
            opacity: prefersReducedMotion ? 0.4 : [0.2, 0.6, 0.2],
            scale: prefersReducedMotion ? 1 : [0.8, 1.08, 0.8],
          }}
          transition={{
            duration: prefersReducedMotion ? 1 : 5.2,
            repeat: prefersReducedMotion ? 0 : Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
          }}
          className="h-[62%] w-[62%] rounded-full bg-gradient-to-br from-white/85 to-white/15 shadow-[0_-12px_22px_rgba(255,255,255,0.35)]"
        />
        <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg_at_50%_50%,rgba(255,255,255,0.2)_0deg,rgba(255,255,255,0)_240deg)]" />
        <div className="absolute inset-[10%] rounded-full border border-white/25" />
      </motion.div>
      {!prefersReducedMotion && (
        <motion.div
          initial={{ opacity: 0.18, scale: 1.05 }}
          animate={{ opacity: [0.18, 0], scale: [1.05, 1.35] }}
          transition={{ duration: 5.6, repeat: Infinity, ease: 'easeOut' }}
          className="absolute inset-[-15%] rounded-full border border-[#D4A574]/25"
        />
      )}
    </div>
  );
}
