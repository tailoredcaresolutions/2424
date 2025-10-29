'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MessageCircle, Camera } from 'lucide-react';
import AICompanionAvatar from './AICompanionAvatar';

export default function SimpleChatWrapper() {
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

  const getAvatarState = () => {
    if (isSpeaking) return "speaking";
    if (isListening) return "listening";
    return "idle";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2332] via-[#1e2838] to-[#1a2332] flex items-center justify-center p-5">
      <div className="w-full max-w-xl space-y-6">
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.7 }} className="mx-4">
          <div className="p-10 glass-gold border-2 border-[#c9a063]/30 shadow-2xl rounded-3xl">
            <div className="space-y-8">
              <div className="flex justify-center">
                <AICompanionAvatar state={getAvatarState()} size="lg" primaryColor="#c9a063" secondaryColor="#d4b078" glowIntensity={0.22} enableHover={true} avatarUrl="/companion-avatar-realistic.png" />
              </div>
              <motion.div className="glass-light rounded-3xl p-6 border border-[#c9a063]/25 shadow-lg" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <p className="text-xl text-center text-gray-100 leading-relaxed font-medium">Hello! I'm here to help you today. How are you feeling?</p>
              </motion.div>
              <motion.button onClick={handleMicClick} disabled={isListening} className="w-full bg-gradient-to-br from-[#c9a063] to-[#d4b078] hover:from-[#d4b078] hover:to-[#e0c088] text-[#1a2332] font-bold py-5 px-6 rounded-3xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 text-xl min-h-[56px]" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Mic className={`w-7 h-7 ${isListening ? 'animate-pulse' : ''}`} />
                <span>{isListening ? 'Listening...' : 'Tap the microphone to talk'}</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mx-4">
          <h3 className="text-lg font-bold text-[#c9a063] text-center mb-4">Quick Access</h3>
          <div className="grid grid-cols-2 gap-3">
            <motion.button className="glass-light border border-[#c9a063]/20 rounded-2xl p-6 flex flex-col items-center gap-2 hover:border-[#c9a063]/40 transition-all min-h-[120px]" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c9a063] to-[#d4b078] flex items-center justify-center shadow-md">
                <MessageCircle className="w-6 h-6 text-[#1a2332]" />
              </div>
              <span className="text-base font-bold text-gray-100">Chats</span>
            </motion.button>
            <motion.button className="glass-light border border-[#c9a063]/20 rounded-2xl p-6 flex flex-col items-center gap-2 hover:border-[#c9a063]/40 transition-all min-h-[120px]" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c9a063] to-[#d4b078] flex items-center justify-center shadow-md">
                <Camera className="w-6 h-6 text-[#1a2332]" />
              </div>
              <span className="text-base font-bold text-gray-100">Memories</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
