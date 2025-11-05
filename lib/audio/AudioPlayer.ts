"use client";

export class AudioPlayer {
  private ctx: AudioContext | null = null;
  private unlocked = false;
  private queue: AudioBuffer[] = [];
  private playing = false;
  private maxQueue = 200; // cap; drop oldest with a toast
  private onDrop?: (n:number)=>void;

  constructor(onDrop?: (n:number)=>void) {
    this.onDrop = onDrop;
  }

  private getCtx(): AudioContext {
    if (!this.ctx && typeof window !== 'undefined') {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.ctx!;
  }
  async resumeOnUserGesture() {
    console.log('[AudioPlayer] resumeOnUserGesture called, unlocked:', this.unlocked);
    if (this.unlocked) return;
    const ctx = this.getCtx();
    try { await ctx.resume(); } catch {}
    this.unlocked = ctx.state === "running";
    console.log('[AudioPlayer] After resume, state:', ctx.state, 'unlocked:', this.unlocked);
  }
  async enqueueBase64(b64: string) {
    console.log('[AudioPlayer] Enqueuing audio, base64 length:', b64.length, 'ctx state:', this.ctx?.state);
    const ctx = this.getCtx();
    const raw = atob(b64);
    const arr = new Uint8Array(raw.length);
    for (let i=0;i<raw.length;i++) arr[i] = raw.charCodeAt(i);
    try {
      const buf = await ctx.decodeAudioData(arr.buffer.slice(0));
      console.log('[AudioPlayer] Decoded audio, duration:', buf.duration, 's');
      if (this.queue.length >= this.maxQueue) {
        this.queue.shift();
        this.onDrop?.(1);
      }
      this.queue.push(buf);
      console.log('[AudioPlayer] Queue size:', this.queue.length, 'playing:', this.playing);
      if (!this.playing) this.drain();
    } catch (err) {
      console.error('[AudioPlayer] Failed to decode audio:', err);
    }
  }
  private async drain() {
    if (this.playing) return;
    this.playing = true;
    const ctx = this.getCtx();
    while (this.queue.length) {
      const buf = this.queue.shift()!;
      const src = ctx.createBufferSource();
      src.buffer = buf; src.connect(ctx.destination);
      const done = new Promise<void>((res)=> src.onended = ()=> res());
      src.start(0);
      await done;
    }
    this.playing = false;
  }
  stop() { this.queue = []; if (this.ctx) { try{ this.ctx.suspend(); }catch{} } }
}
