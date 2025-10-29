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
    <div className="min-h-screen bg-gradient-to-b from-[#0A0F1E] to-[#1B365D] flex items-center justify-center p-4">
      <div className="max-w-xl w-full mx-4 space-y-6">
        
        {/* Avatar */}
        <motion.div 
          className="flex justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <AICompanionAvatar 
            state={getAvatarState()}
            expression={isListening ? "curiosity" : isSpeaking ? "excitement" : "joy"}
            avatarUrl="/companion-avatar-realistic.png"
            size="lg"
            primaryColor="#c9a063"
          />
        </motion.div>

        {/* Speech Bubble */}
        <motion.div 
          className="bg-white rounded-3xl p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-gray-800 text-base">
            Hello! I'm here to help you today. How are you feeling?
          </p>
        </motion.div>

        {/* Microphone Button */}
        <motion.button
          onClick={handleMicClick}
          className="w-full bg-[#c9a063] hover:bg-[#b89053] text-white rounded-2xl p-6 shadow-xl flex items-center justify-center gap-3 transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Mic className="w-6 h-6" />
          <span className="text-base font-medium">Tap the microphone to talk</span>
        </motion.button>

        {/* Quick Access */}
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-white text-sm font-medium px-2">Quick Access</h3>
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              onClick={handleChatsClick}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 min-h-[120px] flex flex-col items-center justify-center gap-3 hover:bg-white/20 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-12 h-12 bg-[#c9a063] rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-base">Chats</span>
            </motion.button>
            
            <motion.button
              onClick={handleMemoriesClick}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 min-h-[120px] flex flex-col items-center justify-center gap-3 hover:bg-white/20 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-12 h-12 bg-[#c9a063] rounded-full flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-base">Memories</span>
            </motion.button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
