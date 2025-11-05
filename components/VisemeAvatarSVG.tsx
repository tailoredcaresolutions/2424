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
  seq?: number;     // sequence number
  sessionId?: string; // session ID
}

interface WSEvent {
  type: "connected" | "resumed" | "start" | "viseme" | "audio" | "emotion" | "done" | "end" | "ping" | "pong" | "error";
  seq?: number;
  sessionId?: string;
  t?: number;
  [key: string]: any;
}

interface AudioEvent {
  type: "audio";
  t: number;
  mime: string;
  chunk: string; // base64 encoded audio
  seq?: number;
  sessionId?: string;
}

interface AVSyncConfig {
  jitterBuffer: number;  // Target buffer size in ms (60ms)
  skewClamp: number;     // Max allowed skew in ms (±80ms)
  skewTarget: number;    // Target skew in ms (40ms)
  maxLatency: number;    // Max acceptable latency (200ms)
}

export default function VisemeAvatarSVG({
  wsUrl = process.env.NEXT_PUBLIC_VOICE_WS_URL || "wss://voice.tailoredcaresolutions.com/ws/speak",
  wsToken = process.env.NEXT_PUBLIC_VOICE_WS_TOKEN,
  size = "lg",
  autoConnect = false,
}: VisemeAvatarSVGProps) {
  const [currentViseme, setCurrentViseme] = useState<VisemeType>("rest");
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [eventCount, setEventCount] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lastSeq, setLastSeq] = useState<number>(-1);
  const [gapCount, setGapCount] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [audioLatency, setAudioLatency] = useState<number>(0);
  const [avSkew, setAvSkew] = useState<number>(0);

  const wsRef = useRef<WebSocket | null>(null);
  const controls = useAnimationControls();
  const visemeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const pingIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Audio player refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<Array<{t: number, buffer: AudioBuffer}>>([]);
  const playbackStartTimeRef = useRef<number>(0);
  const speechStartTimeRef = useRef<number>(0);
  const avSyncConfigRef = useRef<AVSyncConfig>({
    jitterBuffer: 60,
    skewClamp: 80,
    skewTarget: 40,
    maxLatency: 200
  });

  const sizeClasses = {
    sm: "w-32 h-32",
    md: "w-48 h-48",
    lg: "w-64 h-64",
    xl: "w-80 h-80",
  };

  // Initialize Web Audio API
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log("[AudioPlayer] AudioContext initialized");
    }
    return audioContextRef.current;
  }, []);

  // Decode base64 audio chunk and add to queue
  const decodeAndQueueAudio = useCallback(async (audioEvent: AudioEvent) => {
    try {
      const audioCtx = initAudioContext();

      // Decode base64 to ArrayBuffer
      const binaryString = atob(audioEvent.chunk);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Decode audio data
      const audioBuffer = await audioCtx.decodeAudioData(bytes.buffer);

      // Add to queue with timestamp
      audioQueueRef.current.push({
        t: audioEvent.t,
        buffer: audioBuffer
      });

      console.log(`[AudioPlayer] Queued audio chunk at t=${audioEvent.t}ms, queue size: ${audioQueueRef.current.length}`);
    } catch (e) {
      console.error("[AudioPlayer] Failed to decode audio:", e);
    }
  }, [initAudioContext]);

  // Process audio queue with jitter buffer and A/V sync
  const processAudioQueue = useCallback(() => {
    if (audioQueueRef.current.length === 0) return;
    if (!audioContextRef.current) return;

    const now = Date.now();
    const config = avSyncConfigRef.current;

    // Calculate playback time with jitter buffer
    const targetPlaybackTime = speechStartTimeRef.current + config.jitterBuffer;

    // Process chunks that are ready to play
    const readyChunks = audioQueueRef.current.filter(chunk => {
      const chunkTime = speechStartTimeRef.current + chunk.t;
      return chunkTime <= now;
    });

    readyChunks.forEach(chunk => {
      const audioCtx = audioContextRef.current!;
      const source = audioCtx.createBufferSource();
      source.buffer = chunk.buffer;
      source.connect(audioCtx.destination);

      // Calculate when to play this chunk
      const playAt = Math.max(audioCtx.currentTime, (chunk.t + config.jitterBuffer) / 1000);
      source.start(playAt);

      // Calculate A/V skew
      const expectedTime = chunk.t;
      const actualTime = (audioCtx.currentTime * 1000) - speechStartTimeRef.current;
      const skew = actualTime - expectedTime;

      // Clamp skew and update state
      const clampedSkew = Math.max(-config.skewClamp, Math.min(config.skewClamp, skew));
      setAvSkew(clampedSkew);

      console.log(`[AudioPlayer] Playing chunk at t=${chunk.t}ms, skew=${skew.toFixed(1)}ms`);
    });

    // Remove played chunks from queue
    audioQueueRef.current = audioQueueRef.current.filter(chunk =>
      !readyChunks.includes(chunk)
    );
  }, []);

  // Calculate and apply A/V skew compensation
  const calculateAVSkew = useCallback((visemeTime: number): number => {
    if (!audioContextRef.current || audioQueueRef.current.length === 0) {
      return visemeTime; // No compensation needed
    }

    const config = avSyncConfigRef.current;
    const currentAudioTime = (audioContextRef.current.currentTime * 1000) - speechStartTimeRef.current;
    const skew = currentAudioTime - visemeTime;

    // Apply skew compensation if within acceptable range
    if (Math.abs(skew) <= config.skewClamp) {
      if (Math.abs(skew) > config.skewTarget) {
        // Gradually compensate towards target
        const compensation = skew * 0.3; // 30% correction per frame
        return visemeTime + compensation;
      }
    }

    return visemeTime;
  }, []);

  // Connect to WebSocket with resume support
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    // Build URL with token and resume parameters
    const params = new URLSearchParams();
    if (wsToken) params.append("token", wsToken);
    if (sessionId && lastSeq >= 0) {
      params.append("resumeSession", sessionId);
      params.append("lastSeq", lastSeq.toString());
      setIsReconnecting(true);
    }
    const finalUrl = `${wsUrl}${params.toString() ? '?' + params.toString() : ''}`;

    try {
      const ws = new WebSocket(finalUrl);

      ws.onopen = () => {
        setIsConnected(true);
        setIsReconnecting(false);
        console.log("[VisemeAvatar] WebSocket connected");

        // Start client-side ping interval (respond to server pings)
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            // Respond to heartbeat (optional, server tracks pong automatically)
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        try {
          const data: WSEvent = JSON.parse(event.data);
          setEventCount(prev => prev + 1);

          // Track sequence numbers for gap detection
          if (data.seq !== undefined) {
            if (lastSeq >= 0 && data.seq !== lastSeq + 1) {
              const gap = data.seq - lastSeq - 1;
              console.warn(`[VisemeAvatar] Gap detected: ${gap} events missing (expected ${lastSeq + 1}, got ${data.seq})`);
              setGapCount(prev => prev + gap);
            }
            setLastSeq(data.seq);
          }

          // Store session ID from first event
          if (data.sessionId && !sessionId) {
            setSessionId(data.sessionId);
            console.log(`[VisemeAvatar] Session ID: ${data.sessionId}`);
          }

          switch (data.type) {
            case "connected":
              console.log("[VisemeAvatar] New session started");
              break;

            case "resumed":
              console.log("[VisemeAvatar] Session resumed successfully");
              break;

            case "ping":
              // Respond to server ping
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: "pong", t: Date.now() }));
              }
              break;

            case "error":
              console.error("[VisemeAvatar] Server error:", data.message || data.code);
              break;

            case "start":
              setIsSpeaking(true);
              setCurrentViseme("rest");

              // Initialize audio playback
              speechStartTimeRef.current = Date.now();
              audioQueueRef.current = [];
              initAudioContext();

              // Update A/V sync config if provided
              if (data.config) {
                avSyncConfigRef.current = {
                  jitterBuffer: data.config.jitterBuffer || 60,
                  skewClamp: data.config.skewClamp || 80,
                  skewTarget: data.config.skewTarget || 40,
                  maxLatency: data.config.maxLatency || 200
                };
              }
              break;

            case "audio":
              // Queue audio chunk for playback
              const audioEvent = data as AudioEvent;
              decodeAndQueueAudio(audioEvent);
              processAudioQueue();
              break;

            case "viseme":
              const visemeEvent = data as VisemeEvent;

              // Apply A/V skew compensation to viseme timing
              const compensatedHold = visemeEvent.hold
                ? calculateAVSkew(visemeEvent.hold)
                : undefined;

              setCurrentViseme(visemeEvent.v);

              // Auto-reset to rest after hold duration
              if (visemeTimeoutRef.current) {
                clearTimeout(visemeTimeoutRef.current);
              }
              if (compensatedHold) {
                visemeTimeoutRef.current = setTimeout(() => {
                  setCurrentViseme("rest");
                }, compensatedHold);
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

        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }

        // Auto-reconnect after 3 seconds if we have a session
        if (sessionId && lastSeq >= 0) {
          console.log("[VisemeAvatar] Scheduling reconnect in 3s...");
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 3000);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("[VisemeAvatar] Connection failed:", error);
      setIsConnected(false);
      setIsReconnecting(false);
    }
  }, [wsUrl, wsToken, sessionId, lastSeq]);

  // Disconnect
  const disconnect = useCallback(() => {
    // Clear all timers
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsReconnecting(false);
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
      <div className="absolute top-0 right-0 z-20 flex flex-col gap-1 items-end">
        <div className="flex gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            isReconnecting
              ? "bg-yellow-100 text-yellow-700"
              : isConnected
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}>
            {isReconnecting ? "🔄 Reconnecting" : isConnected ? "🟢 Connected" : "⚪ Disconnected"}
          </span>
          {eventCount > 0 && (
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
              {eventCount} events
            </span>
          )}
        </div>
        {sessionId && (
          <span className="px-2 py-1 rounded-full text-xs font-mono bg-indigo-100 text-indigo-700">
            Seq: {lastSeq}
          </span>
        )}
        {gapCount > 0 && (
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
            ⚠️ {gapCount} gaps
          </span>
        )}
        {isSpeaking && audioQueueRef.current.length > 0 && (
          <span className="px-2 py-1 rounded-full text-xs font-mono bg-teal-100 text-teal-700">
            🎵 Queue: {audioQueueRef.current.length}
          </span>
        )}
        {Math.abs(avSkew) > 10 && (
          <span className={`px-2 py-1 rounded-full text-xs font-mono ${
            Math.abs(avSkew) > 50
              ? "bg-orange-100 text-orange-700"
              : "bg-yellow-100 text-yellow-700"
          }`}>
            ⏱️ Skew: {avSkew.toFixed(0)}ms
          </span>
        )}
      </div>

      {/* Debug: Current Viseme */}
      <div className="absolute top-20 right-0 z-20">
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
