'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        const base64 = result.split(',')[1] || '';
        resolve(base64);
      } else {
        reject(new Error('Unable to read audio data'));
      }
    };
    reader.onerror = () => reject(new Error('Unable to read audio data'));
    reader.readAsDataURL(blob);
  });

// Phase 1 Q3: Move constants outside component to prevent recreation on every render
// Tailored Care Solutions brand colors
const brandColors = {
  blue: '#1B365D',      // Primary dark blue
  gold: '#c9a063',      // Primary gold (from avatar package)
  lightBlue: '#E8F0F5',
  lightGold: '#F5EFE6',
  darkBlue: '#0F1E3A',
  accentGold: '#d4b078'  // Secondary gold (from avatar package)
};

// Phase 2 Q2: LocalStorage utilities for conversation history
const STORAGE_KEY = 'psw_saved_sessions';
const CURRENT_SESSION_KEY = 'psw_current_session';
const SESSION_EXPIRY_DAYS = 30;

const saveSessionToLocalStorage = (session) => {
  try {
    const savedSessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const existingIndex = savedSessions.findIndex(s => s.id === session.id);

    if (existingIndex >= 0) {
      savedSessions[existingIndex] = session;
    } else {
      savedSessions.push(session);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSessions));
    return true;
  } catch (error) {
    console.error('Error saving session:', error);
    return false;
  }
};

const loadSessionsFromLocalStorage = () => {
  try {
    const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const now = Date.now();
    const expiryMs = SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    // Filter out expired sessions
    const activeSessions = sessions.filter(s => {
      const age = now - new Date(s.savedAt).getTime();
      return age < expiryMs;
    });

    // Update storage if sessions were expired
    if (activeSessions.length !== sessions.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activeSessions));
    }

    return activeSessions;
  } catch (error) {
    console.error('Error loading sessions:', error);
    return [];
  }
};

const deleteSessionFromLocalStorage = (sessionId) => {
  try {
    const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const filtered = sessions.filter(s => s.id !== sessionId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting session:', error);
    return false;
  }
};

const saveCurrentSession = (conversation, report, reportSections) => {
  try {
    const session = {
      conversation,
      report,
      reportSections,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Error saving current session:', error);
  }
};

const loadCurrentSession = () => {
  try {
    const session = localStorage.getItem(CURRENT_SESSION_KEY);
    if (session) {
      return JSON.parse(session);
    }
  } catch (error) {
    console.error('Error loading current session:', error);
  }
  return null;
};

const clearCurrentSession = () => {
  try {
    localStorage.removeItem(CURRENT_SESSION_KEY);
  } catch (error) {
    console.error('Error clearing current session:', error);
  }
};

// Phase 2 Q1: Parse report into collapsible sections
const parseReportIntoSections = (reportText) => {
  if (!reportText) return [];

  // Split report into lines
  const lines = reportText.split('\n');
  const sections = [];
  let currentSection = null;

  // Patterns for section headers:
  // 1. All caps line (OBSERVATIONS:, CARE PROVIDED:, etc.)
  // 2. Lines ending with colon followed by content
  // 3. Lines that are significantly shorter (likely headers)

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Skip empty lines
    if (!trimmedLine) {
      if (currentSection) {
        currentSection.content += '\n';
      }
      return;
    }

    // Check if this is a section header
    const isAllCaps = /^[A-Z\s:]+$/.test(trimmedLine) && trimmedLine.length > 3;
    const endsWithColon = trimmedLine.endsWith(':') && trimmedLine.length < 50;
    const isHeader = trimmedLine.includes('===') || trimmedLine === '--- END OF REPORT ---';

    // Special handling for main header and footer
    if (index < 6 || trimmedLine === '--- END OF REPORT ---' || trimmedLine.startsWith('ATTESTATION')) {
      // These are part of header/footer, create special sections
      if (!currentSection || currentSection.title !== 'Header') {
        if (currentSection) sections.push(currentSection);
        currentSection = {
          id: `section-${sections.length}`,
          title: index < 6 ? 'Header' : 'Attestation',
          content: trimmedLine + '\n',
          isExpanded: index < 6, // Header collapsed by default, footer expanded
          isSpecial: true
        };
      } else {
        currentSection.content += line + '\n';
      }
    } else if ((isAllCaps || endsWithColon) && !isHeader) {
      // Start a new section
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        id: `section-${sections.length}`,
        title: trimmedLine.replace(/:$/, ''), // Remove trailing colon
        content: '',
        isExpanded: true,
        isSpecial: false
      };
    } else {
      // Add to current section or create default section
      if (!currentSection) {
        currentSection = {
          id: `section-${sections.length}`,
          title: 'Report Content',
          content: line + '\n',
          isExpanded: true,
          isSpecial: false
        };
      } else {
        currentSection.content += line + '\n';
      }
    }
  });

  // Push the last section
  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
};

