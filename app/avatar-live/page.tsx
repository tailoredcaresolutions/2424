'use client';

import React, { useRef, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AudioPlayer } from '@/lib/audio/AudioPlayer';
import { createVisemeDriver, type VisemeDriver } from '@/lib/avatar/VisemeDriver';
import { useAvatarSpeech } from '@/lib/avatar/useAvatarSpeech';

export default function AvatarLivePage() {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const svgHostRef = useRef<HTMLDivElement>(null);
  const audioPlayerRef = useRef<AudioPlayer | null>(null);
  const visemeDriverRef = useRef<VisemeDriver | null>(null);
  
  // Initialize audio player
  useEffect(() => {
    audioPlayerRef.current = new AudioPlayer();
    
    return () => {
      audioPlayerRef.current?.dispose();
    };
  }, []);
  
  // Initialize viseme driver when SVG is loaded
  useEffect(() => {
    if (svgHostRef.current && !visemeDriverRef.current) {
      visemeDriverRef.current = createVisemeDriver(svgHostRef.current);
      visemeDriverRef.current.idleStart();
    }
    
    return () => {
      visemeDriverRef.current?.dispose();
    };
  }, []);
  
  // WebSocket connection
  const { connected, error, speak, onViseme, onAudio, onEmotion } = useAvatarSpeech();
  
  // Register callbacks
  useEffect(() => {
    // Viseme callback
    const unsubViseme = onViseme((time, viseme) => {
      console.log(`Viseme at ${time}: ${viseme}`);
      visemeDriverRef.current?.show(viseme);
    });
    
    // Audio callback
    const unsubAudio = onAudio((codec, chunk) => {
      console.log(`Audio chunk received (${codec})`);
      audioPlayerRef.current?.enqueueBase64Opus(chunk);
    });
    
    // Emotion callback
    const unsubEmotion = onEmotion((start, end, value) => {
      console.log(`Emotion from ${start} to ${end}: ${value}`);
      // You can add emotion handling here if needed
    });
    
    return () => {
      unsubViseme();
      unsubAudio();
      unsubEmotion();
    };
  }, [onViseme, onAudio, onEmotion]);
  
  // Handle enable sound button
  const handleEnableSound = async () => {
    if (audioPlayerRef.current) {
      await audioPlayerRef.current.resumeOnUserGesture();
      setAudioEnabled(true);
    }
  };
  
  // Handle speak test
  const handleSpeakTest = () => {
    if (!connected) {
      console.warn('WebSocket not connected');
      return;
    }
    
    setIsSpeaking(true);
    speak("Hello from Tailored Care Solutions. I'm your AI companion, here to help document your PSW shift notes efficiently and accurately.");
    
    // Reset speaking state after a delay
    setTimeout(() => {
      setIsSpeaking(false);
    }, 5000);
  };
  
  return (
    <div className="min-h-screen bg-[#172D53] flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8">
        {/* Title */}
        <motion.h1 
          className="text-4xl font-bold text-[var(--tcs-gold)] text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Avatar Live Test
        </motion.h1>
        
        {/* Connection Status */}
        <div className="text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
            connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              connected ? 'bg-green-400' : 'bg-red-400'
            } ${connected ? 'animate-pulse' : ''}`} />
            {connected ? 'Connected' : 'Disconnected'}
          </div>
          {error && (
            <p className="text-red-400 mt-2 text-sm">{error}</p>
          )}
        </div>
        
        {/* Avatar Container */}
        <motion.div 
          className="liquid-glass-card rounded-glass-lg p-8 flex justify-center items-center min-h-[400px]"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div ref={svgHostRef} className="w-full max-w-md">
            {/* Inline SVG Avatar - Simplified placeholder */}
            <svg 
              viewBox="0 0 200 200" 
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Head/Main group */}
              <g id="avatar-main">
                {/* Face */}
                <circle cx="100" cy="100" r="80" fill="#F4D1AE" stroke="#E5B78B" strokeWidth="2"/>
                
                {/* Eyes */}
                <g id="eyes">
                  <ellipse id="eye-left" cx="75" cy="85" rx="8" ry="12" fill="#333"/>
                  <ellipse id="eye-right" cx="125" cy="85" rx="8" ry="12" fill="#333"/>
                </g>
                
                {/* Mouth container */}
                <g id="mouth">
                  {/* Rest position (default) */}
                  <g id="viseme-rest" style={{ display: 'inline' }}>
                    <path d="M 70 120 Q 100 130 130 120" stroke="#D4A373" strokeWidth="2" fill="none"/>
                  </g>
                  
                  {/* MBP viseme (lips together) */}
                  <g id="viseme-MBP" style={{ display: 'none' }}>
                    <line x1="70" y1="120" x2="130" y2="120" stroke="#D4A373" strokeWidth="3"/>
                  </g>
                  
                  {/* AI viseme (wide) */}
                  <g id="viseme-AI" style={{ display: 'none' }}>
                    <ellipse cx="100" cy="120" rx="35" ry="8" fill="#333" opacity="0.3"/>
                  </g>
                  
                  {/* E viseme (wide smile) */}
                  <g id="viseme-E" style={{ display: 'none' }}>
                    <path d="M 65 120 Q 100 135 135 120" stroke="#D4A373" strokeWidth="2" fill="none"/>
                  </g>
                  
                  {/* O viseme (round) */}
                  <g id="viseme-O" style={{ display: 'none' }}>
                    <ellipse cx="100" cy="120" rx="20" ry="25" fill="#333" opacity="0.3"/>
                  </g>
                  
                  {/* U viseme (small round) */}
                  <g id="viseme-U" style={{ display: 'none' }}>
                    <ellipse cx="100" cy="120" rx="15" ry="20" fill="#333" opacity="0.3"/>
                  </g>
                  
                  {/* FV viseme (teeth on lip) */}
                  <g id="viseme-FV" style={{ display: 'none' }}>
                    <rect x="85" y="115" width="30" height="5" fill="#FFF"/>
                    <line x1="70" y1="125" x2="130" y2="125" stroke="#D4A373" strokeWidth="2"/>
                  </g>
                  
                  {/* L viseme (tongue) */}
                  <g id="viseme-L" style={{ display: 'none' }}>
                    <ellipse cx="100" cy="120" rx="25" ry="10" fill="#333" opacity="0.3"/>
                    <ellipse cx="100" cy="118" rx="10" ry="5" fill="#E8A5A5"/>
                  </g>
                </g>
              </g>
            </svg>
          </div>
        </motion.div>
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* Enable Sound Button */}
          <motion.button
            onClick={handleEnableSound}
            disabled={audioEnabled}
            className={`liquid-glass-gold px-8 py-4 rounded-glass-lg font-semibold transition-all ${
              audioEnabled 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:scale-105 active:scale-95'
            }`}
            whileHover={!audioEnabled ? { scale: 1.05 } : {}}
            whileTap={!audioEnabled ? { scale: 0.95 } : {}}
          >
            <span className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              {audioEnabled ? '✓ Sound Enabled' : 'Enable Sound'}
            </span>
          </motion.button>
          
          {/* Speak Test Button */}
          <motion.button
            onClick={handleSpeakTest}
            disabled={!connected || isSpeaking}
            className={`liquid-glass-card px-8 py-4 rounded-glass-lg font-semibold transition-all ${
              (!connected || isSpeaking)
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:scale-105 active:scale-95'
            }`}
            whileHover={(connected && !isSpeaking) ? { scale: 1.05 } : {}}
            whileTap={(connected && !isSpeaking) ? { scale: 0.95 } : {}}
          >
            <span className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              {isSpeaking ? 'Speaking...' : 'Speak Test'}
            </span>
          </motion.button>
        </div>
        
        {/* Instructions */}
        <motion.div 
          className="liquid-glass-card rounded-glass-lg p-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-[var(--tcs-gold)]/90 text-sm">
            1. Click "Enable Sound" to activate audio (required on iOS/Safari)<br/>
            2. Click "Speak Test" to hear the avatar speak with lip-sync<br/>
            3. Watch the viseme changes and listen to the audio output
          </p>
        </motion.div>
      </div>
    </div>
  );
}
