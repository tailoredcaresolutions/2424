import { Card } from "@/components/ui/card";
import { Heart, Activity, Moon, Footprints, Flame, TrendingUp, AlertCircle, CheckCircle, Pill, Phone } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Health() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2332] via-[#1e2838] to-[#1a2332]">
      {/* Header */}
      <motion.div 
        className="glass-light border-b border-[#c9a063]/20 px-6 py-5 sticky top-0 z-10 backdrop-blur-2xl"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <motion.button
                className="text-[#c9a063] text-2xl"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ←
              </motion.button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#c9a063]">Health Dashboard</h1>
              <p className="text-sm text-gray-300">Your wellness overview</p>
            </div>
          </div>
          <Heart className="w-8 h-8 text-green-400" />
        </div>
      </motion.div>

      <div className="container max-w-2xl mx-auto px-6 py-6 space-y-6">
        {/* Cognitive Health Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8 glass-gold border-2 border-[#c9a063]/30 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-bold text-[#c9a063]">Cognitive Health Score</h2>
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="rgba(201, 160, 99, 0.2)"
                    strokeWidth="12"
                    fill="none"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="#c9a063"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 552" }}
                    animate={{ strokeDasharray: "462 552" }}
                    transition={{ duration: 2, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-6xl font-bold text-[#c9a063]">84</span>
                  <span className="text-sm text-gray-400">out of 100</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6">
                {[
                  { label: 'Sleep', value: '92%', icon: Moon },
                  { label: 'Activity', value: '78%', icon: Activity },
                  { label: 'Heart', value: '82%', icon: Heart },
                ].map((item) => (
                  <div key={item.label} className="glass-light rounded-2xl p-4 border border-[#c9a063]/15">
                    <item.icon className="w-6 h-6 text-[#c9a063] mx-auto mb-2" />
                    <div className="text-sm text-gray-400">{item.label}</div>
                    <div className="text-lg font-bold text-[#c9a063]">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Today's Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-bold text-[#c9a063] mb-4 px-2">Today's Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Heart, label: 'Heart Rate', value: '72 bpm', color: 'text-red-400' },
              { icon: Moon, label: 'Sleep', value: '7h 30m', color: 'text-blue-400' },
              { icon: Footprints, label: 'Steps', value: '2,847', color: 'text-green-400' },
              { icon: Flame, label: 'Calories', value: '1,842', color: 'text-orange-400' },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <Card className="p-6 glass-light border border-[#c9a063]/20 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
                  <item.icon className={`w-10 h-10 ${item.color} mb-3`} />
                  <div className="text-sm text-gray-400">{item.label}</div>
                  <div className="text-2xl font-bold text-[#c9a063]">{item.value}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Sleep Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 glass-light border border-[#c9a063]/20 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
            <div className="flex items-center gap-3 mb-4">
              <Moon className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-bold text-[#c9a063]">Sleep Analysis</h3>
            </div>
            <div className="space-y-3">
              {[
                { stage: 'Deep Sleep', duration: '2h 15m', percentage: 30, color: 'bg-blue-600' },
                { stage: 'REM Sleep', duration: '1h 45m', percentage: 23, color: 'bg-purple-600' },
                { stage: 'Light Sleep', duration: '3h 30m', percentage: 47, color: 'bg-blue-400' },
              ].map((item) => (
                <div key={item.stage} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">{item.stage}</span>
                    <span className="text-[#c9a063] font-semibold">{item.duration}</span>
                  </div>
                  <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${item.color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Activity Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 glass-light border border-[#c9a063]/20 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-6 h-6 text-green-400" />
              <h3 className="text-lg font-bold text-[#c9a063]">Activity Analysis</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Steps', value: '2,847', goal: '5,000' },
                { label: 'Active Minutes', value: '42', goal: '60' },
                { label: 'Calories', value: '1,842', goal: '2,000' },
                { label: 'Distance', value: '2.1 km', goal: '3.5 km' },
              ].map((item) => (
                <div key={item.label} className="glass-light rounded-2xl p-4 border border-[#c9a063]/15">
                  <div className="text-sm text-gray-400">{item.label}</div>
                  <div className="text-xl font-bold text-[#c9a063]">{item.value}</div>
                  <div className="text-xs text-gray-500 mt-1">Goal: {item.goal}</div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Health Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6 glass-light border border-[#c9a063]/20 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-[#c9a063]" />
              <h3 className="text-lg font-bold text-[#c9a063]">AI Health Insights</h3>
            </div>
            <div className="space-y-3">
              {[
                { type: 'success', icon: CheckCircle, text: 'Great sleep quality last night! Keep it up.' },
                { type: 'info', icon: AlertCircle, text: 'Consider a short walk to reach your step goal.' },
                { type: 'success', icon: CheckCircle, text: 'Heart rate is in healthy range today.' },
              ].map((insight, index) => (
                <div key={index} className="glass-light rounded-2xl p-4 flex items-start gap-3 border border-[#c9a063]/15">
                  <insight.icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${insight.type === 'success' ? 'text-green-400' : 'text-blue-400'}`} />
                  <p className="text-sm text-gray-300">{insight.text}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Medications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-6 glass-light border border-[#c9a063]/20 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
            <div className="flex items-center gap-3 mb-4">
              <Pill className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-bold text-[#c9a063]">Medications</h3>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Vitamin D', time: '8:00 AM', taken: true },
                { name: 'Blood Pressure', time: '12:00 PM', taken: true },
                { name: 'Evening Supplement', time: '8:00 PM', taken: false },
              ].map((med) => (
                <div key={med.name} className="glass-light rounded-2xl p-4 flex items-center justify-between border border-[#c9a063]/15">
                  <div>
                    <div className="text-gray-200 font-medium">{med.name}</div>
                    <div className="text-sm text-gray-400">{med.time}</div>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${med.taken ? 'bg-green-500' : 'bg-gray-600'}`}>
                    {med.taken && <CheckCircle className="w-4 h-4 text-white" />}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Emergency Contacts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="pb-8"
        >
          <motion.button
            className="w-full bg-gradient-to-br from-red-500/90 via-red-600/85 to-red-700/80 text-white font-bold py-6 px-8 rounded-[26px] shadow-[0_12px_32px_rgba(239,68,68,0.45),0_4px_12px_rgba(0,0,0,0.35),inset_0_2px_0_rgba(255,255,255,0.25)] hover:shadow-[0_16px_40px_rgba(239,68,68,0.55)] transition-all duration-300 flex items-center justify-center gap-4 text-xl"
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.97 }}
          >
            <Phone className="w-7 h-7" />
            <span>Emergency Contacts</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
