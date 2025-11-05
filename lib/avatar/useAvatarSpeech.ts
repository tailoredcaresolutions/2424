"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { type:"start"|"viseme"|"emotion"|"audio"|"done"|"error"; [k:string]:any; };

export function useAvatarSpeech() {
  const base = process.env.NEXT_PUBLIC_SPEECH_WS_URL || 'wss://voice.tailoredcaresolutions.com/ws/speak';
  const tok  = process.env.NEXT_PUBLIC_SPEECH_WS_TOKEN || '';

  const [connected,setConnected]=useState(false);
  const [error,setError]=useState<string|null>(null);
  const wsRef = useRef<WebSocket|null>(null);
  const L = useRef({ onV:(t:number,v:string)=>{}, onE:(s:number,e:number,val:string)=>{}, onA:(m:string,b64:string)=>{} });

  useEffect(()=> {
    if (!base || !tok) {
      console.error('WebSocket environment variables missing:', { base, tok: tok ? 'present' : 'missing' });
      setError("ws_env_missing");
      return;
    }

    // Validate that base starts with wss:// for security
    if (!base.startsWith('wss://') && !base.startsWith('ws://localhost')) {
      console.error('WebSocket URL must use wss:// protocol for security:', base);
      setError("ws_insecure");
      return;
    }

    const url = `${base}?token=${encodeURIComponent(tok)}`;
    console.log('Connecting to WebSocket:', base.replace(/\?token=.*/, '?token=***'));

    const ws = new WebSocket(url);
    wsRef.current = ws;
    ws.onopen  = ()=> setConnected(true);
    ws.onclose = ()=> setConnected(false);
    ws.onerror = ()=> setError("ws_error");
    ws.onmessage = (e)=> {
      try {
        const m = JSON.parse(e.data) as Msg;
        if (m.type==="viseme") L.current.onV(m.t,m.v);
        else if (m.type==="emotion") L.current.onE(m.start,m.end,m.value);
        else if (m.type==="audio") L.current.onA(m.codec||"audio/wav", m.chunk);
        else if (m.type==="error") setError(m.code||"ws_error");
      } catch { /* ignore */ }
    };
    return ()=> { ws.close(); };
  }, [base, tok]);

  return {
    connected, error,
    speak: (text:string)=> {
      console.log('[WebSocket] Sending speak message:', text);
      console.log('[WebSocket] WebSocket state:', wsRef.current?.readyState);
      wsRef.current?.send(JSON.stringify({type:"speak", text}));
    },
    onViseme:(f:(t:number,v:string)=>void)=> { L.current.onV=f; },
    onEmotion:(f:(s:number,e:number,v:string)=>void)=> { L.current.onE=f; },
    onAudio:(f:(m:string,b64:string)=>void)=> { L.current.onA=f; },
  };
}
