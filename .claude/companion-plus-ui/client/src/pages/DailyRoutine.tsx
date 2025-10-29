import { Card } from "@/components/ui/card";
import { Calendar, Coffee, Pill, Utensils, Moon, CheckCircle, Clock, TrendingUp, Sun } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useState } from "react";

export default function DailyRoutine() {
  const [completedTasks, setCompletedTasks] = useState<number[]>([1, 2, 4]);

  const toggleTask = (id: number) => {
    setCompletedTasks(prev => 
      prev.includes(id) ? prev.filter(taskId => taskId !== id) : [...prev, id]
    );
  };

  const routines = [
    { id: 1, time: "7:00 AM", title: "Wake Up & Morning Routine", icon: Sun, color: "text-yellow-400" },
    { id: 2, time: "8:00 AM", title: "Breakfast", icon: Coffee, color: "text-orange-400" },
    { id: 3, time: "8:30 AM", title: "Morning Medication", icon: Pill, color: "text-purple-400" },
    { id: 4, time: "10:00 AM", title: "Morning Walk", icon: TrendingUp, color: "text-green-400" },
    { id: 5, time: "12:30 PM", title: "Lunch", icon: Utensils, color: "text-red-400" },
    { id: 6, time: "2:00 PM", title: "Afternoon Activity", icon: Calendar, color: "text-blue-400" },
    { id: 7, time: "6:00 PM", title: "Dinner", icon: Utensils, color: "text-red-400" },
    { id: 8, time: "8:00 PM", title: "Evening Medication", icon: Pill, color: "text-purple-400" },
    { id: 9, time: "9:30 PM", title: "Bedtime Routine", icon: Moon, color: "text-indigo-400" },
  ];

  const completionPercentage = Math.round((completedTasks.length / routines.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2332] via-[#1e2838] to-[#1a2332]">
      <motion.div 
        className="glass-light border-b border-[#c9a063]/20 px-6 py-5 sticky top-0 z-10 backdrop-blur-2xl"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <motion.button className="text-[#c9a063] text-2xl" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>←</motion.button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#c9a063]">Daily Routine</h1>
              <p className="text-sm text-gray-300">Your daily schedule</p>
            </div>
          </div>
          <Calendar className="w-8 h-8 text-blue-400" />
        </div>
      </motion.div>

      <div className="container max-w-2xl mx-auto px-6 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-8 glass-gold border-2 border-[#c9a063]/30 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-bold text-[#c9a063]">Today's Progress</h2>
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle cx="96" cy="96" r="88" stroke="rgba(201, 160, 99, 0.2)" strokeWidth="12" fill="none" />
                  <motion.circle cx="96" cy="96" r="88" stroke="#c9a063" strokeWidth="12" fill="none" strokeLinecap="round" initial={{ strokeDasharray: "0 552" }} animate={{ strokeDasharray: `${(completionPercentage / 100) * 552} 552` }} transition={{ duration: 1.5, ease: "easeOut" }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-6xl font-bold text-[#c9a063]">{completionPercentage}%</span>
                  <span className="text-sm text-gray-400">Complete</span>
                </div>
              </div>
              <div className="text-gray-300"><span className="text-2xl font-bold text-[#c9a063]">{completedTasks.length}</span> of {routines.length} tasks completed</div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-xl font-bold text-[#c9a063] mb-4 px-2">Today's Schedule</h2>
          <div className="space-y-3">
            {routines.map((routine, index) => {
              const isCompleted = completedTasks.includes(routine.id);
              return (
                <motion.div key={routine.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + index * 0.05 }}>
                  <motion.button onClick={() => toggleTask(routine.id)} className={`w-full glass-light rounded-[24px] p-6 border transition-all duration-300 ${isCompleted ? 'border-green-500/50 bg-green-500/10' : 'border-[#c9a063]/20 hover:border-[#c9a063]/40'} shadow-[0_8px_24px_rgba(0,0,0,0.25)]`} whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}>
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-20"><div className={`text-sm font-semibold ${isCompleted ? 'text-green-400' : 'text-[#c9a063]'}`}>{routine.time}</div></div>
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted ? 'bg-green-500/20' : 'bg-[#c9a063]/10'}`}><routine.icon className={`w-7 h-7 ${isCompleted ? 'text-green-400' : routine.color}`} /></div>
                      <div className="flex-1 text-left"><div className={`text-lg font-semibold ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-200'}`}>{routine.title}</div></div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted ? 'bg-green-500' : 'bg-gray-600'}`}>{isCompleted && <CheckCircle className="w-5 h-5 text-white" />}</div>
                    </div>
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }} className="pb-8">
          <Card className="p-6 glass-gold border-2 border-[#c9a063]/30 shadow-[0_12px_32px_rgba(201,160,99,0.3)]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#c9a063]/20 flex items-center justify-center flex-shrink-0"><CheckCircle className="w-6 h-6 text-[#c9a063]" /></div>
              <div>
                <h3 className="text-lg font-bold text-[#c9a063] mb-2">💡 Routine Tip</h3>
                <p className="text-gray-300 text-sm leading-relaxed">Maintaining a consistent daily routine helps reduce confusion and anxiety. Try to complete activities at the same time each day for best results.</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
