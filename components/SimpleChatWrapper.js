'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mic, MessageCircle, Camera } from 'lucide-react';
import AICompanionAvatar from './AICompanionAvatar';
import { useAvatarSpeech } from '../lib/avatar/useAvatarSpeech';
import { AudioPlayer } from '../lib/audio/AudioPlayer';

export default function SimpleChatWrapper() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const audioPlayerRef = useRef(null);
  const {connected,error,speak,onViseme,onAudio} = useAvatarSpeech();

  // Initialize audio player
  if (!audioPlayerRef.current && typeof window !== 'undefined') {
    audioPlayerRef.current = new AudioPlayer((n) => console.warn(`Audio buffer full — dropped ${n} frames`));
  }

  // Wire up audio playback from WebSocket
  useEffect(() => {
    if (audioPlayerRef.current) {
      onAudio((_mime, b64) => {
        console.log('[DEBUG] Received audio chunk, length:', b64?.length || 0);
        audioPlayerRef.current.enqueueBase64(b64);
      });
    }
  }, [onAudio]);

  // Handle speaking state based on WebSocket events
  useEffect(() => {
    onViseme((t, v) => {
      if (v !== 'rest') {
        setIsSpeaking(true);
      } else {
        setTimeout(() => setIsSpeaking(false), 500);
      }
    });
  }, [onViseme]);

  // Real voice recording handler with auto-stop on silence
  const handleMicClick = async () => {
    if (isListening) {
      // Stop listening and process
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
      setIsListening(false);
      setVoiceLevel(0);
    } else {
      // Start listening - real audio capture with voice activity detection
      try {
        // Enable audio on user gesture
        if (audioPlayerRef.current) {
          await audioPlayerRef.current.resumeOnUserGesture();
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Set up audio context for voice activity detection
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let silenceStart = null;
        const SILENCE_THRESHOLD = 30; // Adjust sensitivity
        const SILENCE_DURATION = 1500; // 1.5 seconds of silence triggers auto-stop

        const recorder = new MediaRecorder(stream);
        const chunks = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        // Voice activity detection loop
        const checkAudio = () => {
          if (recorder.state !== 'recording') return;

          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

          // Update visual feedback
          setVoiceLevel(Math.min(average / 50, 1));

          // Detect silence
          if (average < SILENCE_THRESHOLD) {
            if (!silenceStart) {
              silenceStart = Date.now();
            } else if (Date.now() - silenceStart > SILENCE_DURATION) {
              // Auto-stop after silence
              console.log('[DEBUG] Auto-stopping due to silence');
              recorder.stop();
              return;
            }
          } else {
            silenceStart = null;
          }

          requestAnimationFrame(checkAudio);
        };

        recorder.onstop = async () => {
          // Clean up
          audioContext.close();

          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          console.log('[DEBUG] Audio recorded, size:', audioBlob.size, 'bytes');

          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());

          // Convert to base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result.split(',')[1];
            console.log('[DEBUG] Audio converted to base64, length:', base64Audio.length);

            // Send to orchestrator for ASR
            try {
              console.log('[DEBUG] Sending audio to /api/transcribe...');
              const response = await fetch('/api/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audioData: base64Audio })
              });

              const data = await response.json();
              console.log('[DEBUG] Transcription response:', data);

              if (data.success && data.text) {
                console.log('[DEBUG] Transcribed text:', data.text);
                console.log('[DEBUG] Sending to WebSocket via speak()...');
                console.log('[DEBUG] WebSocket connected:', connected);
                // Send transcribed text to orchestrator via WebSocket
                // AI will start streaming response immediately, sentence by sentence
                const result = speak(data.text);
                console.log('[DEBUG] speak() returned:', result);
              } else {
                console.error('[ERROR] Transcription failed:', data.error);
              }
            } catch (err) {
              console.error('[ERROR] Error sending audio:', err);
            }
          };
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsListening(true);
        setIsSpeaking(false);

        // Start voice activity detection
        checkAudio();

      } catch (err) {
        console.error('Microphone access denied:', err);
        alert('Microphone access is required for voice input.');
      }
    }
  };

  const handleChatsClick = () => {
    router.push('/session');
  };

  const handleMemoriesClick = () => {
    router.push('/review');
  };

  const getAvatarState = () => {
    if (isSpeaking) return "speaking";
    if (isListening) return "listening";
    return "idle";
  };

  return (
    <div className="min-h-screen bg-[#172D53] flex items-center justify-center p-4 md:p-6 lg:p-8 relative overflow-hidden">

      <div className="max-w-4xl w-full mx-4 relative z-10">
        
        {/* Hero Section with Welcome Message */}
        <motion.div
          className="text-center space-y-4 mb-16 md:mb-20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--tcs-gold)] drop-shadow-[0_4px_12px_rgba(0,0,0,0.6),0_0_20px_rgba(201,160,99,0.4)]">
            Welcome to Tailored Care Solutions
          </h1>
          <p className="text-xl md:text-2xl text-[var(--tcs-gold)]/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5),0_0_15px_rgba(201,160,99,0.3)]">
            PSW Voice Documentation Platform
          </p>
        </motion.div>

        {/* Avatar with Enhanced Styling - Fixed Spacing */}
        <motion.div 
          className="flex justify-center relative z-20 mb-20 md:mb-24"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        >
          <div className="relative isolate" style={{ padding: '60px', margin: '0' }}>
            <AICompanionAvatar 
              state={getAvatarState()}
              expression={isListening ? "curiosity" : isSpeaking ? "excitement" : "joy"}
              avatarUrl="/companion-avatar-realistic.png"
              size="lg"
              primaryColor="#c9a063"
              showParticles={false}
              showRings={false}
              showSparkles={false}
              showAmbientEffects={false}
            />
          </div>
        </motion.div>

        {/* Enhanced Speech Bubble with WebSocket Status */}
        <motion.div
          className="liquid-glass-card rounded-glass-lg p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-white/20 relative z-10 mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {/* Connection Status Indicator */}
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400 animate-pulse' : error ? 'bg-red-400' : 'bg-yellow-400 animate-pulse'}`} />
            <span className="text-sm text-white/80">
              {connected ? 'Voice AI Connected' : error ? `Connection Error: ${error}` : 'Connecting to Voice AI...'}
            </span>
          </div>
          <p className="text-[var(--tcs-gold)] text-xl md:text-2xl font-semibold leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.5),0_0_15px_rgba(201,160,99,0.3)]">
            {connected
              ? "Hello! I'm here to help you document your PSW shift notes. Tap to speak - I'll respond as you talk, like a natural conversation!"
              : "Connecting to voice assistant... Please wait."}
          </p>
        </motion.div>

        {/* Enhanced Microphone Button with Status Indicator */}
        <motion.div
          className="space-y-4 mb-12 md:mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex flex-col items-center gap-4">
            <motion.button
              onClick={handleMicClick}
              disabled={!connected}
              className={`touch-target rounded-full h-32 w-32 md:h-40 md:w-40 liquid-glass-gold flex items-center justify-center transition-all focus:outline-none focus:ring-4 focus:ring-[var(--tcs-gold)]/50 ${
                isListening
                  ? 'shadow-[0_20px_50px_rgba(201,160,99,0.5)]'
                  : ''
              } ${!connected ? 'opacity-50 cursor-not-allowed' : ''}`}
              whileHover={{ scale: isListening || !connected ? 1 : 1.05 }}
              whileTap={{ scale: connected ? 0.95 : 1 }}
              aria-label={isListening ? 'Stop listening' : 'Start listening'}
            >
              <div className="relative flex items-center justify-center">
                <Mic 
                  className={`w-16 h-16 md:w-20 md:h-20 text-white ${isListening ? 'animate-pulse' : ''}`} 
                  strokeWidth={2.5} 
                  fill={isListening ? 'rgba(255,255,255,0.25)' : 'none'}
                />
                {isListening && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-white/50"
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.7, 0, 0.7]
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
              </div>
            </motion.button>
            <p className="text-white text-lg md:text-xl font-semibold text-center">
              {!connected
                ? 'Waiting for connection...'
                : isListening
                  ? 'Speak now... (auto-stops after 1.5s silence)'
                  : isSpeaking
                    ? 'AI responding - streaming live!'
                    : 'Ready for streaming conversation'}
            </p>
          </div>
        </motion.div>

        {/* Enhanced Quick Actions with Three Primary CTAs */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="text-[var(--tcs-gold)] text-2xl font-bold text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.5),0_0_15px_rgba(201,160,99,0.3)]">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Start Voice Session - Primary */}
            <motion.button
              onClick={handleMicClick}
              className="liquid-glass-card rounded-glass-lg p-6 md:p-8 min-h-[200px] flex flex-col items-center justify-center gap-4 border border-white/20 hover:border-white/30 transition-all touch-target"
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-[var(--tcs-light-gold)] to-[var(--tcs-gold)] rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(201,160,99,0.5)]">
                <Mic className="w-12 h-12 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-[var(--tcs-gold)] text-xl md:text-2xl font-bold text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.5),0_0_15px_rgba(201,160,99,0.3)]">Start Voice Session</span>
              <p className="text-sm text-[var(--tcs-gold)]/80 text-center drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">Begin documenting your shift</p>
            </motion.button>

            {/* Review Reports - Secondary */}
            <motion.button
              onClick={handleMemoriesClick}
              className="liquid-glass-card rounded-glass-lg p-6 md:p-8 min-h-[200px] flex flex-col items-center justify-center gap-4 border border-white/20 hover:border-white/30 transition-all shadow-[0_15px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] touch-target"
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-[var(--tcs-blue-light)] to-[var(--tcs-blue-primary)] rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(75,111,165,0.4)]">
                <MessageCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-[var(--tcs-gold)] text-xl md:text-2xl font-bold text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.5),0_0_15px_rgba(201,160,99,0.3)]">Review Reports</span>
              <p className="text-sm text-[var(--tcs-gold)]/80 text-center drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">View and approve documentation</p>
            </motion.button>

            {/* View Analytics - Tertiary */}
            <motion.button
              onClick={handleChatsClick}
              className="liquid-glass-card rounded-glass-lg p-6 md:p-8 min-h-[200px] flex flex-col items-center justify-center gap-4 border border-white/20 hover:border-white/30 transition-all touch-target"
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-white/30 to-white/10 rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(255,255,255,0.2)]">
                <Camera className="w-12 h-12 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-[var(--tcs-gold)] text-xl md:text-2xl font-bold text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.5),0_0_15px_rgba(201,160,99,0.3)]">View Analytics</span>
              <p className="text-sm text-[var(--tcs-gold)]/80 text-center drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">Insights and trends</p>
            </motion.button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
