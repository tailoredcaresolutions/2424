/**
 * AudioPlayer - WebAudio-based queue player for Opus/PCM chunks
 * Handles base64 audio chunks with minimal jitter
 */

export class AudioPlayer {
  private audioContext: AudioContext;
  private queue: AudioBuffer[] = [];
  private isPlaying: boolean = false;
  private nextStartTime: number = 0;
  private gainNode: GainNode;

  constructor() {
    // Create AudioContext (will need user gesture to resume on iOS)
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create gain node for volume control
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
    this.gainNode.gain.value = 1.0;
  }

  /**
   * Resume AudioContext on user gesture (required for iOS/Safari)
   */
  async resumeOnUserGesture(): Promise<void> {
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
      console.log('AudioContext resumed');
    }
  }

  /**
   * Enqueue base64 Opus or PCM audio chunk
   */
  async enqueueBase64Opus(chunkB64: string): Promise<void> {
    try {
      // Decode base64 to ArrayBuffer
      const binaryString = atob(chunkB64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Decode audio data
      const audioBuffer = await this.audioContext.decodeAudioData(bytes.buffer);
      
      // Add to queue
      this.queue.push(audioBuffer);
      
      // Start playback if not already playing
      if (!this.isPlaying) {
        this.startPlayback();
      }
    } catch (error) {
      console.error('Error decoding audio chunk:', error);
    }
  }

  /**
   * Start playing queued audio buffers
   */
  private startPlayback(): void {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const buffer = this.queue.shift()!;
    
    // Create buffer source
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.gainNode);
    
    // Calculate when to start this buffer (for seamless playback)
    const currentTime = this.audioContext.currentTime;
    const startTime = Math.max(currentTime, this.nextStartTime);
    
    // Schedule playback
    source.start(startTime);
    
    // Update next start time for seamless queueing
    this.nextStartTime = startTime + buffer.duration;
    
    // Schedule next buffer when this one ends
    source.onended = () => {
      this.startPlayback();
    };
  }

  /**
   * Stop playback and clear queue
   */
  stop(): void {
    this.queue = [];
    this.isPlaying = false;
    this.nextStartTime = 0;
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get current playback state
   */
  get state(): AudioContextState {
    return this.audioContext.state;
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.stop();
    if (this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}
