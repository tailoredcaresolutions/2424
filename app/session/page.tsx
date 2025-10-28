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
    <div className="text-white min-h-screen bg-[#1B365D] p-4">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="mb-6 text-center text-3xl font-bold">
            PSW Documentation Session
          </h1>

          <div className="bg-white/10 mb-6 rounded-lg p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="client-name"
                  className="mb-2 block text-sm font-medium"
                >
                  Client Name
                </label>
                <input
                  id="client-name"
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder-white/60 focus:border-transparent w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4A574]"
                  placeholder="Enter client name"
                  aria-describedby="client-name-desc"
                />
                <p id="client-name-desc" className="sr-only">
                  Enter the name of the client for this documentation session
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Session Date & Time
                </label>
                <div className="bg-white/10 text-white/90 rounded-md px-3 py-2">
                  {currentDateTime}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 mb-6 rounded-lg p-4">
            <h2 className="mb-2 text-lg font-semibold">Keyboard Shortcuts</h2>
            <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
              <div className="flex items-center gap-2">
                <kbd className="bg-white/20 rounded px-2 py-1 text-xs">
                  Space
                </kbd>
                <span>Start/Stop Recording</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="bg-white/20 rounded px-2 py-1 text-xs">
                  Ctrl+G
                </kbd>
                <span>Generate Report</span>
              </div>
            </div>
          </div>
        </header>

        <main>
          <div className="mb-8 text-center">
            <button
              ref={recordButtonRef}
              onClick={toggleRecording}
              className={`rounded-full h-32 w-32 bg-[#D4A574] transition-all duration-200 hover:bg-[#C19660] focus:outline-none focus:ring-4 focus:ring-[#D4A574]/50 ${
                isRecording ? 'animate-pulse shadow-lg shadow-[#D4A574]/50' : ''
              }`}
              aria-label={
                isRecording ? 'Stop voice recording' : 'Start voice recording'
              }
              aria-pressed={isRecording}
            >
              <div className="flex h-full items-center justify-center">
                {isRecording ? (
                  <div
                    className="bg-white h-8 w-8 rounded-sm"
                    aria-hidden="true"
                  />
                ) : (
                  <div
                    className="border-l-white border-t-transparent border-b-transparent ml-1 h-0 w-0 border-b-[12px] border-l-[16px] border-t-[12px]"
                    aria-hidden="true"
                  />
                )}
              </div>
            </button>

            <p className="mt-4 text-lg font-medium">
              {isRecording ? 'Recording...' : 'Press to Record'}
            </p>
          </div>

          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">Live Transcript</h2>
            <div
              className="bg-white/10 border-white/20 min-h-[100px] rounded-lg border-2 p-4"
              aria-live="polite"
              aria-label="Live transcript"
            >
              {currentTranscript ? (
                <p className="text-white/90">{currentTranscript}</p>
              ) : (
                <p className="text-white/60 italic">
                  Transcript will appear here...
                </p>
              )}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <button
                onClick={() => addQuickEntry('observation')}
                className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 rounded-lg px-4 py-3 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1B365D]"
                aria-label="Add current transcript as observation"
              >
                Add Observation
              </button>

              <button
                onClick={() => addQuickEntry('care-activity')}
                className="bg-green-600 hover:bg-green-700 focus:ring-green-500 rounded-lg px-4 py-3 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1B365D]"
                aria-label="Add current transcript as care activity"
              >
                Add Care Activity
              </button>

              <button
                onClick={() => addQuickEntry('client-response')}
                className="bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 rounded-lg px-4 py-3 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1B365D]"
                aria-label="Add current transcript as client response"
              >
                Client Response
              </button>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">Session Transcript</h2>
            <div className="bg-white/10 max-h-96 overflow-y-auto rounded-lg p-4">
              {transcript.length === 0 ? (
                <p className="text-white/60 italic">No entries yet...</p>
              ) : (
                <ul className="space-y-4" role="list">
                  {transcript.map((entry) => (
                    <li
                      key={entry.id}
                      className="border-white/20 border-b pb-4 last:border-b-0"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getTypeColor(entry.type)}`}
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
                      <p className="text-white/90">{entry.text}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={generateReport}
              disabled={transcript.length === 0 || !clientName.trim()}
              className="disabled:bg-gray-600 rounded-lg bg-[#D4A574] px-8 py-4 text-lg font-semibold transition-colors hover:bg-[#C19660] focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:ring-offset-2 focus:ring-offset-[#1B365D] disabled:cursor-not-allowed"
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