const PSWVoiceReporter = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [conversation, setConversation] = useState([]);
  const [currentResponse, setCurrentResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-CA');
  const [report, setReport] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [isReportGenerating, setIsReportGenerating] = useState(false);

  // Cross-browser compatibility states
  const [browserSupport, setBrowserSupport] = useState({
    speechRecognition: false,
    speechSynthesis: false,
    mediaDevices: false,
    audioRecording: false
  });
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isIOS, setIsIOS] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [recordingError, setRecordingError] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);

  const voiceAvailable = useMemo(
    () => browserSupport.speechRecognition || browserSupport.audioRecording,
    [browserSupport]
  );
  const isSendDisabled = !textInput.trim() || isProcessing || isTranscribing;

  // Phase 1 Q2: Turn-taking enforcement
  const [consecutiveAIMessages, setConsecutiveAIMessages] = useState(0);

  // Phase 1 Q2: Message length limits - track expanded messages
  const [expandedMessages, setExpandedMessages] = useState(new Set());

  // Phase 1 Q4: Keyboard shortcuts overlay state
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Phase 1 Q4: Success toast notification state
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Phase 2 Q1: Progressive disclosure - Report sections
  const [reportSections, setReportSections] = useState([]);
  const [allSectionsExpanded, setAllSectionsExpanded] = useState(true);

  // Phase 2 Q2: Conversation history - Session management
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [savedSessions, setSavedSessions] = useState([]);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [sessionToResume, setSessionToResume] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // DAR JSON Integration: Store structured DAR data
  const [darJson, setDarJson] = useState(null);
  const [showDarJson, setShowDarJson] = useState(false);

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const conversationEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);

  const languages = {
    'en-CA': 'English (Canadian)',
    'fil-PH': 'Filipino',
    'es-ES': 'Spanish',
    'pt-BR': 'Portuguese',
    'bo': 'Tibetan',
    'hi-IN': 'Hindi'
  };

  // Detect browser and device capabilities
  useEffect(() => {
    const detectBrowserSupport = () => {
      // Detect iOS
      const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      setIsIOS(iOS);

      // Detect Safari
      const safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      setIsSafari(safari);

      // Check Speech Recognition API
      const speechRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      
      // Check Speech Synthesis API
      const speechSynthesisSupported = 'speechSynthesis' in window;
      
      // Check MediaDevices API
      const mediaDevicesSupported = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
      const audioRecordingSupported =
        mediaDevicesSupported && typeof window.MediaRecorder !== 'undefined';

      setBrowserSupport({
        speechRecognition: speechRecognitionSupported && !iOS, // iOS Safari has poor support
        speechSynthesis: speechSynthesisSupported,
        mediaDevices: mediaDevicesSupported,
        audioRecording: audioRecordingSupported
      });

      // Only show text input as fallback if voice completely fails
      if ((!speechRecognitionSupported || iOS) && !audioRecordingSupported) {
        setShowTextInput(true);
      }
    };

    detectBrowserSupport();
  }, []);

  useEffect(() => {
    if (browserSupport.speechRecognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage;

      recognition.onstart = () => {
        setTranscript('Listening...');
        setRecordingError('');
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript('');
          handleSpeechInput(finalTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setTranscript('');
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setShowTextInput(true);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setTranscript('');
      };

      recognitionRef.current = recognition;
    } else {
      recognitionRef.current = null;
    }

    if (browserSupport.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }

    scrollToBottom();

    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      stopMediaStream();
    };
  }, [
    browserSupport.speechRecognition,
    browserSupport.speechSynthesis,
    handleSpeechInput,
    scrollToBottom,
    selectedLanguage,
    stopMediaStream
  ]);

  useEffect(() => {
    if (conversation.length === 0 && !isProcessing) {
      startConversation();
    }
  }, [conversation.length, isProcessing, startConversation]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversation, currentResponse, scrollToBottom]);

  // Phase 2 Q2: Auto-save current session (debounced)
  useEffect(() => {
    if (conversation.length > 0) {
      const timeoutId = setTimeout(() => {
        saveCurrentSession(conversation, report, reportSections);
      }, 500); // Debounce 500ms

      return () => clearTimeout(timeoutId);
    }
  }, [conversation, report, reportSections]);

  // Phase 2 Q2: Resume session on mount
  useEffect(() => {
    // Load saved sessions list
    setSavedSessions(loadSessionsFromLocalStorage());

    // Check for resumable session
    const currentSession = loadCurrentSession();
    if (currentSession && currentSession.conversation.length > 0) {
      const sessionAge = Date.now() - new Date(currentSession.savedAt).getTime();
      // Only prompt if session is less than 24 hours old
      if (sessionAge < 24 * 60 * 60 * 1000) {
        setSessionToResume(currentSession);
        setShowResumePrompt(true);
      }
    }
  }, []);

  // Phase 1 Q2: Keyboard shortcuts for accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.code === 'Space' &&
        voiceAvailable &&
        !showTextInput &&
        !isProcessing &&
        !isTranscribing &&
        !isListening
      ) {
        if (document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'INPUT') {
          e.preventDefault();
          toggleListening();
        }
      }

      if (e.code === 'Escape') {
        if (showKeyboardShortcuts) {
          setShowKeyboardShortcuts(false);
        } else if (isListening && voiceAvailable) {
          toggleListening();
        } else if (report) {
          setReport('');
          setShowReport(false);
        }
      }

      if (e.key === '?' && !showTextInput) {
        if (document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'INPUT') {
          e.preventDefault();
          setShowKeyboardShortcuts(prev => !prev);
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.code === 'Enter') {
        if (conversation.length > 1 && !isReportGenerating) {
          e.preventDefault();
          generateReport();
        }
      }
    };

    const handleKeyUp = (e) => {
      if (
        e.code === 'Space' &&
        voiceAvailable &&
        isListening &&
        !showTextInput &&
        !isTranscribing
      ) {
        if (document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'INPUT') {
          e.preventDefault();
          toggleListening();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    conversation,
    generateReport,
    isListening,
    isProcessing,
    isReportGenerating,
    isTranscribing,
    report,
    showKeyboardShortcuts,
    showTextInput,
    toggleListening,
    voiceAvailable
  ]);

  const startConversation = useCallback(() => {
    const welcomeMessage = {
      type: 'ai',
      content: 'Hello! I\'m here to help you document your shift. Let\'s start - what\'s your name?',
      timestamp: new Date()
    };
    setConversation([welcomeMessage]);
  }, []);

  // Enhanced audio playback for cross-browser compatibility
  const playAudio = useCallback(async (audioUrl) => {
    try {
      const audio = new Audio(audioUrl);

      if (isIOS) {
        audio.muted = false;
        audio.volume = 1.0;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.warn('Audio autoplay prevented on iOS:', error);
          });
        }
      } else {
        await audio.play();
      }
    } catch (error) {
      console.error('Audio playback failed:', error);
    }
  }, [isIOS]);

  const generateReport = useCallback(async () => {
    setIsReportGenerating(true);
    try {
      const response = await fetch('/api/generate-ai-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation,
          language: selectedLanguage
        })
      });

      const data = await response.json();
      if (data.success) {
        setReport(data.noteText || data.report);
        setDarJson(data.dar);
        setShowReport(true);

        const sections = parseReportIntoSections(data.noteText || data.report);
        setReportSections(sections);
        setAllSectionsExpanded(true);

        setSuccessMessage('✅ DAR Report generated successfully!');
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 4000);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsReportGenerating(false);
    }
  }, [conversation, selectedLanguage]);

  const handleSpeechInput = useCallback(async (text) => {
    const sanitized = text.trim();
    if (!sanitized || isProcessing) return;

    setIsProcessing(true);
    const userMessage = { type: 'user', content: sanitized, timestamp: new Date() };
    setConversation(prev => [...prev, userMessage]);

    setConsecutiveAIMessages(0);

    try {
      const response = await fetch('/api/process-conversation-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: sanitized,
          conversationHistory: [...conversation, userMessage],
          language: selectedLanguage,
          consecutiveAIMessages
        })
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage = {
          type: 'ai',
          content: data.response,
          timestamp: new Date(),
          audioUrl: data.audioUrl
        };
        setConversation(prev => [...prev, aiMessage]);
        setConsecutiveAIMessages(prev => prev + 1);

        if (data.audioUrl) {
          await playAudio(data.audioUrl);
        }

        if (data.documentationComplete) {
          setTimeout(() => generateReport(), 2000);
        }
      } else {
        const errorMessage = {
          type: 'ai',
          content: data.error || 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date()
        };
        setConversation(prev => [...prev, errorMessage]);
        setConsecutiveAIMessages(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error processing conversation:', error);
      const errorMessage = {
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setConversation(prev => [...prev, errorMessage]);
      setConsecutiveAIMessages(prev => prev + 1);
    } finally {
      setIsProcessing(false);
      setTranscript('');
    }
  }, [consecutiveAIMessages, conversation, generateReport, isProcessing, playAudio, selectedLanguage]);

  const stopMediaStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  const startFallbackRecording = useCallback(async () => {
    if (!browserSupport.mediaDevices || typeof window === 'undefined' || typeof window.MediaRecorder === 'undefined') {
      setRecordingError('Microphone access is not available on this device.');
      setShowTextInput(true);
      return;
    }

    try {
      setRecordingError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      let mimeType;
      if (typeof window.MediaRecorder.isTypeSupported === 'function') {
        const preferredTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
        mimeType = preferredTypes.find(type => window.MediaRecorder.isTypeSupported(type));
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        setRecordingError(event.error?.message || 'Recording failed.');
        setIsListening(false);
        setTranscript('');
        mediaRecorderRef.current = null;
        stopMediaStream();
      };

      recorder.onstop = async () => {
        try {
          setIsTranscribing(true);
          const chunks = audioChunksRef.current;
          audioChunksRef.current = [];
          const blob = new Blob(chunks, { type: recorder.mimeType || mimeType || 'audio/webm' });

          if (!blob || blob.size === 0) {
            throw new Error('No audio captured. Please try again.');
          }

          setTranscript('Transcribing...');
          const base64Audio = await blobToBase64(blob);

          const response = await fetch('/api/transcribe-whisper', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioData: base64Audio,
              format: (recorder.mimeType || mimeType || 'audio/webm').split('/')[1] || 'webm',
              language: selectedLanguage
            })
          });

          const data = await response.json();

          if (data.success && data.transcript) {
            setTranscript('');
            await handleSpeechInput(data.transcript);
            setRecordingError('');
          } else {
            throw new Error(data.error || 'Transcription failed.');
          }
        } catch (error) {
          console.error('Transcription error:', error);
          setRecordingError(error.message || 'Transcription failed.');
        } finally {
          setIsListening(false);
          setIsTranscribing(false);
          setTranscript('');
          mediaRecorderRef.current = null;
          stopMediaStream();
        }
      };

      recorder.start();
      setTranscript('Listening...');
      setIsListening(true);
    } catch (error) {
      console.error('Microphone access denied or error:', error);
      setRecordingError(error.message || 'Microphone access denied.');
      setIsListening(false);
      setTranscript('');
      mediaRecorderRef.current = null;
      stopMediaStream();
      setShowTextInput(true);
    }
  }, [browserSupport.mediaDevices, handleSpeechInput, selectedLanguage, stopMediaStream]);

  const stopFallbackRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    } else {
      setIsListening(false);
      stopMediaStream();
    }
  }, [stopMediaStream]);

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      handleSpeechInput(textInput.trim());
      setTextInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  };

  const toggleListening = useCallback(async () => {
    if (browserSupport.speechRecognition) {
      if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
        setTranscript('');
      } else {
        try {
          if (browserSupport.mediaDevices) {
            await navigator.mediaDevices.getUserMedia({ audio: true });
          }
          recordingError && setRecordingError('');
          recognitionRef.current?.start();
          setIsListening(true);
        } catch (error) {
          console.error('Microphone access denied or error:', error);
          setShowTextInput(true);
          alert('Microphone access is required for voice input. Please use the text input instead.');
        }
      }
      return;
    }

    if (browserSupport.audioRecording) {
      if (isListening) {
        stopFallbackRecording();
      } else {
        await startFallbackRecording();
      }
      return;
    }

    setShowTextInput(true);
    alert('Voice recording is not supported on this device. Please use the text input instead.');
  }, [
    browserSupport,
    isListening,
    recordingError,
    startFallbackRecording,
    stopFallbackRecording
  ]);

  const startNewSession = () => {
    setConversation([]);
    setReport('');
    setShowReport(false);
    setCurrentResponse('');
    setTextInput('');
    setTranscript('');
    setRecordingError('');
    setShowTextInput(!voiceAvailable);

    // Phase 1 Q2: Reset consecutive AI messages counter on new session
    setConsecutiveAIMessages(0);

    // Restart conversation
    setTimeout(() => startConversation(), 500);
  };

  // Phase 1 Q2: Message length limit helpers
  // Phase 1 Q3: Optimized with useCallback to prevent function recreation
  const isMessageTooLong = useCallback((content) => {
    // Approximate: 60 words ≈ 300-400 characters ≈ 3 lines at normal screen width
    const wordCount = content.split(/\s+/).length;
    return wordCount > 60 || content.length > 300;
  }, []);

  const toggleMessageExpansion = useCallback((messageIndex) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageIndex)) {
        newSet.delete(messageIndex);
      } else {
        newSet.add(messageIndex);
      }
      return newSet;
    });
  }, []);

  const getTruncatedContent = useCallback((content) => {
    const words = content.split(/\s+/);
    if (words.length <= 60) return content;
    return words.slice(0, 60).join(' ') + '...';
  }, []);

  // Phase 2 Q1: Section expansion handlers
  const toggleSection = useCallback((sectionId) => {
    setReportSections(prevSections =>
      prevSections.map(section =>
        section.id === sectionId
          ? { ...section, isExpanded: !section.isExpanded }
          : section
      )
    );
  }, []);

  const toggleAllSections = useCallback(() => {
    const newExpandedState = !allSectionsExpanded;
    setReportSections(prevSections =>
      prevSections.map(section => ({
        ...section,
        isExpanded: newExpandedState
      }))
    );
    setAllSectionsExpanded(newExpandedState);
  }, [allSectionsExpanded]);

  // Phase 2 Q2: Manual session save handler
  const handleSaveSession = useCallback(() => {
    if (conversation.length === 0) {
      alert('No conversation to save yet. Start documenting first!');
      return;
    }

    const session = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      conversation,
      report,
      reportSections,
      savedAt: new Date().toISOString(),
      messageCount: conversation.length
    };

    const success = saveSessionToLocalStorage(session);
    if (success) {
      setCurrentSessionId(session.id);
      setSavedSessions(loadSessionsFromLocalStorage());
      setSuccessMessage('💾 Session saved successfully!');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
    } else {
      alert('Failed to save session. Storage might be full.');
    }
  }, [conversation, report, reportSections]);

  // Phase 2 Q2: Open saved sessions list
  const handleOpenSessions = useCallback(() => {
    setSavedSessions(loadSessionsFromLocalStorage());
    setShowSessionsModal(true);
  }, []);

  // Tailored Care Solutions Logo Component - Enhanced with premium animations and effects
  const TailoredCareLogo = () => (
    <div className="flex items-center justify-center mb-12">
      <div className="flex flex-col items-center">
        {/* Logo Symbol with enhanced animations */}
        <div className="mb-4 relative">
          {/* Glow effect behind logo */}
          <div
            className="absolute inset-0 rounded-lg blur-xl opacity-30 animate-pulse"
            style={{
              background: `linear-gradient(135deg, ${brandColors.blue}, ${brandColors.gold})`,
              transform: 'scale(1.2)'
            }}
          />

          <svg
            width="80"
            height="50"
            viewBox="0 0 60 40"
            className="drop-shadow-2xl relative z-10 transition-transform duration-500 hover:scale-110"
          >
            <defs>
              <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={brandColors.blue} />
                <stop offset="100%" stopColor={brandColors.darkBlue} />
              </linearGradient>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={brandColors.gold} />
                <stop offset="100%" stopColor={brandColors.accentGold} />
              </linearGradient>
              {/* Enhanced gradients with more stops */}
              <linearGradient id="blueShine" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={brandColors.lightBlue} />
                <stop offset="50%" stopColor={brandColors.blue} />
                <stop offset="100%" stopColor={brandColors.darkBlue} />
              </linearGradient>
              <linearGradient id="goldShine" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={brandColors.lightGold} />
                <stop offset="50%" stopColor={brandColors.gold} />
                <stop offset="100%" stopColor={brandColors.accentGold} />
              </linearGradient>
            </defs>
            {/* Enhanced blue leaf/wing with shine effect */}
            <path
              d="M10 35 Q30 5 45 20 Q35 30 20 35 Q15 37 10 35 Z"
              fill="url(#blueShine)"
              className="transition-all duration-300"
            />
            {/* Enhanced gold leaf/wing with shine effect */}
            <path
              d="M25 15 Q45 5 55 25 Q50 35 35 30 Q30 25 25 15 Z"
              fill="url(#goldShine)"
              className="transition-all duration-300"
            />
            {/* Subtle highlight overlay */}
            <path
              d="M15 30 Q35 8 48 22 Q38 32 22 35 Q17 36 15 30 Z"
              fill="url(#blueGradient)"
              opacity="0.3"
              className="animate-pulse"
            />
          </svg>
        </div>

        {/* Enhanced Company Name with premium typography */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-light tracking-wider mb-2 transition-all duration-500 hover:scale-105">
            <span
              className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent font-medium"
              style={{
                background: `linear-gradient(135deg, ${brandColors.blue}, ${brandColors.darkBlue})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Tailored Care
            </span>
            <span
              className="ml-2 bg-gradient-to-r from-yellow-500 to-yellow-700 bg-clip-text text-transparent font-semibold"
              style={{
                background: `linear-gradient(135deg, ${brandColors.gold}, ${brandColors.accentGold})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Solutions
            </span>
          </h1>

          {/* Enhanced subtitle with premium styling */}
          <div
            className="mt-3 text-xl text-gray-600 font-light px-4 py-2 rounded-full backdrop-blur-sm border border-gray-200 shadow-lg"
            style={{
              backgroundColor: `${brandColors.lightBlue}80`,
              borderColor: brandColors.blue
            }}
          >
            PSW Voice Documentation System
          </div>

          {/* Status indicator */}
          <div className="mt-4 flex items-center justify-center space-x-2">
            <div
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: brandColors.gold }}
            />
            <span className="text-sm font-medium text-gray-700">
              AI-Powered • HIPAA Compliant • Ontario PSW Standards
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // Phase 1 Q1: Typing Indicator Component
  const TypingIndicator = () => {
    return (
      <div className="flex justify-start">
        <div className="bg-gray-100 px-4 py-3 rounded-lg">
          <div className="flex items-center space-x-1">
            <div
              className="w-2 h-2 rounded-full animate-typing-bounce"
              style={{
                backgroundColor: brandColors.blue,
                animationDelay: '0ms'
              }}
            />
            <div
              className="w-2 h-2 rounded-full animate-typing-bounce"
              style={{
                backgroundColor: brandColors.blue,
                animationDelay: '150ms'
              }}
            />
            <div
              className="w-2 h-2 rounded-full animate-typing-bounce"
              style={{
                backgroundColor: brandColors.blue,
                animationDelay: '300ms'
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  // Phase 1 Q4: Keyboard Shortcuts Overlay - Premium discoverability
  const KeyboardShortcutsOverlay = () => {
    if (!showKeyboardShortcuts) return null;

    const shortcuts = [
      { key: 'Space', description: 'Push-to-talk (hold to record, release to stop)', icon: '🎤' },
      { key: 'Escape', description: 'Cancel operation or close dialogs', icon: '⛔' },
      { key: 'Ctrl/Cmd + Enter', description: 'Generate documentation report', icon: '📄' },
      { key: '?', description: 'Show/hide this shortcuts menu', icon: '❓' },
      { key: 'Tab', description: 'Navigate between interactive elements', icon: '⇥' },
    ];

    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
          onClick={() => setShowKeyboardShortcuts(false)}
          style={{ backdropFilter: 'blur(4px)' }}
        />

        {/* Modal */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto transform transition-all"
            style={{
              animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {/* Header */}
            <div
              className="px-6 py-4 border-b border-gray-200 flex items-center justify-between"
              style={{ backgroundColor: brandColors.lightBlue }}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">⌨️</span>
                <h3 className="text-lg font-bold" style={{ color: brandColors.darkBlue }}>
                  Keyboard Shortcuts
                </h3>
              </div>
              <button
                onClick={() => setShowKeyboardShortcuts(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close shortcuts overlay"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4 space-y-3 max-h-96 overflow-y-auto">
              {shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl flex-shrink-0">{shortcut.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <kbd
                        className="px-2 py-1 text-xs font-semibold rounded shadow-sm"
                        style={{
                          backgroundColor: brandColors.lightBlue,
                          color: brandColors.darkBlue,
                          border: `1px solid ${brandColors.blue}`
                        }}
                      >
                        {shortcut.key}
                      </kbd>
                    </div>
                    <p className="text-sm text-gray-600">{shortcut.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
              <p className="text-xs text-gray-500 text-center">
                Press <kbd className="px-1 py-0.5 text-xs font-semibold bg-white border border-gray-300 rounded">?</kbd> anytime to toggle this menu
              </p>
            </div>
          </div>
        </div>

        {/* Slide up animation */}
        <style jsx>{`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}</style>
      </>
    );
  };

  // Phase 1 Q4: Success Toast Notification - Premium feedback
  const SuccessToast = () => {
    if (!showSuccessToast) return null;

    return (
      <div
        className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-2xl p-4 flex items-center space-x-3 success-animation"
        style={{
          animation: 'toast-slide-in 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          border: `2px solid ${brandColors.gold}`,
          minWidth: '300px'
        }}
      >
        {/* Success Icon */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: brandColors.gold }}
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Message */}
        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color: brandColors.darkBlue }}>
            {successMessage}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setShowSuccessToast(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close notification"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  };

  // Phase 1 Q4: Conversation Progress Indicator
  const ConversationProgress = () => {
    // Estimate conversation completeness based on message count
    // Typical shift needs ~8-12 exchanges
    const minMessages = 4; // Minimum to show progress
    const targetMessages = 10; // Target for complete documentation
    const progressPercentage = Math.min(100, (conversation.length / targetMessages) * 100);

    if (conversation.length < minMessages) return null;

    return (
      <div className="max-w-2xl mx-auto mb-4">
        <div className="bg-white rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">
              Documentation Progress
            </span>
            <span className="text-xs font-bold" style={{ color: brandColors.gold }}>
              {Math.round(progressPercentage)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ transform: `scaleX(${progressPercentage / 100})` }}
            />
          </div>

          {/* Progress Message */}
          <p className="text-xs text-gray-500 mt-2">
            {progressPercentage < 50 && '🚀 Good start! Keep going...'}
            {progressPercentage >= 50 && progressPercentage < 80 && '💪 Great progress! Almost there...'}
            {progressPercentage >= 80 && progressPercentage < 100 && '🎯 Excellent! Ready to generate report!'}
            {progressPercentage >= 100 && '✅ Complete! Click "Generate Report" below'}
          </p>
        </div>
      </div>
    );
  };

  // Phase 2 Q2: Resume Session Prompt - Shows when resumable session detected
  const ResumeSessionPrompt = () => {
    if (!showResumePrompt || !sessionToResume) return null;

    const handleResume = () => {
      setConversation(sessionToResume.conversation);
      setReport(sessionToResume.report || '');
      setReportSections(sessionToResume.reportSections || []);
      if (sessionToResume.report) {
        setShowReport(true);
      }
      setShowResumePrompt(false);
      setSuccessMessage('✅ Session resumed successfully!');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
    };

    const handleDismiss = () => {
      clearCurrentSession();
      setShowResumePrompt(false);
    };

    const messageCount = sessionToResume.conversation?.length || 0;
    const lastSaved = new Date(sessionToResume.savedAt).toLocaleString();

    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
          onClick={handleDismiss}
          style={{ backdropFilter: 'blur(4px)' }}
        />

        {/* Modal */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto"
            style={{ animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold" style={{ color: brandColors.darkBlue }}>
                Resume Session?
              </h2>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                You have an unfinished documentation session from:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Last saved:</strong> {lastSaved}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Messages:</strong> {messageCount}
                </p>
              </div>
              <p className="text-sm text-gray-500">
                Would you like to continue where you left off?
              </p>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleDismiss}
                className="px-4 py-2 rounded-lg font-medium transition-all hover:bg-gray-100"
                style={{ color: brandColors.darkBlue }}
              >
                Start Fresh
              </button>
              <button
                onClick={handleResume}
                className="px-6 py-2 rounded-lg text-white font-medium transition-all hover:shadow-lg"
                style={{ backgroundColor: brandColors.gold }}
              >
                Resume Session
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  // Phase 2 Q2: Saved Sessions List - Modal showing all saved sessions
  const SavedSessionsList = () => {
    if (!showSessionsModal) return null;

    const handleLoadSession = (session) => {
      setConversation(session.conversation);
      setReport(session.report || '');
      setReportSections(session.reportSections || []);
      if (session.report) {
        setShowReport(true);
      }
      setCurrentSessionId(session.id);
      setShowSessionsModal(false);
      setSuccessMessage('✅ Session loaded successfully!');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
    };

    const handleDeleteSession = (sessionId) => {
      if (confirm('Are you sure you want to delete this session?')) {
        deleteSessionFromLocalStorage(sessionId);
        setSavedSessions(loadSessionsFromLocalStorage());
        setSuccessMessage('🗑️ Session deleted');
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      }
    };

    const handleClearAll = () => {
      if (confirm('Delete ALL saved sessions? This cannot be undone.')) {
        localStorage.removeItem(STORAGE_KEY);
        setSavedSessions([]);
        setSuccessMessage('🗑️ All sessions cleared');
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      }
    };

    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
          onClick={() => setShowSessionsModal(false)}
          style={{ backdropFilter: 'blur(4px)' }}
        />

        {/* Modal */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full pointer-events-auto max-h-[80vh] flex flex-col"
            style={{ animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold" style={{ color: brandColors.darkBlue }}>
                Saved Sessions ({savedSessions.length})
              </h2>
              {savedSessions.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-sm px-3 py-1 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Content - Scrollable list */}
            <div className="p-6 overflow-y-auto flex-1">
              {savedSessions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-2">No saved sessions yet</p>
                  <p className="text-sm text-gray-400">
                    Your conversations are automatically saved as you work
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedSessions.map((session) => {
                    const savedDate = new Date(session.savedAt);
                    const messageCount = session.conversation?.length || 0;
                    const firstMessage = session.conversation?.[0]?.content?.substring(0, 60) || 'No messages';

                    return (
                      <div
                        key={session.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm font-semibold" style={{ color: brandColors.darkBlue }}>
                                {savedDate.toLocaleDateString()} at {savedDate.toLocaleTimeString()}
                              </span>
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                                {messageCount} messages
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                              {firstMessage}{firstMessage.length >= 60 ? '...' : ''}
                            </p>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleLoadSession(session)}
                                className="px-4 py-2 rounded-lg text-white font-medium transition-all hover:shadow-md text-sm"
                                style={{ backgroundColor: brandColors.gold }}
                              >
                                Load Session
                              </button>
                              <button
                                onClick={() => handleDeleteSession(session.id)}
                                className="px-4 py-2 rounded-lg font-medium transition-all hover:bg-red-50 text-red-600 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowSessionsModal(false)}
                className="px-6 py-2 rounded-lg font-medium transition-all hover:bg-gray-100"
                style={{ color: brandColors.darkBlue }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  // Phase 2 Q1: Collapsible Report Section Component
  const CollapsibleSection = ({ section, onToggle }) => {
    const [isAnimating, setIsAnimating] = useState(false);

    const handleToggle = () => {
      setIsAnimating(true);
      onToggle(section.id);
      setTimeout(() => setIsAnimating(false), 300);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleToggle();
      }
    };

    // Get first 2 lines as preview when collapsed
    const getPreview = () => {
      const lines = section.content.trim().split('\n').filter(l => l.trim());
      return lines.slice(0, 2).join('\n') + (lines.length > 2 ? '...' : '');
    };

    return (
      <div className="mb-3 bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        {/* Section Header */}
        <button
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          className="w-full px-4 py-3 flex items-center justify-between transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-expanded={section.isExpanded}
          aria-controls={`section-content-${section.id}`}
        >
          <div className="flex items-center space-x-3">
            {/* Chevron Icon */}
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${
                section.isExpanded ? 'transform rotate-90' : ''
              }`}
              style={{ color: brandColors.gold }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>

            {/* Section Title */}
            <h3
              className="text-lg font-semibold text-left"
              style={{ color: brandColors.darkBlue }}
            >
              {section.title}
            </h3>
          </div>

          {/* Section Status Badge */}
          {!section.isExpanded && !section.isSpecial && (
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
              Collapsed
            </span>
          )}
        </button>

        {/* Section Content */}
        <div
          id={`section-content-${section.id}`}
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isAnimating ? 'transitioning' : ''
          }`}
          style={{
            maxHeight: section.isExpanded ? '2000px' : '0px',
            opacity: section.isExpanded ? 1 : 0
          }}
        >
          <div className="px-4 py-3 border-t border-gray-100">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
              {section.content}
            </div>
          </div>
        </div>

        {/* Preview when collapsed (non-special sections only) */}
        {!section.isExpanded && !section.isSpecial && section.content.trim() && (
          <div className="px-4 py-2 text-xs text-gray-500 italic border-t border-gray-100">
            {getPreview()}
          </div>
        )}
      </div>
    );
  };

  // Browser Compatibility Alert (only shows when voice is completely unavailable)
  const BrowserAlert = () => {
    if (voiceAvailable) return null;

    return (
      <div className="max-w-2xl mx-auto mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Voice Input Unavailable
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Voice recording is not supported on this device/browser. You can still have a full conversation using text input below.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (showReport) {
    return (
      <div className="min-h-screen" style={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e8f0f5 50%, #dbeafe 100%)'
      }}>
        <div className="container mx-auto px-4 py-8">
          <TailoredCareLogo />
          
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: brandColors.darkBlue }}>
                Shift Documentation Report
              </h2>
              <div className="flex items-center space-x-3">
                {/* Phase 2 Q1: Expand/Collapse All button */}
                <button
                  onClick={toggleAllSections}
                  className="px-4 py-2 rounded-lg font-medium transition-all hover:shadow-md text-sm"
                  style={{
                    backgroundColor: brandColors.lightBlue,
                    color: brandColors.darkBlue
                  }}
                  aria-label={allSectionsExpanded ? 'Collapse all sections' : 'Expand all sections'}
                >
                  {allSectionsExpanded ? '▼ Collapse All' : '▶ Expand All'}
                </button>

                {/* DAR JSON Integration: View/Export DAR JSON */}
                {darJson && (
                  <>
                    <button
                      onClick={() => setShowDarJson(!showDarJson)}
                      className="px-4 py-2 rounded-lg font-medium transition-all hover:shadow-md text-sm"
                      style={{
                        backgroundColor: brandColors.lightGold,
                        color: brandColors.darkBlue
                      }}
                      aria-label="Toggle DAR JSON view"
                    >
                      {showDarJson ? '📄 Hide JSON' : '🔍 View DAR JSON'}
                    </button>
                    <button
                      onClick={() => {
                        const dataStr = JSON.stringify(darJson, null, 2);
                        const dataBlob = new Blob([dataStr], { type: 'application/json' });
                        const url = URL.createObjectURL(dataBlob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `dar-report-${darJson.client_name || 'unknown'}-${new Date().toISOString().split('T')[0]}.json`;
                        link.click();
                        URL.revokeObjectURL(url);

                        setSuccessMessage('📥 DAR JSON exported!');
                        setShowSuccessToast(true);
                        setTimeout(() => setShowSuccessToast(false), 3000);
                      }}
                      className="px-4 py-2 rounded-lg font-medium transition-all hover:shadow-md text-sm"
                      style={{
                        backgroundColor: '#E8F5E9',
                        color: '#2E7D32'
                      }}
                      aria-label="Export DAR JSON"
                    >
                      📥 Export JSON
                    </button>
                  </>
                )}

                <button
                  onClick={startNewSession}
                  className="px-6 py-2 rounded-lg text-white font-medium transition-colors"
                  style={{ backgroundColor: brandColors.gold }}
                  onMouseOver={(e) => e.target.style.backgroundColor = brandColors.darkGreen}
                  onMouseOut={(e) => e.target.style.backgroundColor = brandColors.gold}
                >
                  New Session
                </button>
              </div>
            </div>

            {/* DAR JSON Integration: Show DAR JSON when toggled */}
            {showDarJson && darJson && (
              <div className="mt-6 bg-gray-50 rounded-lg p-6 border-2 border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: brandColors.darkBlue }}>
                    DAR JSON (Ontario PSW Standard)
                  </h3>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(darJson, null, 2));
                      setSuccessMessage('📋 JSON copied to clipboard!');
                      setShowSuccessToast(true);
                      setTimeout(() => setShowSuccessToast(false), 3000);
                    }}
                    className="px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors"
                  >
                    📋 Copy JSON
                  </button>
                </div>
                <pre className="bg-white p-4 rounded border border-gray-300 overflow-x-auto text-sm">
                  {JSON.stringify(darJson, null, 2)}
                </pre>
                {darJson.errors_or_gaps && darJson.errors_or_gaps.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm font-semibold text-yellow-800">⚠️ Errors or Gaps:</p>
                    <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                      {darJson.errors_or_gaps.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Phase 2 Q1: Collapsible Report Sections */}
            <div className="space-y-2 mt-6">
              {reportSections.map(section => (
                <CollapsibleSection
                  key={section.id}
                  section={section}
                  onToggle={toggleSection}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f1419 100%)'
    }}>
      {/* Phase 1 Q4: Keyboard Shortcuts Overlay */}
      <KeyboardShortcutsOverlay />

      {/* Phase 1 Q4: Success Toast Notification */}
      <SuccessToast />

      {/* Phase 2 Q2: Resume Session Prompt */}
      <ResumeSessionPrompt />

      {/* Phase 2 Q2: Saved Sessions List Modal */}
      <SavedSessionsList />

      {/* Phase 1 Q4: Floating shortcuts hint button */}
      <button
        onClick={() => setShowKeyboardShortcuts(true)}
        className="fixed top-4 right-4 z-40 w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-white font-bold text-lg transition-all hover:scale-110 active:scale-95"
        style={{ backgroundColor: brandColors.blue }}
        aria-label="Show keyboard shortcuts"
        title="Keyboard shortcuts (Press ?)"
      >
        <span className="animate-pulse">?</span>
      </button>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center text-center gap-4 mb-10">
          <TailoredCareLogo orientation="stacked" />
          <p className="text-sm text-white/70 max-w-2xl">
            Start a fresh documentation session or resume where you left off. Voice controls enable automatically when your browser supports them.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={startNewSession}
              className="px-6 py-2 rounded-full text-sm font-semibold transition-all"
              style={{
                background: 'linear-gradient(135deg, #FFE2B3, #F2A24F)',
                color: '#2C1301',
                boxShadow: '0 12px 24px rgba(227,162,72,0.35)'
              }}
            >
              Start New Session
            </button>
            <button
              onClick={handleOpenSessions}
              className="px-6 py-2 rounded-full border text-sm font-semibold transition-all"
              style={{
                borderColor: 'rgba(227,162,72,0.35)',
                color: brandColors.lightGold
              }}
            >
              Load Saved Session
            </button>
          </div>
        </div>

        <BrowserAlert />

        {/* Language Selector */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-base"
              >
                {Object.entries(languages).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Conversation Progress Indicator */}
        <ConversationProgress />

        {/* Main Conversation Interface */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white border-opacity-20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                Conversational Documentation
              </h3>
              
              {/* Voice/Text Controls */}
              <div className="flex items-center space-x-3">
                {voiceAvailable && !showTextInput && (
                  <button
                    onClick={toggleListening}
                    disabled={isProcessing || isTranscribing}
                    aria-label={isListening ? "Stop recording" : "Start voice recording"}
                    className={`flex items-center justify-center w-16 h-16 rounded-full text-white font-bold text-lg transition-all transform ${
                      isListening
                        ? 'scale-110 shadow-lg animate-pulse'
                        : 'hover:scale-105'
                    } ${
                      isProcessing || isTranscribing
                        ? 'bg-gray-400 cursor-not-allowed'
                        : isListening
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'hover:shadow-lg'
                    }`}
                    style={{
                      background: !(isProcessing || isTranscribing)
                        ? (isListening
                            ? 'linear-gradient(135deg, #EF4444, #DC2626)'
                            : 'linear-gradient(135deg, #1B365D, #2D4A7C)')
                        : undefined
                    }}
                  >
                    {isTranscribing ? '⌛' : isListening ? '⏹️' : '🎤'}
                  </button>
                )}
                
                {voiceAvailable && (
                  <button
                    onClick={() => setShowTextInput(!showTextInput)}
                    disabled={isListening || isTranscribing}
                    aria-label={showTextInput ? "Switch to voice input" : "Switch to text input"}
                    className="px-3 py-1 text-sm rounded-lg border-2 transition-colors"
                    style={{
                      borderColor: brandColors.blue,
                      color: showTextInput ? 'white' : brandColors.blue,
                      backgroundColor: showTextInput ? brandColors.blue : 'transparent',
                      opacity: isListening || isTranscribing ? 0.6 : 1
                    }}
                  >
                    {showTextInput ? 'Voice' : 'Text'}
                  </button>
                )}
              </div>
            </div>

            {/* Text Input Interface (fallback or optional) */}
            {showTextInput && (
              <div className="mb-4">
                <div className="flex space-x-2">
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your response here... (Press Enter to send, Shift+Enter for new line)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-base"
                    rows="3"
                    disabled={isProcessing || isTranscribing}
                  />
                  <button
                    onClick={handleTextSubmit}
                    disabled={isSendDisabled}
                    aria-label="Send message"
                    className="px-4 py-2 rounded-lg text-white font-medium transition-colors disabled:bg-gray-400"
                    style={{ backgroundColor: brandColors.blue }}
                  >
                    Send
                  </button>
                </div>
              </div>
            )}

            {transcript && !showTextInput && voiceAvailable && (
              <div className="mb-4 p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg border border-white border-opacity-30">
                <p className="text-sm text-white">{transcript}</p>
              </div>
            )}

            {recordingError && (
              <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm font-medium text-red-700">{recordingError}</p>
              </div>
            )}

            {/* Conversation Display */}
            <div
              className="space-y-4 max-h-96 overflow-y-auto"
              role="log"
              aria-live="polite"
              aria-atomic="false"
              aria-relevant="additions"
            >
              {conversation.map((message, index) => {
                const isTooLong = isMessageTooLong(message.content);
                const isExpanded = expandedMessages.has(index);
                const displayContent = (isTooLong && !isExpanded)
                  ? getTruncatedContent(message.content)
                  : message.content;

                return (
                  <div
                    key={index}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                  <div
                    className={`max-w-xs lg:max-w-md px-3 pt-5 pb-4 rounded-lg ${
                      message.type === 'user'
                        ? 'text-white'
                        : 'text-white'
                    }`}
                    style={{
                      backgroundColor: message.type === 'user' ? brandColors.gold : 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: message.type === 'user' ? 'none' : 'blur(10px)',
                      border: message.type === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                      <p className="text-sm whitespace-pre-wrap">{displayContent}</p>

                      {/* Phase 1 Q2: Read more/less button for long messages */}
                      {isTooLong && (
                        <button
                          onClick={() => toggleMessageExpansion(index)}
                          className="text-xs mt-2 font-medium underline hover:no-underline transition-all"
                          style={{
                            color: message.type === 'user' ? 'white' : brandColors.blue
                          }}
                        >
                          {isExpanded ? 'Show less' : 'Read more'}
                        </button>
                      )}

                      <p className="text-xs mt-1 opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Phase 1 Q1: Typing indicator for AI processing */}
              {isProcessing && <TypingIndicator />}

              {/* Phase 1 Q1: Typing indicator for report generation */}
              {isReportGenerating && (
                <div className="flex justify-start">
                  <div className="bg-blue-50 px-4 py-3 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div
                          className="w-2 h-2 rounded-full animate-typing-bounce"
                          style={{
                            backgroundColor: brandColors.gold,
                            animationDelay: '0ms'
                          }}
                        />
                        <div
                          className="w-2 h-2 rounded-full animate-typing-bounce"
                          style={{
                            backgroundColor: brandColors.gold,
                            animationDelay: '150ms'
                          }}
                        />
                        <div
                          className="w-2 h-2 rounded-full animate-typing-bounce"
                          style={{
                            backgroundColor: brandColors.gold,
                            animationDelay: '300ms'
                          }}
                        />
                      </div>
                      <p className="text-sm font-medium" style={{ color: brandColors.darkBlue }}>
                        Generating your report...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Phase 1 Q2: Turn-taking indicator */}
              {consecutiveAIMessages >= 2 && !isProcessing && !isReportGenerating && (
                <div className="flex justify-center mt-4">
                  <div
                    className="px-6 py-3 rounded-full shadow-lg animate-pulse"
                    style={{
                      backgroundColor: brandColors.gold,
                      border: `2px solid ${brandColors.darkBlue}`
                    }}
                  >
                    <p className="text-sm font-bold text-white flex items-center space-x-2">
                      <span>👉</span>
                      <span>
                        {consecutiveAIMessages >= 3
                          ? 'Your turn - Please respond to continue'
                          : 'Please respond when ready'}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              <div ref={conversationEndRef} />
            </div>

            {/* Phase 2 Q2: Session Management Buttons */}
            {conversation.length > 0 && (
              <div className="mt-4 flex gap-2 justify-center">
                <button
                  onClick={handleSaveSession}
                  aria-label="Save current session"
                  className="px-4 py-2 rounded-lg font-medium transition-all hover:shadow-md text-sm flex items-center gap-2"
                  style={{
                    backgroundColor: brandColors.lightBlue,
                    color: brandColors.darkBlue
                  }}
                >
                  <span>💾</span> Save Session
                </button>
                <button
                  onClick={handleOpenSessions}
                  aria-label="Load saved session"
                  className="px-4 py-2 rounded-lg font-medium transition-all hover:shadow-md text-sm flex items-center gap-2"
                  style={{
                    backgroundColor: brandColors.lightGold,
                    color: brandColors.darkBlue
                  }}
                >
                  <span>📂</span> Load Session
                </button>
              </div>
            )}

            {conversation.length > 1 && !isReportGenerating && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={generateReport}
                  aria-label="Generate documentation report"
                  className="flex-1 py-2 px-4 rounded-lg text-white font-medium transition-colors"
                  style={{ backgroundColor: brandColors.gold }}
                  onMouseOver={(e) => e.target.style.backgroundColor = brandColors.darkGreen}
                  onMouseOut={(e) => e.target.style.backgroundColor = brandColors.gold}
                >
                  Generate Report
                </button>
                <button
                  onClick={startNewSession}
                  aria-label="Start new documentation session"
                  className="px-4 py-2 border-2 rounded-lg font-medium transition-colors"
                  style={{
                    borderColor: brandColors.blue,
                    color: brandColors.blue
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = brandColors.blue;
                    e.target.style.color = 'white';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = brandColors.blue;
                  }}
                >
                  New Session
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PSWVoiceReporter;
