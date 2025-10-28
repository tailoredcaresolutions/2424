/**
 * Local TTS Adapter - Coqui XTTS Integration
 * Runtime: LOCAL ONLY (http://localhost:8020)
 * NEVER use cloud APIs in this file
 */

const TTS_URL = process.env.LOCAL_TTS_URL || 'http://localhost:8020/tts';
const REQUEST_TIMEOUT = 45000; // 45 seconds

export interface TTSRequest {
  text: string;
  language?: string;
  voice?: string;
  speed?: number;
}

export interface TTSResponse {
  audio: Blob;
  contentType: string;
}

/**
 * Generate speech using local Coqui XTTS server
 * @throws Error if TTS server is not running or request fails
 */
export async function textToSpeech(request: TTSRequest): Promise<Blob> {
  try {
    const response = await fetch(TTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: request.text,
        language: request.language || 'en',
        speaker: request.voice || 'default',
        speed: request.speed || 1.0,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    });

    if (!response.ok) {
      throw new Error(`TTS API error: ${response.status} ${response.statusText}`);
    }

    const audioBlob = await response.blob();
    return audioBlob;
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new Error(
        `TTS request timeout after ${REQUEST_TIMEOUT / 1000}s. Is XTTS running?`
      );
    }
    throw new Error(
      `TTS connection failed: ${error instanceof Error ? error.message : 'Unknown error'}. Verify XTTS is running at ${TTS_URL}`
    );
  }
}

/**
 * Check if TTS service is healthy
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(TTS_URL.replace('/tts', '/health'), {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
