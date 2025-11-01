"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AudioPlayer } from "@/lib/audio/AudioPlayer";
import { createVisemeDriver } from "@/lib/avatar/VisemeDriver";
import { useAvatarSpeech } from "@/lib/avatar/useAvatarSpeech";

export default function AvatarLive() {
  const [svg,setSvg] = useState<string>("");
  const [toast,setToast] = useState<string>("");
  const hostRef = useRef<HTMLDivElement>(null);
  const audio = useMemo(()=> new AudioPlayer((n)=> setToast(`Audio buffer full — dropped ${n} frame(s)`)),[]);
  const {connected,error,speak,onViseme,onAudio} = useAvatarSpeech();

  useEffect(()=>{ fetch("/avatar/avatar.svg").then(r=>r.text()).then(setSvg); },[]);
  useEffect(()=>{ onViseme((_t,v)=> { const h=hostRef.current; if (!h) return; createVisemeDriver(h).show(v); }); },[onViseme]);
  useEffect(()=>{ onAudio((_mime,b64)=> audio.enqueueBase64(b64)); },[onAudio]);

  // idle
  useEffect(()=>{ const h=hostRef.current; if (!h) return; const vis=createVisemeDriver(h); vis.idleStart(); return ()=> vis.idleStop(); },[]);

  // simple client-side rate-limit UX: disable for 1s after click
  const [busy,setBusy]=useState(false);
  const say = async (t:string)=> { if (busy) return; setBusy(true); try { await audio.resumeOnUserGesture(); speak(t); } finally { setTimeout(()=>setBusy(false),1000); } };

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Avatar Live</h1>
      <p className="text-sm">WS: {connected? "Connected":"Offline"} {error && <span className="text-red-600 ml-2">{error}</span>}</p>
      <div className="flex gap-3">
        <button onClick={()=> audio.resumeOnUserGesture()} className="px-3 py-2 rounded-lg bg-gray-800 text-white">Enable sound</button>
        <button disabled={busy||!connected} onClick={()=> say("Hello from Tailored Care Solutions.")} className="px-3 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50">
          {busy? "Please wait…":"Speak test"}
        </button>
      </div>
      {toast && <div className="text-xs text-amber-700">{toast}</div>}
      <div ref={hostRef} className="w-[320px] h-auto mt-4" dangerouslySetInnerHTML={{__html: svg}} />
    </main>
  );
}