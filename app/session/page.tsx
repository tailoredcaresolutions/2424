'use client'

import { useState, useRef, useEffect } from 'react'

interface TranscriptEntry {
  id: string
  text: string
  timestamp: Date
  type: 'observation' | 'care-activity' | 'client-response' | 'general'
}

export default function SessionPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [clientName, setClientName] = useState('')
  const [currentTranscript, setCurrentTranscript] = useState('')
  const recordButtonRef = useRef<HTMLButtonElement>(null)

  const currentDateTime = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !event.repeat) {
        event.preventDefault()
        toggleRecording()
      }
      if (event.ctrlKey && event.key === 'g') {
        event.preventDefault()
        generateReport()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isRecording])

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      setCurrentTranscript('Recording in progress...')
    } else {
      if (currentTranscript && currentTranscript !== 'Recording in progress...') {
        addTranscriptEntry(currentTranscript, 'general')
      }
      setCurrentTranscript('')
    }
  }

  const addTranscriptEntry = (text: string, type: TranscriptEntry['type']) => {
    const newEntry: TranscriptEntry = {
      id: Date.now().toString(),
      text,
      timestamp: new Date(),
      type
    }
    setTranscript(prev => [...prev, newEntry])
  }

  const addQuickEntry = (type: TranscriptEntry['type']) => {
    const text = currentTranscript || 'Quick entry added'
    addTranscriptEntry(text, type)
    setCurrentTranscript('')
  }

  const generateReport = () => {
    console.log('Generating report for:', clientName, transcript)
  }

  const getTypeLabel = (type: TranscriptEntry['type']) => {
    switch (type) {
      case 'observation': return 'Observation'
      case 'care-activity': return 'Care Activity'
      case 'client-response': return 'Client Response'
      default: return 'General'
    }
  }

  const getTypeColor = (type: TranscriptEntry['type']) => {
    switch (type) {
      case 'observation': return 'bg-blue-100 text-blue-800'
      case 'care-activity': return 'bg-green-100 text-green-800'
      case 'client-response': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-[#1B365D] text-white p-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-6 text-center">PSW Documentation Session</h1>
          
          <div className="bg-white/10 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="client-name" className="block text-sm font-medium mb-2">
                  Client Name
                </label>
                <input
                  id="client-name"
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent"
                  placeholder="Enter client name"
                  aria-describedby="client-name-desc"
                />
                <p id="client-name-desc" className="sr-only">
                  Enter the name of the client for this documentation session
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Session Date & Time
                </label>
                <div className="px-3 py-2 bg-white/10 rounded-md text-white/90">
                  {currentDateTime}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-2">Keyboard Shortcuts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white/20 rounded text-xs">Space</kbd>
                <span>Start/Stop Recording</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white/20 rounded text-xs">Ctrl+G</kbd>
                <span>Generate Report</span>
              </div>
            </div>
          </div>
        </header>

        <main>
          <div className="text-center mb-8">
            <button
              ref={recordButtonRef}
              onClick={toggleRecording}
              className={`w-32 h-32 rounded-full bg-[#D4A574] hover:bg-[#C19660] focus:outline-none focus:ring-4 focus:ring-[#D4A574]/50 transition-all duration-200 ${
                isRecording ? 'animate-pulse shadow-lg shadow-[#D4A574]/50' : ''
              }`}
              aria-label={isRecording ? 'Stop voice recording' : 'Start voice recording'}
              aria-pressed={isRecording}
            >
              <div className="flex items-center justify-center h-full">
                {isRecording ? (
                  <div className="w-8 h-8 bg-white rounded-sm" aria-hidden="true" />
                ) : (
                  <div className="w-0 h-0 border-l-[16px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1" aria-hidden="true" />
                )}
              </div>
            </button>
            
            <p className="mt-4 text-lg font-medium">
              {isRecording ? 'Recording...' : 'Press to Record'}
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Live Transcript</h2>
            <div 
              className="bg-white/10 rounded-lg p-4 min-h-[100px] border-2 border-white/20"
              aria-live="polite"
              aria-label="Live transcript"
            >
              {currentTranscript ? (
                <p className="text-white/90">{currentTranscript}</p>
              ) : (
                <p className="text-white/60 italic">Transcript will appear here...</p>
              )}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => addQuickEntry('observation')}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#1B365D]"
                aria-label="Add current transcript as observation"
              >
                Add Observation
              </button>
              
              <button
                onClick={() => addQuickEntry('care-activity')}
                className="px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[#1B365D]"
                aria-label="Add current transcript as care activity"
              >
                Add Care Activity
              </button>
              
              <button
                onClick={() => addQuickEntry('client-response')}
                className="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#1B365D]"
                aria-label="Add current transcript as client response"
              >
                Client Response
              </button>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Session Transcript</h2>
            <div className="bg-white/10 rounded-lg p-4 max-h-96 overflow-y-auto">
              {transcript.length === 0 ? (
                <p className="text-white/60 italic">No entries yet...</p>
              ) : (
                <ul className="space-y-4" role="list">
                  {transcript.map((entry) => (
                    <li key={entry.id} className="border-b border-white/20 pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(entry.type)}`}>
                          {getTypeLabel(entry.type)}
                        </span>
                        <time className="text-sm text-white/70" dateTime={entry.timestamp.toISOString()}>
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
              className="px-8 py-4 bg-[#D4A574] hover:bg-[#C19660] disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:ring-offset-2 focus:ring-offset-[#1B365D]"
              aria-label="Generate documentation report"
            >
              Generate Report
            </button>
            
            {(transcript.length === 0 ||
