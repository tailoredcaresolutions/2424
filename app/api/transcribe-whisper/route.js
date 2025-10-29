// Tailored Care Solutions - PSW Voice Reporting System
// Whisper Transcription API Route
// Local speech-to-text with Metal acceleration

import { NextResponse } from 'next/server';
import whisperClient from '@/lib/audio/whisperClient';
import { isLocalMode } from '@/lib/mocks/mockAI';

/**
 * POST /api/transcribe-whisper
 * 
 * Transcribe audio to text using local Whisper model
 * 
 * Request body:
 * {
 *   audioData: string (base64) | Buffer,
 *   format: 'wav' | 'webm' | 'mp3',
 *   language: 'en' | 'fil' | 'es' | 'pt' | 'hi' | 'bo',
 *   duration: number (optional)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   transcript: string,
 *   confidence: number (0-1),
 *   language: string,
 *   duration: number (seconds),
 *   model: string
 * }
 */
export async function POST(request) {
  const startTime = Date.now();
  
  try {
    // Parse request body
    const body = await request.json();
    const { audioData, format, language, duration } = body;
    
    // Validate input
    if (!audioData) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'audioData is required' 
        },
        { status: 400 }
      );
    }
    
    // Log request (for monitoring)
    console.log('[Transcribe API] Processing audio:', {
      format: format || 'unknown',
      language: language || 'auto',
      duration: duration || 'unknown',
      timestamp: new Date().toISOString()
    });
    
    // Proxy to backend server for Whisper transcription
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

    try {
      const response = await fetch(`${backendUrl}/api/whisper/transcribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioData,
          format,
          language: language || 'en'
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Whisper transcription failed');
      }

      return NextResponse.json(result);
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        fallback: 'browser'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('[Transcribe API] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Transcription failed',
      fallback: 'browser',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * GET /api/transcribe-whisper
 * 
 * Health check for transcription service
 */
export async function GET() {
  try {
    const whisperAvailable = await whisperClient.isAvailable();
    const modelInfo = whisperClient.getModelInfo();
    
    return NextResponse.json({
      status: whisperAvailable ? 'healthy' : 'unavailable',
      service: 'Whisper STT',
      model: modelInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error.message
      },
      { status: 500 }
    );
  }
}
