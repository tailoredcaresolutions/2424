import { useEffect, useState } from "react";

interface CompanionAvatarProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  mood?: "happy" | "calm" | "thinking" | "caring";
}

export default function CompanionAvatar({
  isListening = false,
  isSpeaking = false,
  mood = "happy",
}: CompanionAvatarProps) {
  const [blinkState, setBlinkState] = useState(false);

  // Natural blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinkState(true);
      setTimeout(() => setBlinkState(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  const getMouthPath = () => {
    if (isSpeaking) {
      return "M 30 45 Q 40 55 50 45"; // Open mouth when speaking
    }
    switch (mood) {
      case "happy":
        return "M 30 45 Q 40 50 50 45"; // Smile
      case "calm":
        return "M 30 45 Q 40 47 50 45"; // Gentle smile
      case "thinking":
        return "M 30 45 L 50 45"; // Neutral
      case "caring":
        return "M 30 45 Q 40 52 50 45"; // Warm smile
      default:
        return "M 30 45 Q 40 50 50 45";
    }
  };

  return (
    <div className="relative">
      {/* Glow effect when speaking */}
      {isSpeaking && (
        <div className="absolute inset-0 animate-pulse">
          <div className="w-full h-full rounded-full bg-accent/20 blur-2xl" />
        </div>
      )}

      {/* Listening pulse effect */}
      {isListening && (
        <div className="absolute inset-0 animate-ping">
          <div className="w-full h-full rounded-full bg-primary/30" />
        </div>
      )}

      {/* Main avatar */}
      <svg
        viewBox="0 0 80 80"
        className="relative w-full h-full drop-shadow-xl"
        style={{
          filter: isSpeaking ? "drop-shadow(0 0 20px rgba(234, 179, 8, 0.6))" : undefined,
        }}
      >
        {/* Face background */}
        <circle cx="40" cy="40" r="35" fill="url(#faceGradient)" />

        {/* Gradient definitions */}
        <defs>
          <linearGradient id="faceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.85 0.12 70)" />
            <stop offset="100%" stopColor="oklch(0.75 0.15 65)" />
          </linearGradient>
          <linearGradient id="eyeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.60 0.15 250)" />
            <stop offset="100%" stopColor="oklch(0.50 0.18 250)" />
          </linearGradient>
        </defs>

        {/* Cheeks */}
        <circle cx="25" cy="42" r="6" fill="oklch(0.80 0.10 50)" opacity="0.4" />
        <circle cx="55" cy="42" r="6" fill="oklch(0.80 0.10 50)" opacity="0.4" />

        {/* Eyes */}
        <g>
          {/* Left eye */}
          <ellipse
            cx="30"
            cy="32"
            rx="5"
            ry={blinkState ? "1" : "7"}
            fill="url(#eyeGradient)"
            className="transition-all duration-150"
          />
          {!blinkState && (
            <>
              <circle cx="30" cy="31" r="2.5" fill="white" opacity="0.9" />
              <circle cx="31" cy="32" r="1" fill="white" opacity="0.6" />
            </>
          )}

          {/* Right eye */}
          <ellipse
            cx="50"
            cy="32"
            rx="5"
            ry={blinkState ? "1" : "7"}
            fill="url(#eyeGradient)"
            className="transition-all duration-150"
          />
          {!blinkState && (
            <>
              <circle cx="50" cy="31" r="2.5" fill="white" opacity="0.9" />
              <circle cx="51" cy="32" r="1" fill="white" opacity="0.6" />
            </>
          )}
        </g>

        {/* Mouth */}
        <path
          d={getMouthPath()}
          stroke="oklch(0.60 0.15 250)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          className="transition-all duration-300"
        />

        {/* Speaking animation - mouth movement */}
        {isSpeaking && (
          <ellipse
            cx="40"
            cy="48"
            rx="8"
            ry="6"
            fill="oklch(0.50 0.15 250)"
            opacity="0.3"
            className="animate-pulse"
          />
        )}
      </svg>

      {/* Voice indicator rings */}
      {isSpeaking && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[120%] h-[120%] rounded-full border-2 border-accent/40 animate-ping" />
          <div className="absolute w-[110%] h-[110%] rounded-full border-2 border-accent/30 animate-pulse" />
        </div>
      )}
    </div>
  );
}
