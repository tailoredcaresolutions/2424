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
    <div className="min-h-screen bg-[#172D53] flex items-center justify-center p-4 md:p-6 lg:p-8 relative overflow-hidden">

      <div className="max-w-4xl w-full mx-4 space-y-8 relative z-10">
        
        {/* Hero Section with Welcome Message */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--tcs-gold)] drop-shadow-[0_4px_12px_rgba(0,0,0,0.6),0_0_20px_rgba(212,165,116,0.4)]">
            Welcome to Tailored Care Solutions
          </h1>
          <p className="text-xl md:text-2xl text-[var(--tcs-gold)]/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5),0_0_15px_rgba(212,165,116,0.3)]">
            PSW Voice Documentation Platform
          </p>
        </motion.div>

        {/* Avatar with Enhanced Styling */}
        <motion.div 
          className="flex justify-center relative z-20 my-8 md:my-12"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        >
          <div className="relative mb-8 md:mb-12">
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
          className="liquid-glass-card rounded-glass-lg p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-white/20 relative z-10 mt-12 md:mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <p className="text-[var(--tcs-gold)] text-xl md:text-2xl font-semibold leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.5),0_0_15px_rgba(212,165,116,0.3)]">
            Hello! I'm here to help you document your PSW shift notes today. How are you feeling?
          </p>
        </motion.div>

        {/* Enhanced Microphone Button with Status Indicator */}
        <motion.div
          className="space-y-4 mt-10 md:mt-12"
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
            <span className="text-2xl md:text-3xl font-black leading-tight text-[var(--tcs-gold)] drop-shadow-[0_2px_8px_rgba(0,0,0,0.5),0_0_15px_rgba(212,165,116,0.3)]">
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
          <h3 className="text-[var(--tcs-gold)] text-2xl font-bold text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.5),0_0_15px_rgba(212,165,116,0.3)]">Quick Actions</h3>
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
              <span className="text-[var(--tcs-gold)] text-xl md:text-2xl font-bold text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.5),0_0_15px_rgba(212,165,116,0.3)]">Start Voice Session</span>
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
              <span className="text-[var(--tcs-gold)] text-xl md:text-2xl font-bold text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.5),0_0_15px_rgba(212,165,116,0.3)]">Review Reports</span>
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
              <span className="text-[var(--tcs-gold)] text-xl md:text-2xl font-bold text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.5),0_0_15px_rgba(212,165,116,0.3)]">View Analytics</span>
              <p className="text-sm text-[var(--tcs-gold)]/80 text-center drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">Insights and trends</p>
            </motion.button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
