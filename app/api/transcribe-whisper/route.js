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
    
    // Convert base64 to buffer if needed
    const audioBuffer = typeof audioData === 'string' 
      ? Buffer.from(audioData, 'base64')
      : audioData;
    
    // Check if Whisper is available
    const whisperAvailable = await whisperClient.isAvailable();
    
    if (!whisperAvailable && !isLocalMode) {
      // Fall back to browser Web Speech API
      return NextResponse.json({
        success: false,
        error: 'Whisper not available',
        fallback: 'browser',
        message: 'Please use browser Web Speech API'
      });
    }
    
    // Transcribe audio using Whisper
    const result = await whisperClient.transcribe(audioBuffer, {
      language: language || 'en'
    });
    
    // Calculate API overhead
    const apiDuration = (Date.now() - startTime) / 1000;
    
    // Log result
    console.log('[Transcribe API] Success:', {
      transcriptLength: result.transcript?.length || 0,
      confidence: result.confidence,
      duration: result.duration,
      apiOverhead: apiDuration - (result.duration || 0),
      model: result.model
    });
    
    // Return result
    return NextResponse.json({
      success: result.success,
      transcript: result.transcript || '',
      segments: result.segments || [],
      confidence: result.confidence || 0,
      language: result.language || language || 'en',
      duration: result.duration || 0,
      model: result.model || 'whisper-small',
      timestamp: result.timestamp
    });
    
  } catch (error) {
    console.error('[Transcribe API] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Transcription failed',
        fallback: 'browser',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
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
