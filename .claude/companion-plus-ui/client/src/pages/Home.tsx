import { Card } from "@/components/ui/card";
import AICompanionAvatar from "@/components/AICompanionAvatar";
import { Mic, MessageCircle, Camera, Calendar, Shield, Heart, Users, Settings } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";

export default function Home() {
  const { t } = useLanguage();
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
            <h1 className="text-2xl font-bold text-[#c9a063]">{t('app.title')}</h1>
            <p className="text-sm text-gray-300">{t('app.subtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50" />
              <span className="text-sm font-medium text-gray-200">{t('status.connected')}</span>
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
          <Card className="p-12 glass-gold border-2 border-[#c9a063]/30 shadow-[0_20px_60px_rgba(0,0,0,0.5),0_8px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]">
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
                  {t('home.greeting')}
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
                  className="w-full bg-gradient-to-br from-[#c9a063] via-[#d4b078] to-[#c9a063] hover:from-[#d4b078] hover:via-[#e0c088] hover:to-[#d4b078] disabled:from-[#8a6f44] disabled:to-[#7a5f34] text-[#1a2332] font-bold py-7 px-10 rounded-[26px] shadow-[0_12px_32px_rgba(201,160,99,0.45),0_4px_12px_rgba(0,0,0,0.35),inset_0_2px_0_rgba(255,255,255,0.35),inset_0_-3px_0_rgba(0,0,0,0.25)] hover:shadow-[0_16px_40px_rgba(201,160,99,0.55),0_6px_16px_rgba(0,0,0,0.4),inset_0_2px_0_rgba(255,255,255,0.45)] transition-all duration-300 flex items-center justify-center gap-4 border border-[#e0c088]/50 backdrop-blur-sm text-2xl"
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                >
                  <Mic className={`w-8 h-8 ${isListening ? 'animate-pulse' : ''}`} />
                  <span>{isListening ? (t('home.listening') || 'Listening...') : t('home.tapMic')}</span>
                </motion.button>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Access with enhanced glass buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <h2 className="text-xl font-bold text-[#c9a063] mb-4 px-2">{t('home.quickAccess')}</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: MessageCircle, labelKey: 'nav.chats', to: '/conversations', color: 'from-blue-500/20 to-blue-600/10' },
              { icon: Camera, labelKey: 'nav.memories', to: '/memories', color: 'from-purple-500/20 to-purple-600/10' },
              { icon: Calendar, labelKey: 'nav.routine', to: '/routine', color: 'from-orange-500/20 to-orange-600/10' },
              { icon: Shield, labelKey: 'nav.safety', to: '/safety', color: 'from-red-500/20 to-red-600/10' },
              { icon: Heart, labelKey: 'nav.health', to: '/health', color: 'from-green-500/20 to-green-600/10' },
              { icon: Users, labelKey: 'nav.family', to: '/family', color: 'from-teal-500/20 to-teal-600/10' },
            ].map((item, index) => (
              <motion.div
                key={item.labelKey}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.05, duration: 0.4 }}
              >
                <Link href={item.to}>
                  <motion.button
                    className={`w-full glass-light bg-gradient-to-br ${item.color} border border-[#c9a063]/20 rounded-[24px] p-6 flex flex-col items-center gap-3 shadow-[0_8px_24px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all duration-300`}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <item.icon className="w-10 h-10 text-[#c9a063]" />
                    <span className="text-lg font-semibold text-[#c9a063]">{t(item.labelKey)}</span>
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Caregiver & Settings Row */}
        <motion.div
          className="grid grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <Link href="/caregiver">
            <motion.button
              className="w-full glass-light bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-[#c9a063]/20 rounded-[24px] p-6 flex flex-col items-center gap-3 shadow-[0_8px_24px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all duration-300"
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart className="w-10 h-10 text-[#c9a063]" />
              <span className="text-lg font-semibold text-[#c9a063]">{t('nav.caregiver')}</span>
            </motion.button>
          </Link>
          
          <Link href="/settings">
            <motion.button
              className="w-full glass-light bg-gradient-to-br from-gray-500/20 to-gray-600/10 border border-[#c9a063]/20 rounded-[24px] p-6 flex flex-col items-center gap-3 shadow-[0_8px_24px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all duration-300"
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="w-10 h-10 text-[#c9a063]" />
              <span className="text-lg font-semibold text-[#c9a063]">{t('nav.settings')}</span>
            </motion.button>
          </Link>
        </motion.div>

        {/* Today's Summary with glass effect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          <Card className="p-6 glass-light border border-[#c9a063]/20 shadow-[0_8px_24px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.1)]">
            <h3 className="text-xl font-bold text-[#c9a063] mb-4">{t('home.todaySummary')}</h3>
            <div className="space-y-3">
              <div className="glass-light rounded-2xl p-4 flex items-center justify-between border border-[#c9a063]/15">
                <span className="text-gray-300 font-medium">{t('home.mood')}</span>
                <span className="text-3xl">😊</span>
              </div>
              <div className="glass-light rounded-2xl p-4 flex items-center justify-between border border-[#c9a063]/15">
                <span className="text-gray-300 font-medium">{t('home.stepsToday')}</span>
                <span className="text-[#c9a063] font-bold text-xl">2,847</span>
              </div>
              <div className="glass-light rounded-2xl p-4 flex items-center justify-between border border-[#c9a063]/15">
                <span className="text-gray-300 font-medium">{t('home.sleepLastNight')}</span>
                <span className="text-[#c9a063] font-bold text-xl">7h 30m</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Avatar Demo Link */}
        <motion.div
          className="text-center pb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <Link href="/avatar-demo">
            <motion.button
              className="glass-light border border-[#c9a063]/20 rounded-full px-8 py-3 text-[#c9a063] font-semibold hover:bg-[#c9a063]/10 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🎨 View Avatar Demo
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
