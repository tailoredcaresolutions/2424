/**
 * Local STT Adapter - Whisper.cpp Integration
 * Runtime: LOCAL ONLY (http://localhost:9000)
 * NEVER use cloud APIs in this file
 */

const WHISPER_URL =
  process.env.LOCAL_WHISPER_URL || 'http://localhost:9000/transcribe';
const REQUEST_TIMEOUT = 30000; // 30 seconds

export interface TranscriptionRequest {
  audio: Blob | File;
  language?: string;
  model?: string;
}

export interface TranscriptionResponse {
  text: string;
  language?: string;
  confidence?: number;
}

/**
 * Transcribe audio using local Whisper.cpp server
 * @throws Error if Whisper server is not running or request fails
 */
export async function transcribe(
  request: TranscriptionRequest
): Promise<string> {
  const formData = new FormData();
  formData.append('file', request.audio);
  if (request.language) {
    formData.append('language', request.language);
  }

  try {
    const response = await fetch(WHISPER_URL, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    });

    if (!response.ok) {
      throw new Error(
        `Whisper API error: ${response.status} ${response.statusText}`
      );
    }

    const data: TranscriptionResponse = await response.json();
    return data.text;
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new Error(
        `Whisper request timeout after ${REQUEST_TIMEOUT / 1000}s. Is Whisper running?`
      );
    }
    throw new Error(
      `Whisper connection failed: ${error instanceof Error ? error.message : 'Unknown error'}. Verify Whisper is running at ${WHISPER_URL}`
    );
  }
}

/**
 * Check if Whisper service is healthy
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(
      WHISPER_URL.replace('/transcribe', '/health'),
      {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}
