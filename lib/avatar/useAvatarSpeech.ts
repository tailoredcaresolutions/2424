'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * WebSocket message types
 */
interface WSMessage {
  type: 'start' | 'viseme' | 'audio' | 'emotion' | 'done' | 'error' | 'speak';
  id?: string;
  t?: number; // timestamp for viseme
  v?: string; // viseme value
  codec?: string; // audio codec
  chunk?: string; // base64 audio chunk
  start?: number; // emotion start time
  end?: number; // emotion end time
  value?: string; // emotion value
  text?: string; // text to speak
  error?: string;
}

/**
 * Hook for managing avatar speech WebSocket connection
 */
export function useAvatarSpeech() {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Callbacks storage
  const onVisemeCallbacks = useRef<((time: number, viseme: string) => void)[]>([]);
  const onAudioCallbacks = useRef<((codec: string, chunk: string) => void)[]>([]);
  const onEmotionCallbacks = useRef<((start: number, end: number, value: string) => void)[]>([]);
  
  // Get WebSocket URL from environment
  const wsUrl = process.env.NEXT_PUBLIC_SPEECH_WS_URL || '';
  
  /**
   * Connect to WebSocket
   */
  const connect = useCallback(() => {
    if (!wsUrl) {
      setError('WebSocket URL not configured');
      return;
    }
    
    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    try {
      console.log('Connecting to speech WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log('Speech WebSocket connected');
        setConnected(true);
        setError(null);
        
        // Clear reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };
      
      ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'start':
              console.log('Speech started:', message.id);
              break;
              
            case 'viseme':
              if (message.t !== undefined && message.v) {
                onVisemeCallbacks.current.forEach(cb => cb(message.t!, message.v!));
              }
              break;
              
            case 'audio':
              if (message.codec && message.chunk) {
                onAudioCallbacks.current.forEach(cb => cb(message.codec!, message.chunk!));
              }
              break;
              
            case 'emotion':
              if (message.start !== undefined && message.end !== undefined && message.value) {
                onEmotionCallbacks.current.forEach(cb => 
                  cb(message.start!, message.end!, message.value!)
                );
              }
              break;
              
            case 'done':
              console.log('Speech completed:', message.id);
              break;
              
            case 'error':
              console.error('Speech error:', message.error);
              setError(message.error || 'Unknown speech error');
              break;
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };
      
      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('WebSocket connection error');
      };
      
      ws.onclose = () => {
        console.log('Speech WebSocket disconnected');
        setConnected(false);
        wsRef.current = null;
        
        // Attempt reconnect after delay
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, 5000);
        }
      };
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setError('Failed to connect to speech service');
    }
  }, [wsUrl]);
  
  /**
   * Send speak command
   */
  const speak = useCallback((text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected, cannot speak');
      return;
    }
    
    const message: WSMessage = {
      type: 'speak',
      text
    };
    
    wsRef.current.send(JSON.stringify(message));
  }, []);
  
  /**
   * Register viseme callback
   */
  const onViseme = useCallback((callback: (time: number, viseme: string) => void) => {
    onVisemeCallbacks.current.push(callback);
    
    // Return cleanup function
    return () => {
      const index = onVisemeCallbacks.current.indexOf(callback);
      if (index > -1) {
        onVisemeCallbacks.current.splice(index, 1);
      }
    };
  }, []);
  
  /**
   * Register audio callback
   */
  const onAudio = useCallback((callback: (codec: string, chunk: string) => void) => {
    onAudioCallbacks.current.push(callback);
    
    // Return cleanup function
    return () => {
      const index = onAudioCallbacks.current.indexOf(callback);
      if (index > -1) {
        onAudioCallbacks.current.splice(index, 1);
      }
    };
  }, []);
  
  /**
   * Register emotion callback
   */
  const onEmotion = useCallback((callback: (start: number, end: number, value: string) => void) => {
    onEmotionCallbacks.current.push(callback);
    
    // Return cleanup function
    return () => {
      const index = onEmotionCallbacks.current.indexOf(callback);
      if (index > -1) {
        onEmotionCallbacks.current.splice(index, 1);
      }
    };
  }, []);
  
  // Connect on mount
  useEffect(() => {
    connect();
    
    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      onVisemeCallbacks.current = [];
      onAudioCallbacks.current = [];
      onEmotionCallbacks.current = [];
    };
  }, [connect]);
  
  return {
    connected,
    error,
    speak,
    onViseme,
    onAudio,
    onEmotion
  };
}
