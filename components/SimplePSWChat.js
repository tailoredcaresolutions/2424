'use client';

import React, { useState, useRef, useEffect } from 'react';
import GoldOrb3D from './GoldOrb3D';

const SimplePSWChat = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [shiftData, setShiftData] = useState({
    client_name: '',
    psw_name: '',
    observations: [],
    care_activities: [],
    client_responses: []
  });

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Speech Recognition setup
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-CA';

        recognitionRef.current.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
          setCurrentTranscript(transcript);

          // If final result, process it
          if (event.results[event.results.length - 1].isFinal) {
            handleVoiceInput(transcript);
            setCurrentTranscript('');
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          if (isListening) {
            try {
              recognitionRef.current.start(); // Restart if still listening
            } catch(err) {
              console.log('Recognition restart skipped');
            }
          }
        };
      }

      // Speech Synthesis setup
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Start session
  const handleStart = () => {
    setIsStarted(true);
    const welcomeMsg = "Hello! I'm your PSW documentation assistant. Tell me about your shift. What's the client's name?";
    
    setConversation([{
      role: 'assistant',
      content: welcomeMsg,
      timestamp: new Date().toISOString()
    }]);

    // Speak welcome message
    speakMessage(welcomeMsg);
    
    // Auto-start listening after welcome
    setTimeout(() => {
      startListening();
    }, 4000);
  };

  // Start listening
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Error starting recognition:', err);
      }
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Speak message
  const speakMessage = (text) => {
    if (synthRef.current) {
      synthRef.current.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      synthRef.current.speak(utterance);
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  // Handle voice input
  const handleVoiceInput = async (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };
    setConversation(prev => [...prev, userMsg]);

    // Process with AI
    setIsProcessing(true);
    try {
      const response = await fetch('/api/process-conversation-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: text,
          context: 'conversation',
          shiftData,
          conversation: [...conversation, userMsg],
          language: 'en-CA'
        })
      });

      const data = await response.json();

      // Add AI response
      const aiMsg = {
        role: 'assistant',
        content: data.response || data.noteText || "I'm listening. Please continue.",
        timestamp: new Date().toISOString()
      };
      setConversation(prev => [...prev, aiMsg]);

      // Update shift data if extracted
      if (data.updatedShiftData) {
        setShiftData(data.updatedShiftData);
      }

      // Speak response
      speakMessage(aiMsg.content);

    } catch (error) {
      console.error('Error processing input:', error);
      const errorMsg = {
        role: 'assistant',
        content: "I'm having trouble processing that. Could you repeat?",
        timestamp: new Date().toISOString()
      };
      setConversation(prev => [...prev, errorMsg]);
      speakMessage(errorMsg.content);
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate report
  const handleGenerateReport = async () => {
    setIsProcessing(true);
    stopListening();
    stopSpeaking();

    try {
      const response = await fetch('/api/generate-ai-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shiftData,
          conversation
        })
      });

      const data = await response.json();

      // Add report to conversation
      const reportMsg = {
        role: 'assistant',
        content: `📋 **Report Generated**\n\n${data.report}\n\n✅ DAR documentation complete!`,
        timestamp: new Date().toISOString(),
        isReport: true
      };
      setConversation(prev => [...prev, reportMsg]);

    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // If not started, show welcome screen
  if (!isStarted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4"
        style={{
          background: 'linear-gradient(135deg, #1A1F2E 0%, #242936 100%)'
        }}>
        
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <GoldOrb3D size={120} isActive={false} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            PSW Voice Documentation
          </h1>
          <p className="text-lg text-white/70 mb-1">
            Tailored Care Solutions
          </p>
          <p className="text-sm text-white/50 max-w-md mx-auto">
            Document your shift naturally with voice. PHIPA-compliant for Ontario healthcare.
          </p>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          className="group relative px-12 py-6 rounded-full text-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #D4A574 0%, #C9A86A 100%)',
            color: '#1A1F2E'
          }}>
          <span className="flex items-center gap-3">
            <span className="text-2xl">🎤</span>
            <span>Start Documentation</span>
          </span>
          <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>

        {/* Info */}
        <div className="mt-8 text-center text-white/60 text-sm max-w-md">
          <p className="mb-2">✓ Voice-powered conversation</p>
          <p className="mb-2">✓ Automatic DAR formatting</p>
          <p className="mb-2">✓ Multi-language support</p>
          <p>✓ 100% local AI processing</p>
        </div>
      </div>
    );
  }

  // Main conversation interface
  return (
    <div className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #1A1F2E 0%, #242936 100%)'
      }}>
      
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-lg border-b"
        style={{
          background: 'rgba(14, 21, 53, 0.9)',
          borderColor: 'rgba(227, 162, 72, 0.2)'
        }}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12">
              <GoldOrb3D size={48} isActive={isListening || isSpeaking} />
            </div>
            <div>
              <h2 className="text-white font-semibold text-sm">PSW Documentation</h2>
              <p className="text-white/60 text-xs">
                {isListening ? '🎤 Listening...' : isSpeaking ? '🔊 Speaking...' : isProcessing ? '⏳ Processing...' : '✓ Ready'}
              </p>
            </div>
          </div>
          
          {conversation.length > 2 && (
            <button
              onClick={handleGenerateReport}
              disabled={isProcessing}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
              style={{
                background: 'linear-gradient(135deg, #D4A574 0%, #C9A86A 100%)',
                color: '#1A1F2E'
              }}>
              Generate Report
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {conversation.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-[#D4A574] to-[#D4A574] text-[#1A1F2E]'
                  : msg.isReport
                    ? 'bg-white text-gray-900'
                    : 'bg-white/10 text-white border border-white/20'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-xs mt-1 ${
                  msg.role === 'user' ? 'text-[#1A1F2E]/60' : 'text-white/40'
                }`}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {/* Current transcript preview */}
          {currentTranscript && (
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gradient-to-r from-[#D4A574]/50 to-[#D4A574]/50 text-white border-2 border-dashed border-[#D4A574]">
                <p className="text-sm italic">{currentTranscript}</p>
                <p className="text-xs mt-1 text-white/60">Transcribing...</p>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Controls */}
      <div className="sticky bottom-0 backdrop-blur-lg border-t"
        style={{
          background: 'rgba(14, 21, 53, 0.9)',
          borderColor: 'rgba(227, 162, 72, 0.2)'
        }}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-4">
            
            {/* Microphone Button */}
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              className={`relative w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all transform ${
                isListening 
                  ? 'scale-110 shadow-lg' 
                  : 'hover:scale-105'
              }`}
              style={{
                background: isListening 
                  ? 'linear-gradient(135deg, #ff4444 0%, #ff6666 100%)'
                  : 'linear-gradient(135deg, #D4A574 0%, #C9A86A 100%)',
                boxShadow: isListening ? '0 0 30px rgba(255, 68, 68, 0.6)' : '0 4px 12px rgba(227, 162, 72, 0.3)'
              }}>
              <span>{isListening ? '⏸️' : '🎤'}</span>
              {isListening && (
                <span className="absolute inset-0 rounded-full animate-ping"
                  style={{
                    background: 'rgba(255, 68, 68, 0.4)'
                  }}></span>
              )}
            </button>

            {/* Stop Speaking Button */}
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all transform hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #666 0%, #888 100%)'
                }}>
                <span>🔇</span>
              </button>
            )}
          </div>
          
          <p className="text-center text-white/50 text-xs mt-3">
            {isListening ? 'Tap to pause • Speaking continuously' : 'Tap microphone to start speaking'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimplePSWChat;
