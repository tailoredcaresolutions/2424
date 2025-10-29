import { useState } from "react";
import AICompanionAvatar, { AIState, AvatarSize } from "@/components/AICompanionAvatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function AvatarDemo() {
  const [currentState, setCurrentState] = useState<AIState>("idle");
  const [size, setSize] = useState<AvatarSize>("xl");
  const [glowIntensity, setGlowIntensity] = useState(0.3);
  const [animationSpeed, setAnimationSpeed] = useState(1.0);
  const [showParticles, setShowParticles] = useState(true);
  const [showRings, setShowRings] = useState(true);
  const [showSparkles, setShowSparkles] = useState(true);

  const states: AIState[] = [
    "idle",
    "listening",
    "speaking",
    "thinking",
    "happy",
    "concerned",
    "celebrating",
    "sleeping",
  ];

  const sizes: AvatarSize[] = ["sm", "md", "lg", "xl"];

  const stateDescriptions: Record<AIState, string> = {
    idle: "Calm breathing, gentle sway - default resting state",
    listening: "Attentive pulse, focused - AI is listening to user",
    speaking: "Energetic bounce, particles, rings - AI is responding",
    thinking: "Head tilt, slower movements - AI is processing",
    happy: "Upward bounce, bright glow - positive emotion",
    concerned: "Subtle downward, muted - worried or cautious",
    celebrating: "Big bounce, lots of particles - excited/success",
    sleeping: "Very slow breathing, low opacity - inactive/dormant",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2332] via-[#1e2838] to-[#1a2332]">
      {/* Header */}
      <div className="glass-light border-b border-[#c9a063]/20 px-6 py-5 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-[#c9a063]">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#c9a063]">AI Avatar Demo</h1>
              <p className="text-sm text-gray-300">Explore all animation states</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Avatar Display */}
          <div className="lg:col-span-2">
            <Card className="p-12 glass-gold border-2 border-[#c9a063]/30 shadow-2xl">
              <div className="flex flex-col items-center gap-8">
                <div className="flex justify-center w-full min-h-[400px] items-center">
                  <AICompanionAvatar
                    state={currentState}
                    size={size}
                    glowIntensity={glowIntensity}
                    animationSpeed={animationSpeed}
                    showParticles={showParticles}
                    showRings={showRings}
                    showSparkles={showSparkles}
                    enableHover={true}
                    enableClick={true}
                    onClick={() => console.log("Avatar clicked!")}
                    onStateChange={(state) => console.log("State changed to:", state)}
                  />
                </div>

                <div className="w-full space-y-4">
                  <div className="glass-light p-6 rounded-2xl border border-[#c9a063]/20">
                    <h3 className="text-xl font-bold text-[#c9a063] mb-2">
                      Current State: {currentState.toUpperCase()}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {stateDescriptions[currentState]}
                    </p>
                  </div>

                  <div className="glass-light p-6 rounded-2xl border border-[#c9a063]/20">
                    <h4 className="text-lg font-bold text-[#c9a063] mb-3">Quick Actions</h4>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={() => setCurrentState("speaking")}
                        className="bg-gradient-to-r from-[#c9a063] to-[#d4b078] text-[#1a2332] font-bold"
                      >
                        🗣️ Speak
                      </Button>
                      <Button
                        onClick={() => setCurrentState("listening")}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold"
                      >
                        👂 Listen
                      </Button>
                      <Button
                        onClick={() => setCurrentState("thinking")}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold"
                      >
                        🤔 Think
                      </Button>
                      <Button
                        onClick={() => setCurrentState("happy")}
                        className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold"
                      >
                        😊 Happy
                      </Button>
                      <Button
                        onClick={() => setCurrentState("celebrating")}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold"
                      >
                        🎉 Celebrate
                      </Button>
                      <Button
                        onClick={() => setCurrentState("idle")}
                        className="bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold"
                      >
                        😌 Idle
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Controls Panel */}
          <div className="space-y-6">
            {/* State Selection */}
            <Card className="p-6 glass-light border-2 border-[#c9a063]/30">
              <h3 className="text-xl font-bold text-[#c9a063] mb-4">AI States</h3>
              <div className="grid grid-cols-2 gap-3">
                {states.map((state) => (
                  <Button
                    key={state}
                    onClick={() => setCurrentState(state)}
                    variant={currentState === state ? "default" : "outline"}
                    className={
                      currentState === state
                        ? "bg-[#c9a063] text-[#1a2332] font-bold"
                        : "border-[#c9a063]/50 text-[#c9a063] hover:bg-[#c9a063]/10"
                    }
                  >
                    {state}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Size Control */}
            <Card className="p-6 glass-light border-2 border-[#c9a063]/30">
              <h3 className="text-xl font-bold text-[#c9a063] mb-4">Size</h3>
              <div className="grid grid-cols-4 gap-2">
                {sizes.map((s) => (
                  <Button
                    key={s}
                    onClick={() => setSize(s)}
                    variant={size === s ? "default" : "outline"}
                    className={
                      size === s
                        ? "bg-[#c9a063] text-[#1a2332] font-bold"
                        : "border-[#c9a063]/50 text-[#c9a063] hover:bg-[#c9a063]/10"
                    }
                  >
                    {s.toUpperCase()}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Glow Intensity */}
            <Card className="p-6 glass-light border-2 border-[#c9a063]/30">
              <h3 className="text-xl font-bold text-[#c9a063] mb-4">
                Glow Intensity: {(glowIntensity * 100).toFixed(0)}%
              </h3>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={glowIntensity}
                onChange={(e) => setGlowIntensity(parseFloat(e.target.value))}
                className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#c9a063]"
              />
            </Card>

            {/* Animation Speed */}
            <Card className="p-6 glass-light border-2 border-[#c9a063]/30">
              <h3 className="text-xl font-bold text-[#c9a063] mb-4">
                Animation Speed: {animationSpeed.toFixed(1)}x
              </h3>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#c9a063]"
              />
            </Card>

            {/* Toggle Features */}
            <Card className="p-6 glass-light border-2 border-[#c9a063]/30">
              <h3 className="text-xl font-bold text-[#c9a063] mb-4">Features</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showParticles}
                    onChange={(e) => setShowParticles(e.target.checked)}
                    className="w-5 h-5 accent-[#c9a063]"
                  />
                  <span className="text-gray-200 font-medium">Show Particles</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showRings}
                    onChange={(e) => setShowRings(e.target.checked)}
                    className="w-5 h-5 accent-[#c9a063]"
                  />
                  <span className="text-gray-200 font-medium">Show Rings</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showSparkles}
                    onChange={(e) => setShowSparkles(e.target.checked)}
                    className="w-5 h-5 accent-[#c9a063]"
                  />
                  <span className="text-gray-200 font-medium">Show Sparkles</span>
                </label>
              </div>
            </Card>

            {/* Usage Code */}
            <Card className="p-6 glass-light border-2 border-[#c9a063]/30">
              <h3 className="text-xl font-bold text-[#c9a063] mb-4">Usage Code</h3>
              <pre className="text-xs text-gray-300 bg-black/30 p-4 rounded-lg overflow-x-auto">
{`<AICompanionAvatar
  state="${currentState}"
  size="${size}"
  glowIntensity={${glowIntensity}}
  animationSpeed={${animationSpeed}}
  showParticles={${showParticles}}
  showRings={${showRings}}
  showSparkles={${showSparkles}}
/>`}
              </pre>
            </Card>
          </div>
        </div>

        {/* Documentation Section */}
        <Card className="mt-8 p-8 glass-light border-2 border-[#c9a063]/30">
          <h2 className="text-3xl font-bold text-[#c9a063] mb-6">Component Documentation</h2>
          
          <div className="space-y-6 text-gray-300">
            <div>
              <h3 className="text-2xl font-bold text-[#c9a063] mb-3">Installation</h3>
              <pre className="bg-black/30 p-4 rounded-lg text-sm">
{`npm install framer-motion`}
              </pre>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-[#c9a063] mb-3">Basic Usage</h3>
              <pre className="bg-black/30 p-4 rounded-lg text-sm overflow-x-auto">
{`import AICompanionAvatar from './components/AICompanionAvatar';

function App() {
  const [aiState, setAiState] = useState('idle');
  
  // Your AI can control the state
  const handleAIResponse = (response) => {
    if (response.isListening) setAiState('listening');
    if (response.isSpeaking) setAiState('speaking');
    if (response.isThinking) setAiState('thinking');
  };
  
  return (
    <AICompanionAvatar
      state={aiState}
      size="lg"
      primaryColor="#c9a063"
      glowIntensity={0.3}
      onStateChange={(state) => console.log('New state:', state)}
    />
  );
}`}
              </pre>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-[#c9a063] mb-3">Props</h3>
              <div className="bg-black/30 p-6 rounded-lg space-y-4">
                <div>
                  <code className="text-[#c9a063] font-bold">state</code>
                  <span className="text-gray-400"> - AIState</span>
                  <p className="mt-1">Current AI state: idle, listening, speaking, thinking, happy, concerned, celebrating, sleeping</p>
                </div>
                <div>
                  <code className="text-[#c9a063] font-bold">size</code>
                  <span className="text-gray-400"> - AvatarSize</span>
                  <p className="mt-1">Avatar size: sm, md, lg, xl</p>
                </div>
                <div>
                  <code className="text-[#c9a063] font-bold">primaryColor</code>
                  <span className="text-gray-400"> - string</span>
                  <p className="mt-1">Primary brand color (hex format)</p>
                </div>
                <div>
                  <code className="text-[#c9a063] font-bold">glowIntensity</code>
                  <span className="text-gray-400"> - number (0-1)</span>
                  <p className="mt-1">Controls how much the avatar glows</p>
                </div>
                <div>
                  <code className="text-[#c9a063] font-bold">animationSpeed</code>
                  <span className="text-gray-400"> - number (0.5-2)</span>
                  <p className="mt-1">Speed multiplier for all animations</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-[#c9a063] mb-3">AI Integration Example</h3>
              <pre className="bg-black/30 p-4 rounded-lg text-sm overflow-x-auto">
{`// Example with OpenAI or any AI service
const handleAIChat = async (userMessage) => {
  setAiState('listening'); // Show listening state
  
  const response = await fetch('/api/ai', {
    method: 'POST',
    body: JSON.stringify({ message: userMessage })
  });
  
  setAiState('thinking'); // Show thinking state
  const data = await response.json();
  
  setAiState('speaking'); // Show speaking state
  speakResponse(data.message);
  
  setTimeout(() => setAiState('idle'), 3000); // Return to idle
};`}
              </pre>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
