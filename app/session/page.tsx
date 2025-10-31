'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface TranscriptEntry {
  id: string;
  text: string;
  timestamp: Date;
  type: 'observation' | 'care-activity' | 'client-response' | 'general';
}

export default function SessionPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [clientName, setClientName] = useState('');
  const [currentTranscript, setCurrentTranscript] = useState('');
  const recordButtonRef = useRef<HTMLButtonElement>(null);

  const currentDateTime = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const addTranscriptEntry = useCallback(
    (text: string, type: TranscriptEntry['type']) => {
      const newEntry: TranscriptEntry = {
        id: Date.now().toString(),
        text,
        timestamp: new Date(),
        type,
      };
      setTranscript((prev) => [...prev, newEntry]);
    },
    []
  );

  const stopRecording = useCallback(() => {
    setCurrentTranscript((prevTranscript) => {
      if (prevTranscript && prevTranscript !== 'Recording in progress...') {
        addTranscriptEntry(prevTranscript, 'general');
      }
      return '';
    });
  }, [addTranscriptEntry]);

  const toggleRecording = useCallback(() => {
    setIsRecording((prev) => {
      if (prev) {
        stopRecording();
        return false;
      }
      setCurrentTranscript('Recording in progress...');
      return true;
    });
  }, [stopRecording]);

  const addQuickEntry = useCallback(
    (type: TranscriptEntry['type']) => {
      setCurrentTranscript((prev) => {
        const content = prev || 'Quick entry added';
        addTranscriptEntry(content, type);
        return '';
      });
    },
    [addTranscriptEntry]
  );

  const generateReport = useCallback(() => {
    console.log('Generating report for:', clientName, transcript);
  }, [clientName, transcript]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !event.repeat) {
        event.preventDefault();
        toggleRecording();
      }
      if (event.ctrlKey && event.key.toLowerCase() === 'g') {
        event.preventDefault();
        generateReport();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [generateReport, toggleRecording]);

  const getTypeLabel = (type: TranscriptEntry['type']) => {
    switch (type) {
      case 'observation':
        return 'Observation';
      case 'care-activity':
        return 'Care Activity';
      case 'client-response':
        return 'Client Response';
      default:
        return 'General';
    }
  };

  const getTypeColor = (type: TranscriptEntry['type']) => {
    switch (type) {
      case 'observation':
        return 'bg-blue-100 text-blue-800';
      case 'care-activity':
        return 'bg-green-100 text-green-800';
      case 'client-response':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="text-white min-h-screen bg-gradient-to-br from-tcs-blue-primary via-tcs-blue-mid to-tcs-blue-light p-4 md:p-6 lg:p-8 relative overflow-hidden">
      {/* Enhanced background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-10 w-96 h-96 bg-[var(--tcs-gold)]/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-[var(--tcs-blue-light)]/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <header className="mb-8">
          <h1 className="mb-6 text-center text-3xl md:text-4xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
            PSW Documentation Session
          </h1>

          {/* Session Header Card */}
          <div className="liquid-glass-card rounded-glass-lg mb-6 p-6 border border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="client-name"
                  className="mb-2 block text-sm font-medium text-white/90"
                >
                  Client Name
                </label>
                <input
                  id="client-name"
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="liquid-glass-light w-full rounded-glass-md border border-white/20 px-4 py-3 text-white placeholder-white/60 focus:border-[var(--tcs-gold)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--tcs-gold)]/30 transition-all"
                  placeholder="Enter client name"
                  aria-describedby="client-name-desc"
                />
                <p id="client-name-desc" className="sr-only">
                  Enter the name of the client for this documentation session
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/90">
                  Session Date & Time
                </label>
                <div className="liquid-glass-light text-white/90 rounded-glass-md px-4 py-3 border border-white/20">
                  {currentDateTime}
                </div>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts Card */}
          <div className="liquid-glass-card rounded-glass-lg mb-6 p-4 border border-white/15">
            <h2 className="mb-3 text-lg font-semibold text-white">Keyboard Shortcuts</h2>
            <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
              <div className="flex items-center gap-2">
                <kbd className="bg-white/20 text-white rounded-glass-md px-3 py-1.5 text-xs font-mono border border-white/20">
                  Space
                </kbd>
                <span className="text-white/80">Start/Stop Recording</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="bg-white/20 text-white rounded-glass-md px-3 py-1.5 text-xs font-mono border border-white/20">
                  Ctrl+G
                </kbd>
                <span className="text-white/80">Generate Report</span>
              </div>
            </div>
          </div>
        </header>

        <main className="space-y-8">
          {/* Recording Interface */}
          <div className="text-center">
            <div className="relative inline-block">
              {/* Pulsing rings when recording */}
              {isRecording && (
                <>
                  <div className="absolute inset-0 rounded-full border-2 border-[var(--tcs-gold)]/50 animate-ping" />
                  <div className="absolute inset-0 rounded-full border-2 border-[var(--tcs-gold)]/30 animate-ping" style={{ animationDelay: '0.5s' }} />
                </>
              )}
              <button
                ref={recordButtonRef}
                onClick={toggleRecording}
                className={`touch-target rounded-full h-32 w-32 md:h-40 md:w-40 liquid-glass-gold button-press transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[var(--tcs-gold)]/50 shadow-[0_20px_50px_rgba(201,160,99,0.4)] ${
                  isRecording 
                    ? 'shadow-[0_25px_60px_rgba(201,160,99,0.6)] animate-pulse' 
                    : 'hover:shadow-[0_25px_60px_rgba(201,160,99,0.5)]'
                }`}
                aria-label={
                  isRecording ? 'Stop voice recording' : 'Start voice recording'
                }
                aria-pressed={isRecording}
              >
                <div className="flex h-full items-center justify-center">
                  {isRecording ? (
                    <div
                      className="bg-white h-10 w-10 md:h-12 md:w-12 rounded-lg"
                      aria-hidden="true"
                    />
                  ) : (
                    <div
                      className="border-l-white border-t-transparent border-b-transparent ml-2 h-0 w-0 border-b-[14px] border-l-[18px] border-t-[14px] md:border-b-[18px] md:border-l-[24px] md:border-t-[18px]"
                      aria-hidden="true"
                    />
                  )}
                </div>
              </button>
            </div>

            <p className="mt-6 text-xl md:text-2xl font-semibold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
              {isRecording ? 'Recording...' : 'Press to Record'}
            </p>
            {isRecording && (
              <p className="mt-2 text-sm text-white/70">Press Space to stop</p>
            )}
          </div>

          {/* Live Transcript Panel */}
          <div>
            <h2 className="mb-4 text-xl md:text-2xl font-semibold text-white">Live Transcript</h2>
            <div
              className="liquid-glass-card rounded-glass-lg min-h-[120px] border border-white/20 p-6 shadow-[0_15px_40px_rgba(0,0,0,0.3)]"
              aria-live="polite"
              aria-label="Live transcript"
            >
              {currentTranscript ? (
                <p className="text-white/90 text-lg leading-relaxed">{currentTranscript}</p>
              ) : (
                <p className="text-white/60 italic text-center">
                  Transcript will appear here...
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div>
            <h2 className="mb-4 text-xl md:text-2xl font-semibold text-white">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <button
                onClick={() => addQuickEntry('observation')}
                className="liquid-glass-card rounded-glass-lg px-6 py-4 font-semibold text-white border border-white/20 hover:border-[var(--tcs-blue-light)]/40 transition-all shadow-[0_10px_25px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_35px_rgba(75,111,165,0.4)] touch-target"
                aria-label="Add current transcript as observation"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--tcs-blue-light)]/30 flex items-center justify-center">
                    👁️
                  </div>
                  <span>Add Observation</span>
                </div>
              </button>

              <button
                onClick={() => addQuickEntry('care-activity')}
                className="liquid-glass-card rounded-glass-lg px-6 py-4 font-semibold text-white border border-white/20 hover:border-green-400/40 transition-all shadow-[0_10px_25px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_35px_rgba(74,222,128,0.4)] touch-target"
                aria-label="Add current transcript as care activity"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/30 flex items-center justify-center">
                    ✋
                  </div>
                  <span>Add Care Activity</span>
                </div>
              </button>

              <button
                onClick={() => addQuickEntry('client-response')}
                className="liquid-glass-card rounded-glass-lg px-6 py-4 font-semibold text-white border border-white/20 hover:border-purple-400/40 transition-all shadow-[0_10px_25px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_35px_rgba(192,132,252,0.4)] touch-target"
                aria-label="Add current transcript as client response"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/30 flex items-center justify-center">
                    💬
                  </div>
                  <span>Client Response</span>
                </div>
              </button>
            </div>
          </div>

          {/* Session Transcript */}
          <div>
            <h2 className="mb-4 text-xl md:text-2xl font-semibold text-white">Session Transcript</h2>
            <div className="liquid-glass-card rounded-glass-lg max-h-96 overflow-y-auto border border-white/20 p-6 shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
              {transcript.length === 0 ? (
                <p className="text-white/60 italic text-center py-8">No entries yet...</p>
              ) : (
                <ul className="space-y-4" role="list">
                  {transcript.map((entry) => (
                    <li
                      key={entry.id}
                      className="liquid-glass-light rounded-glass-md border border-white/15 p-4 last:border-b-0 hover:border-white/30 transition-all"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                            entry.type === 'observation' 
                              ? 'bg-[var(--tcs-blue-light)]/20 text-blue-200 border border-blue-400/30'
                              : entry.type === 'care-activity'
                              ? 'bg-green-500/20 text-green-200 border border-green-400/30'
                              : entry.type === 'client-response'
                              ? 'bg-purple-500/20 text-purple-200 border border-purple-400/30'
                              : 'bg-white/20 text-white/80 border border-white/20'
                          }`}
                        >
                          {getTypeLabel(entry.type)}
                        </span>
                        <time
                          className="text-white/70 text-sm"
                          dateTime={entry.timestamp.toISOString()}
                        >
                          {entry.timestamp.toLocaleTimeString()}
                        </time>
                      </div>
                      <p className="text-white/90 leading-relaxed">{entry.text}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="text-center">
            <button
              onClick={generateReport}
              disabled={transcript.length === 0 || !clientName.trim()}
              className="disabled:opacity-50 disabled:cursor-not-allowed liquid-glass-gold text-[var(--tcs-blue-deep)] rounded-glass-lg px-8 py-4 text-lg md:text-xl font-bold transition-all shadow-[0_15px_40px_rgba(201,160,99,0.4)] hover:shadow-[0_20px_50px_rgba(201,160,99,0.5)] focus:outline-none focus:ring-4 focus:ring-[var(--tcs-gold)]/50 touch-target"
              aria-label="Generate documentation report"
            >
              Generate Report
            </button>

            {(transcript.length === 0 || !clientName.trim()) && (
              <p className="text-white/60 mt-4 text-sm" role="status">
                {!clientName.trim()
                  ? 'Please enter client name to generate report'
                  : 'Add transcript entries to generate report'}
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
