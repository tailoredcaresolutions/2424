import { Card } from "@/components/ui/card";
import { Camera, Heart, Users, Calendar, Play, Plus, Search } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Memories() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All", icon: Camera },
    { id: "family", label: "Family", icon: Users },
    { id: "favorites", label: "Favorites", icon: Heart },
    { id: "recent", label: "Recent", icon: Calendar },
  ];

  const memories = [
    { id: 1, image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400", title: "Family Gathering", date: "2 days ago", category: "family", isFavorite: true },
    { id: 2, image: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400", title: "Birthday Celebration", date: "1 week ago", category: "family", isFavorite: true },
    { id: 3, image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400", title: "Garden Walk", date: "2 weeks ago", category: "recent", isFavorite: false },
    { id: 4, image: "https://images.unsplash.com/photo-1476900543704-4312b78632f8?w=400", title: "Sunset View", date: "3 weeks ago", category: "favorites", isFavorite: true },
    { id: 5, image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400", title: "Grandchildren Visit", date: "1 month ago", category: "family", isFavorite: true },
    { id: 6, image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400", title: "Morning Coffee", date: "1 month ago", category: "recent", isFavorite: false },
  ];

  const filteredMemories = selectedCategory === "all" 
    ? memories 
    : memories.filter(m => m.category === selectedCategory || (selectedCategory === "favorites" && m.isFavorite));

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
              <h1 className="text-2xl font-bold text-[#c9a063]">Memory Lane</h1>
              <p className="text-sm text-gray-300">Your cherished moments</p>
            </div>
          </div>
          <Camera className="w-8 h-8 text-purple-400" />
        </div>
      </motion.div>

      <div className="container max-w-2xl mx-auto px-6 py-6 space-y-6">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="glass-light rounded-[24px] p-4 flex items-center gap-3 border border-[#c9a063]/20 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
            <Search className="w-6 h-6 text-[#c9a063]" />
            <input
              type="text"
              placeholder="Search memories..."
              className="flex-1 bg-transparent text-gray-200 placeholder-gray-500 outline-none text-lg"
            />
          </div>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-[20px] font-semibold whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-br from-[#c9a063] to-[#d4b078] text-[#1a2332] shadow-[0_8px_24px_rgba(201,160,99,0.4)]'
                    : 'glass-light border border-[#c9a063]/20 text-[#c9a063]'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <category.icon className="w-5 h-5" />
                <span>{category.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Photos', value: '247', icon: Camera, color: 'text-purple-400' },
              { label: 'Favorites', value: '42', icon: Heart, color: 'text-red-400' },
              { label: 'This Month', value: '18', icon: Calendar, color: 'text-blue-400' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
              >
                <Card className="p-4 glass-light border border-[#c9a063]/20 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
                  <stat.icon className={`w-6 h-6 ${stat.color} mb-2 mx-auto`} />
                  <div className="text-2xl font-bold text-[#c9a063] text-center">{stat.value}</div>
                  <div className="text-xs text-gray-400 text-center">{stat.label}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Add New Memory Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            className="w-full bg-gradient-to-br from-[#c9a063] via-[#d4b078] to-[#c9a063] text-[#1a2332] font-bold py-6 px-8 rounded-[26px] shadow-[0_12px_32px_rgba(201,160,99,0.45),inset_0_2px_0_rgba(255,255,255,0.35)] hover:shadow-[0_16px_40px_rgba(201,160,99,0.55)] transition-all duration-300 flex items-center justify-center gap-4 text-xl"
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus className="w-7 h-7" />
            <span>Add New Memory</span>
          </motion.button>
        </motion.div>

        {/* Memory Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-xl font-bold text-[#c9a063] mb-4 px-2">
            {selectedCategory === "all" ? "All Memories" : categories.find(c => c.id === selectedCategory)?.label}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {filteredMemories.map((memory, index) => (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.05 }}
              >
                <motion.div
                  className="relative glass-light rounded-[24px] overflow-hidden border border-[#c9a063]/20 shadow-[0_8px_24px_rgba(0,0,0,0.25)] cursor-pointer"
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Image */}
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={memory.image}
                      alt={memory.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Favorite Badge */}
                    {memory.isFavorite && (
                      <div className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                        <Heart className="w-4 h-4 text-white fill-white" />
                      </div>
                    )}
                    
                    {/* Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-bold text-sm mb-1">{memory.title}</h3>
                      <p className="text-gray-300 text-xs">{memory.date}</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Video Memories Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="p-6 glass-light border border-[#c9a063]/20 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
            <div className="flex items-center gap-3 mb-4">
              <Play className="w-6 h-6 text-[#c9a063]" />
              <h3 className="text-lg font-bold text-[#c9a063]">Video Messages</h3>
            </div>
            <div className="space-y-3">
              {[
                { from: "Sarah (Daughter)", message: "Happy Birthday Mom! Love you!", duration: "2:34", thumbnail: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400" },
                { from: "Michael (Son)", message: "Thinking of you today!", duration: "1:45", thumbnail: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400" },
              ].map((video) => (
                <motion.div
                  key={video.from}
                  className="glass-light rounded-2xl p-4 flex items-center gap-4 border border-[#c9a063]/15 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={video.thumbnail} alt={video.from} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                      {video.duration}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-200 font-semibold">{video.from}</div>
                    <div className="text-sm text-gray-400">{video.message}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Reminiscence Therapy Tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="pb-8"
        >
          <Card className="p-6 glass-gold border-2 border-[#c9a063]/30 shadow-[0_12px_32px_rgba(201,160,99,0.3)]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#c9a063]/20 flex items-center justify-center flex-shrink-0">
                <Heart className="w-6 h-6 text-[#c9a063]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#c9a063] mb-2">💡 Reminiscence Tip</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Looking at old photos can help stimulate memories and improve mood. Take your time with each photo and share stories about what you remember.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
