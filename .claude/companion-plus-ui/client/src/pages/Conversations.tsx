import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
export default function Conversations() {
  return <div className="min-h-screen bg-gradient-to-br from-[#1a2332] via-[#1e2838] to-[#1a2332]"><div className="glass-light border-b border-[#c9a063]/20 px-6 py-5"><div className="flex items-center gap-4"><Link href="/"><Button variant="ghost" size="lg" className="w-14 h-14 rounded-full text-[#c9a063]"><ArrowLeft className="w-7 h-7" /></Button></Link><h1 className="text-3xl font-bold text-[#c9a063]">Conversations</h1></div></div><div className="container max-w-2xl mx-auto px-6 py-6"><Card className="p-8 glass-gold border-2 border-[#c9a063]/30"><h2 className="text-2xl font-bold text-[#c9a063]">Conversation History</h2></Card></div></div>;
}
