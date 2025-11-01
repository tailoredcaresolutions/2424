"use client";

export class AudioPlayer {
  private ctx: AudioContext;
  private unlocked = false;
  private queue: AudioBuffer[] = [];
  private playing = false;
  private maxQueue = 200; // cap; drop oldest with a toast
  private onDrop?: (n:number)=>void;

  constructor(onDrop?: (n:number)=>void) {
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.onDrop = onDrop;
  }
  async resumeOnUserGesture() {
    if (this.unlocked) return;
    try { await this.ctx.resume(); } catch {}
    this.unlocked = this.ctx.state === "running";
  }
  async enqueueBase64(b64: string) {
    const raw = atob(b64);
    const arr = new Uint8Array(raw.length);
    for (let i=0;i<raw.length;i++) arr[i] = raw.charCodeAt(i);
    const buf = await this.ctx.decodeAudioData(arr.buffer.slice(0));
    if (this.queue.length >= this.maxQueue) {
      this.queue.shift();
      this.onDrop?.(1);
    }
    this.queue.push(buf);
    if (!this.playing) this.drain();
  }
  private async drain() {
    if (this.playing) return;
    this.playing = true;
    while (this.queue.length) {
      const buf = this.queue.shift()!;
      const src = this.ctx.createBufferSource();
      src.buffer = buf; src.connect(this.ctx.destination);
      const done = new Promise<void>((res)=> src.onended = ()=> res());
      src.start(0);
      await done;
    }
    this.playing = false;
  }
  stop() { this.queue = []; try{ this.ctx.suspend(); }catch{} }
}
