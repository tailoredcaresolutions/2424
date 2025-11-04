"use client";

import { motion, useAnimationControls, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";

interface VisemeAvatarSVGProps {
  wsUrl?: string;
  wsToken?: string;
  size?: "sm" | "md" | "lg" | "xl";
  autoConnect?: boolean;
}

type VisemeType = "MBP" | "AI" | "E" | "O" | "U" | "FV" | "L" | "rest";

// Map viseme groups to SVG files
const VISEME_SVG_MAP: Record<VisemeType, string> = {
  "MBP": "/avatar-speaking-1.svg",    // M, B, P - lips closed
  "AI": "/avatar-speaking-2.svg",     // AH, AY, EY - open mouth
  "E": "/avatar-happy.svg",           // EH, AE - smile/wide
  "O": "/avatar-speaking-3.svg",      // OH, AO, OW - rounded
  "U": "/avatar-surprised.svg",       // UW, UH - small opening
  "FV": "/avatar-speaking-1.svg",     // F, V - teeth on lip
  "L": "/avatar-speaking-2.svg",      // L - tongue visible
  "rest": "/avatar-neutral.svg",      // Silence/rest
};

interface VisemeEvent {
  type: "viseme";
  t: number;        // timestamp in ms
  v: VisemeType;    // viseme group
  hold?: number;    // hold duration in ms
}

interface WSEvent {
  type: "start" | "viseme" | "audio" | "emotion" | "done" | "end";
  [key: string]: any;
}

export default function VisemeAvatarSVG({
  wsUrl = "wss://voice.tailoredcaresolutions.com/ws/speak",
  wsToken,
  size = "lg",
  autoConnect = false,
}: VisemeAvatarSVGProps) {
  const [currentViseme, setCurrentViseme] = useState<VisemeType>("rest");
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [eventCount, setEventCount] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const controls = useAnimationControls();
  const visemeTimeoutRef = useRef<NodeJS.Timeout>();

  const sizeClasses = {
    sm: "w-32 h-32",
    md: "w-48 h-48",
    lg: "w-64 h-64",
    xl: "w-80 h-80",
  };

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const finalUrl = wsToken ? `${wsUrl}?token=${wsToken}` : wsUrl;

    try {
      const ws = new WebSocket(finalUrl);

      ws.onopen = () => {
        setIsConnected(true);
        console.log("[VisemeAvatar] WebSocket connected");
      };

      ws.onmessage = (event) => {
        try {
          const data: WSEvent = JSON.parse(event.data);
          setEventCount(prev => prev + 1);

          switch (data.type) {
            case "start":
              setIsSpeaking(true);
              setCurrentViseme("rest");
              break;

            case "viseme":
              const visemeEvent = data as VisemeEvent;
              setCurrentViseme(visemeEvent.v);

              // Auto-reset to rest after hold duration
              if (visemeTimeoutRef.current) {
                clearTimeout(visemeTimeoutRef.current);
              }
              if (visemeEvent.hold) {
                visemeTimeoutRef.current = setTimeout(() => {
                  setCurrentViseme("rest");
                }, visemeEvent.hold);
              }
              break;

            case "done":
            case "end":
              setIsSpeaking(false);
              setCurrentViseme("rest");
              if (visemeTimeoutRef.current) {
                clearTimeout(visemeTimeoutRef.current);
              }
              break;
          }
        } catch (e) {
          console.error("[VisemeAvatar] Failed to parse event:", e);
        }
      };

      ws.onerror = (error) => {
        console.error("[VisemeAvatar] WebSocket error:", error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsSpeaking(false);
        setCurrentViseme("rest");
        console.log("[VisemeAvatar] WebSocket disconnected");
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("[VisemeAvatar] Connection failed:", error);
    }
  }, [wsUrl, wsToken]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
      if (visemeTimeoutRef.current) {
        clearTimeout(visemeTimeoutRef.current);
      }
    };
  }, [autoConnect, connect, disconnect]);

  // Idle breathing animation
  useEffect(() => {
    if (!isSpeaking) {
      const breathingAnimation = async () => {
        while (!isSpeaking) {
          await controls.start({
            scale: 1.01,
            y: -1,
            transition: { duration: 3, ease: "easeInOut" },
          });
          await controls.start({
            scale: 1.0,
            y: 0,
            transition: { duration: 3.5, ease: "easeInOut" },
          });
        }
      };
      breathingAnimation();
    }
  }, [isSpeaking, controls]);

  // Speaking animation
  useEffect(() => {
    if (isSpeaking) {
      const speakAnimation = async () => {
        while (isSpeaking) {
          await controls.start({
            scale: 1.03,
            y: -2,
            transition: { duration: 0.3, ease: "easeOut" },
          });
          await controls.start({
            scale: 1.0,
            y: 0,
            transition: { duration: 0.25, ease: "easeIn" },
          });
        }
      };
      speakAnimation();
    }
  }, [isSpeaking, controls]);

  const currentSVG = VISEME_SVG_MAP[currentViseme];

  return (
    <div className={`relative ${sizeClasses[size]} flex flex-col items-center justify-center gap-4`}>
      {/* Connection Status Badge */}
      <div className="absolute top-0 right-0 z-20 flex gap-2">
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          isConnected
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-500"
        }`}>
          {isConnected ? "🟢 Connected" : "⚪ Disconnected"}
        </span>
        {eventCount > 0 && (
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
            {eventCount} events
          </span>
        )}
      </div>

      {/* Debug: Current Viseme */}
      <div className="absolute top-8 right-0 z-20">
        <span className="px-2 py-1 rounded-full text-xs font-mono bg-purple-100 text-purple-700">
          {currentViseme}
        </span>
      </div>

      {/* Glow effect when speaking */}
      <AnimatePresence>
        {isSpeaking && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.1, 0.2, 0.1],
              scale: [1, 1.2, 1],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              background: "radial-gradient(circle, rgba(201, 160, 99, 0.3) 0%, transparent 70%)",
              filter: "blur(30px)",
            }}
          />
        )}
      </AnimatePresence>

      {/* SVG Avatar with smooth transitions */}
      <motion.div
        className="relative z-10"
        animate={controls}
        style={{ willChange: "transform" }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSVG}
            src={currentSVG}
            alt={`Avatar - ${currentViseme}`}
            className="w-full h-full object-contain"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
          />
        </AnimatePresence>
      </motion.div>

      {/* Voice indicator rings when speaking */}
      <AnimatePresence>
        {isSpeaking && (
          <>
            {[1.3, 1.2, 1.1].map((scale, index) => (
              <motion.div
                key={index}
                className="absolute rounded-full border-2"
                style={{
                  width: `${scale * 100}%`,
                  height: `${scale * 100}%`,
                  borderColor: `rgba(201, 160, 99, ${0.2 - index * 0.05})`,
                }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Control Buttons */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 z-20">
        {!isConnected ? (
          <button
            onClick={connect}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Connect
          </button>
        ) : (
          <button
            onClick={disconnect}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Disconnect
          </button>
        )}
      </div>
    </div>
  );
}
