'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mic, MessageCircle, Camera } from 'lucide-react';
import AICompanionAvatar from './AICompanionAvatar';

export default function SimpleChatWrapper() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const voiceIntervalRef = useRef(null);

  // ChatGPT-style toggle: Press once to start, press again to stop
  const handleMicClick = () => {
    if (isListening) {
      // Stop listening
      setIsListening(false);
      setVoiceLevel(0);
      if (voiceIntervalRef.current) {
        clearInterval(voiceIntervalRef.current);
        voiceIntervalRef.current = null;
      }
      // Brief speaking state to show response
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 2000);
    } else {
      // Start listening (continuous until pressed again)
      setIsListening(true);
      setIsSpeaking(false);
      // Simulate voice level feedback while listening
      voiceIntervalRef.current = setInterval(() => {
        setVoiceLevel(Math.random());
      }, 100);
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

        {/* Enhanced Speech Bubble */}
        <motion.div 
          className="liquid-glass-card rounded-glass-lg p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-white/20 relative z-10 mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <p className="text-[var(--tcs-gold)] text-xl md:text-2xl font-semibold leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.5),0_0_15px_rgba(201,160,99,0.3)]">
            Hello! I'm here to help you document your PSW shift notes today. How are you feeling?
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
              className={`touch-target rounded-full h-32 w-32 md:h-40 md:w-40 liquid-glass-gold flex items-center justify-center transition-all focus:outline-none focus:ring-4 focus:ring-[var(--tcs-gold)]/50 ${
                isListening 
                  ? 'shadow-[0_20px_50px_rgba(201,160,99,0.5)]' 
                  : ''
              }`}
              whileHover={{ scale: isListening ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
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
              {isListening ? 'Listening... Tap to stop' : 'Tap to start conversation'}
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
              className="liquid-glass-gold rounded-glass-lg p-6 md:p-8 min-h-[200px] flex flex-col items-center justify-center gap-4 border border-white/20 hover:border-white/30 transition-all touch-target"
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
              className="liquid-glass-light rounded-glass-lg p-6 md:p-8 min-h-[200px] flex flex-col items-center justify-center gap-4 border border-white/15 hover:border-white/25 transition-all shadow-[0_15px_40px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] touch-target"
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
