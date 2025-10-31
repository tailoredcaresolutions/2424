'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mic, MessageCircle, Camera } from 'lucide-react';
import AICompanionAvatar from './AICompanionAvatar';

export default function SimpleChatWrapper() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceLevel, setVoiceLevel] = useState(0);

  const handleMicClick = () => {
    setIsListening(true);
    const voiceInterval = setInterval(() => setVoiceLevel(Math.random()), 100);
    setTimeout(() => {
      clearInterval(voiceInterval);
      setIsListening(false);
      setVoiceLevel(0);
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 3000);
    }, 2000);
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
    <div className="min-h-screen bg-gradient-to-b from-tcs-blue-primary via-tcs-blue-mid to-tcs-blue-light flex items-center justify-center p-4 md:p-6 lg:p-8 relative overflow-hidden">
      {/* Enhanced animated background gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          className="absolute top-20 left-10 w-96 h-96 bg-[var(--tcs-gold)]/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--tcs-blue-light)]/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--tcs-gold)]/5 rounded-full blur-3xl"
          animate={{ 
            scale: [0.8, 1, 0.8],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="max-w-4xl w-full mx-4 space-y-8 relative z-10">
        
        {/* Hero Section with Welcome Message */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
            Welcome to Tailored Care Solutions
          </h1>
          <p className="text-xl md:text-2xl text-white/80">
            PSW Voice Documentation Platform
          </p>
        </motion.div>

        {/* Avatar with Enhanced Styling */}
        <motion.div 
          className="flex justify-center"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        >
          <div className="relative">
            {/* Glow ring around avatar */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--tcs-gold)]/30 to-[var(--tcs-gold)]/10 blur-2xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <AICompanionAvatar 
              state={getAvatarState()}
              expression={isListening ? "curiosity" : isSpeaking ? "excitement" : "joy"}
              avatarUrl="/companion-avatar-realistic.png"
              size="lg"
              primaryColor="#c9a063"
            />
          </div>
        </motion.div>

        {/* Enhanced Speech Bubble */}
        <motion.div 
          className="liquid-glass-card rounded-glass-lg p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <p className="text-white text-xl md:text-2xl font-semibold leading-relaxed">
            Hello! I'm here to help you document your PSW shift notes today. How are you feeling?
          </p>
        </motion.div>

        {/* Enhanced Microphone Button with Status Indicator */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.button
            onClick={handleMicClick}
            className={`w-full text-white rounded-glass-lg p-8 md:p-10 min-h-[160px] flex flex-col items-center justify-center gap-4 transition-all touch-target ${
              isListening 
                ? 'liquid-glass-gold shadow-[0_20px_50px_rgba(212,165,116,0.6)]' 
                : 'liquid-glass-gold shadow-[0_20px_50px_rgba(212,165,116,0.4)] hover:shadow-[0_25px_60px_rgba(212,165,116,0.5)]'
            }`}
            whileHover={{ scale: isListening ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative">
              <Mic className={`w-16 h-16 md:w-20 md:h-20 ${isListening ? 'animate-pulse' : ''}`} strokeWidth={2.5} />
              {isListening && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-white/50"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.8, 0, 0.8]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity
                  }}
                />
              )}
            </div>
            <span className="text-2xl md:text-3xl font-black leading-tight">
              {isListening ? 'Listening...' : 'Tap the microphone to talk'}
            </span>
            {isListening && (
              <motion.div
                className="w-full max-w-xs h-2 bg-white/20 rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-[var(--tcs-light-gold)] to-[var(--tcs-gold)]"
                  animate={{
                    width: ['0%', '100%', '0%']
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            )}
          </motion.button>
        </motion.div>

        {/* Enhanced Quick Actions with Three Primary CTAs */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="text-white text-2xl font-bold text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Start Voice Session - Primary */}
            <motion.button
              onClick={handleMicClick}
              className="liquid-glass-gold rounded-glass-lg p-6 md:p-8 min-h-[200px] flex flex-col items-center justify-center gap-4 border border-[var(--tcs-gold)]/40 hover:border-[var(--tcs-gold)]/60 transition-all shadow-[0_15px_40px_rgba(212,165,116,0.4)] hover:shadow-[0_20px_50px_rgba(212,165,116,0.5)] touch-target"
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-[var(--tcs-light-gold)] to-[var(--tcs-gold)] rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(212,165,116,0.5)]">
                <Mic className="w-12 h-12 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-[var(--tcs-blue-deep)] text-xl md:text-2xl font-bold text-center">Start Voice Session</span>
              <p className="text-sm text-[var(--tcs-blue-deep)]/80 text-center">Begin documenting your shift</p>
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
              <span className="text-[var(--tcs-gold)] text-xl md:text-2xl font-bold text-center">Review Reports</span>
              <p className="text-sm text-white/70 text-center">View and approve documentation</p>
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
              <span className="text-white text-xl md:text-2xl font-bold text-center">View Analytics</span>
              <p className="text-sm text-white/70 text-center">Insights and trends</p>
            </motion.button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
