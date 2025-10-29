import { Card } from "@/components/ui/card";
import { Settings as SettingsIcon, Globe, Volume2, Type, Eye, Bell, Shield, User, Heart, HelpCircle, LogOut } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Settings() {
  const [language, setLanguage] = useState("english");
  const [textSize, setTextSize] = useState("large");
  const [voiceVolume, setVoiceVolume] = useState(80);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2332] via-[#1e2838] to-[#1a2332]">
      <motion.div className="glass-light border-b border-[#c9a063]/20 px-6 py-5 sticky top-0 z-10 backdrop-blur-2xl" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/"><motion.button className="text-[#c9a063] text-2xl" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>←</motion.button></Link>
            <div><h1 className="text-2xl font-bold text-[#c9a063]">Settings</h1><p className="text-sm text-gray-300">Customize your experience</p></div>
          </div>
          <SettingsIcon className="w-8 h-8 text-[#c9a063]" />
        </div>
      </motion.div>

      <div className="container max-w-2xl mx-auto px-6 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6 glass-gold border-2 border-[#c9a063]/30 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#c9a063] to-[#d4b078] flex items-center justify-center"><User className="w-10 h-10 text-[#1a2332]" /></div>
              <div className="flex-1"><h2 className="text-2xl font-bold text-[#c9a063]">Margaret Smith</h2><p className="text-gray-300">Active since January 2024</p></div>
              <motion.button className="glass-light border border-[#c9a063]/20 rounded-full px-6 py-2 text-[#c9a063] font-semibold" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Edit</motion.button>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-xl font-bold text-[#c9a063] mb-4 px-2">Language & Region</h2>
          <Card className="p-6 glass-light border border-[#c9a063]/20 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
            <div className="flex items-center gap-4 mb-4"><Globe className="w-6 h-6 text-[#c9a063]" /><h3 className="text-lg font-semibold text-gray-200">Preferred Language</h3></div>
            <div className="grid grid-cols-2 gap-3">
              {[{ id: "english", label: "English", flag: "🇺🇸" }, { id: "portuguese", label: "Português", flag: "🇵🇹" }].map((lang) => (
                <motion.button key={lang.id} onClick={() => setLanguage(lang.id)} className={`p-4 rounded-[20px] font-semibold transition-all duration-300 ${language === lang.id ? 'bg-gradient-to-br from-[#c9a063] to-[#d4b078] text-[#1a2332] shadow-[0_8px_24px_rgba(201,160,99,0.4)]' : 'glass-light border border-[#c9a063]/20 text-[#c9a063]'}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <div className="text-3xl mb-2">{lang.flag}</div><div>{lang.label}</div>
                </motion.button>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-xl font-bold text-[#c9a063] mb-4 px-2">Accessibility</h2>
          <div className="space-y-4">
            <Card className="p-6 glass-light border border-[#c9a063]/20 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
              <div className="flex items-center gap-4 mb-4"><Type className="w-6 h-6 text-[#c9a063]" /><h3 className="text-lg font-semibold text-gray-200">Text Size</h3></div>
              <div className="grid grid-cols-3 gap-3">
                {[{ id: "normal", label: "Normal", size: "text-base" }, { id: "large", label: "Large", size: "text-lg" }, { id: "xlarge", label: "X-Large", size: "text-xl" }].map((size) => (
                  <motion.button key={size.id} onClick={() => setTextSize(size.id)} className={`p-4 rounded-[20px] font-semibold transition-all duration-300 ${textSize === size.id ? 'bg-gradient-to-br from-[#c9a063] to-[#d4b078] text-[#1a2332]' : 'glass-light border border-[#c9a063]/20 text-[#c9a063]'} ${size.size}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>{size.label}</motion.button>
                ))}
              </div>
            </Card>

            <Card className="p-6 glass-light border border-[#c9a063]/20 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
              <div className="flex items-center gap-4 mb-4"><Volume2 className="w-6 h-6 text-[#c9a063]" /><h3 className="text-lg font-semibold text-gray-200">Voice Volume</h3></div>
              <div className="space-y-3">
                <input type="range" min="0" max="100" value={voiceVolume} onChange={(e) => setVoiceVolume(parseInt(e.target.value))} className="w-full h-3 bg-slate-700/50 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#c9a063] [&::-webkit-slider-thumb]:cursor-pointer" />
                <div className="flex justify-between text-sm text-gray-400"><span>0%</span><span className="text-[#c9a063] font-bold text-lg">{voiceVolume}%</span><span>100%</span></div>
              </div>
            </Card>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h2 className="text-xl font-bold text-[#c9a063] mb-4 px-2">Support & Help</h2>
          <div className="space-y-3">
            {[{ icon: HelpCircle, label: "Help Center", color: "text-blue-400" }, { icon: Shield, label: "Privacy & Security", color: "text-green-400" }, { icon: Heart, label: "About Companion Plus", color: "text-purple-400" }].map((item) => (
              <motion.button key={item.label} className="w-full glass-light rounded-[24px] p-5 border border-[#c9a063]/20 shadow-[0_8px_24px_rgba(0,0,0,0.25)] flex items-center gap-4" whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}>
                <item.icon className={`w-6 h-6 ${item.color}`} /><span className="text-lg font-semibold text-gray-200">{item.label}</span><span className="ml-auto text-[#c9a063]">→</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="pb-8">
          <motion.button className="w-full bg-gradient-to-br from-red-500/80 via-red-600/75 to-red-700/70 text-white font-bold py-6 px-8 rounded-[26px] shadow-[0_12px_32px_rgba(239,68,68,0.35),inset_0_2px_0_rgba(255,255,255,0.2)] hover:shadow-[0_16px_40px_rgba(239,68,68,0.45)] transition-all duration-300 flex items-center justify-center gap-4 text-xl" whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.97 }}>
            <LogOut className="w-7 h-7" /><span>Sign Out</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
