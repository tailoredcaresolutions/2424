'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';
import AICompanionAvatar from './AICompanionAvatar';

export default function SimpleChatWrapper() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceLevel, setVoiceLevel] = useState(0);

  const handleMicClick = () => {
    setIsListening(true);
    
    // Simulate voice level animation
    const voiceInterval = setInterval(() => {
      setVoiceLevel(Math.random());
    }, 100);
    
    setTimeout(() => {
      clearInterval(voiceInterval);
      setIsListening(false);
      setVoiceLevel(0);
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 3000);
    }, 2000);
  };

  // Determine AI state for avatar
  const getAvatarState = () => {
    if (isSpeaking) return "speaking";
    if (isListening) return "listening";
    return "idle";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2332] via-[#1e2838] to-[#1a2332]">
      {/* Header with premium glass effect */}
      <motion.div 
        className="glass-light border-b border-[#c9a063]/20 px-6 py-5 sticky top-0 z-10 backdrop-blur-2xl"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#c9a063]">PSW Voice Documentation</h1>
            <p className="text-sm text-gray-300">Tailored Care Solutions</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50" />
              <span className="text-sm font-medium text-gray-200">Connected</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container max-w-2xl mx-auto px-6 py-6 space-y-6">
        {/* Main Companion Card with enhanced liquid glass */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div className="p-12 glass-gold border-2 border-[#c9a063]/30 shadow-[0_20px_60px_rgba(0,0,0,0.5),0_8px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] rounded-3xl">
            <div className="space-y-8">
              {/* Avatar - larger and cleaner */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8, ease: [0.34, 1.2, 0.64, 1] }}
                >
                  <AICompanionAvatar
                    state={getAvatarState()}
                    size="xl"
                    primaryColor="#c9a063"
                    secondaryColor="#d4b078"
                    glowIntensity={0.22}
                    enableHover={true}
                    avatarUrl="/companion-avatar-hd.png"
                  />
                </motion.div>
              </div>

              {/* Message Display with premium glass effect */}
              <motion.div 
                className="glass-light rounded-[28px] p-8 min-h-[120px] flex items-center justify-center border border-[#c9a063]/25 relative overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.12)]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                {/* Subtle animated gradient */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#c9a063] via-transparent to-[#d4b078] animate-pulse" />
                </div>
                <p className="text-2xl text-center text-gray-100 leading-relaxed font-medium relative z-10">
                  Hello! I'm here to help you document your PSW activities. Click the microphone to start recording your observations.
                </p>
              </motion.div>

              {/* Large Microphone Button with iOS 26 liquid glass */}
              <motion.div 
                className="relative"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                {/* Voice level indicator bars */}
                {isListening && (
                  <div className="absolute -top-16 left-0 right-0 flex items-end justify-center gap-2 h-12">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-3 rounded-full bg-[#c9a063]"
                        style={{
                          height: `${20 + (voiceLevel + Math.random() * 0.3) * 30}%`,
                          opacity: 0.6 + voiceLevel * 0.4,
                          boxShadow: `0 0 10px rgba(201, 160, 99, ${voiceLevel * 0.6})`,
                        }}
                        animate={{
                          height: [`${20 + Math.random() * 50}%`, `${20 + Math.random() * 50}%`],
                        }}
                        transition={{
                          duration: 0.15,
                          repeat: Infinity,
                        }}
                      />
                    ))}
                  </div>
                )}
                
                <motion.button
                  onClick={handleMicClick}
                  disabled={isListening}
                  className="w-full bg-gradient-to-br from-[#c9a063] via-[#d4b078] to-[#c9a063] hover:from-[#d4b078] hover:via-[#e0c088] hover:to-[#d4b078] disabled:from-[#8a6f44] disabled:to-[#7a5f34] text-[#1a2332] font-bold py-7 px-10 rounded-[26px] shadow-[0_12px_32px_rgba(201,160,99,0.45),0_4px_12px_rgba(0,0,0,0.35),inset_0_2px_0_rgba(255,255,255,0.35),inset_0_-3px_0_rgba(0,0,0,0.25)] hover:shadow-[0_16px_40px_rgba(201,160,99,0.55),0_6px_16px_rgba(0,0,0,0.4),inset_0_2px_0_rgba(255,255,255,0.45)] transition-all duration-300 flex items-center justify-center gap-4 border border-[#e0c088]/50 backdrop-blur-sm text-2xl touch-feedback"
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                >
                  <Mic className={`w-8 h-8 ${isListening ? 'animate-pulse' : ''}`} />
                  <span>{isListening ? 'Listening...' : 'Start Documentation'}</span>
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* PSW Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="p-6 glass-light border border-[#c9a063]/20 shadow-[0_8px_24px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.1)] rounded-3xl">
            <h3 className="text-xl font-bold text-[#c9a063] mb-4">Today's Documentation</h3>
            <div className="space-y-3">
              <div className="glass-light rounded-2xl p-4 flex items-center justify-between border border-[#c9a063]/15">
                <span className="text-gray-300 font-medium">Reports Filed</span>
                <span className="text-[#c9a063] font-bold text-xl">3</span>
              </div>
              <div className="glass-light rounded-2xl p-4 flex items-center justify-between border border-[#c9a063]/15">
                <span className="text-gray-300 font-medium">Client Interactions</span>
                <span className="text-[#c9a063] font-bold text-xl">8</span>
              </div>
              <div className="glass-light rounded-2xl p-4 flex items-center justify-between border border-[#c9a063]/15">
                <span className="text-gray-300 font-medium">Status</span>
                <span className="text-green-400 font-bold text-xl">✓ Compliant</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
