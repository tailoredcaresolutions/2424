// Tailored Care Solutions - PSW Voice Reporting System
// XTTS Speech Synthesis API Route
// Local text-to-speech with Metal acceleration

import { NextResponse } from 'next/server';
import xttsClient from '@/lib/audio/xttsClient';
import { isLocalMode } from '@/lib/mocks/mockAI';

/**
 * POST /api/synthesize-xtts
 * 
 * Synthesize text to speech using local XTTS model
 * 
 * Request body:
 * {
 *   text: string,
 *   voice: 'supportive' | 'encouraging' | 'clarifying',
 *   language: 'en' | 'fil' | 'es' | 'pt' | 'hi' | 'bo',
 *   speed: number (0.5-2.0, optional)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   audioData: string (base64),
 *   format: 'wav',
 *   duration: number (seconds),
 *   synthesisTime: number (seconds),
 *   voice: string
 * }
 */
export async function POST(request) {
  const startTime = Date.now();
  
  try {
    // Parse request body
    const body = await request.json();
    const { text, voice, language, speed } = body;
    
    // Validate input
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'text is required and cannot be empty' 
        },
        { status: 400 }
      );
    }
    
    // Validate text length (max 1000 characters for performance)
    if (text.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Text too long (max 1000 characters)'
        },
        { status: 400 }
      );
    }
    
    // Log request (for monitoring)
    console.log('[Synthesize API] Processing text:', {
      textLength: text.length,
      voice: voice || 'supportive',
      language: language || 'en',
      timestamp: new Date().toISOString()
    });
    
    // Check if XTTS is available
    const xttsAvailable = await xttsClient.isAvailable();
    
    if (!xttsAvailable && !isLocalMode) {
      // Fall back to browser Speech Synthesis API
      return NextResponse.json({
        success: false,
        error: 'XTTS not available',
        fallback: 'browser',
        message: 'Please use browser Speech Synthesis API'
      });
    }
    
    // Synthesize speech using XTTS
    const result = await xttsClient.synthesize(text, {
      voice: voice || 'supportive',
      language: language || 'en',
      speed: speed || 1.0
    });
    
    // Calculate API overhead
    const apiDuration = (Date.now() - startTime) / 1000;
    
    // Log result
    console.log('[Synthesize API] Success:', {
      textLength: text.length,
      audioDuration: result.duration,
      synthesisTime: result.synthesisTime,
      apiOverhead: apiDuration - (result.synthesisTime || 0),
      voice: result.voice
    });
    
    // Return result
    return NextResponse.json({
      success: result.success,
      audioData: result.audioData || '',
      format: result.format || 'wav',
      sampleRate: result.sampleRate || 24000,
      duration: result.duration || 0,
      synthesisTime: result.synthesisTime || 0,
      voice: result.voice || voice || 'supportive',
      text: result.text,
      timestamp: result.timestamp
    });
    
  } catch (error) {
    console.error('[Synthesize API] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Synthesis failed',
        fallback: 'browser',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/synthesize-xtts
 * 
 * Health check for synthesis service
 */
export async function GET() {
  try {
    const xttsAvailable = await xttsClient.isAvailable();
    const modelInfo = xttsClient.getModelInfo();
    const voiceProfiles = xttsClient.getVoiceProfiles();
    const languages = xttsClient.getSupportedLanguages();
    
    return NextResponse.json({
      status: xttsAvailable ? 'healthy' : 'unavailable',
      service: 'XTTS TTS',
      model: modelInfo,
      voices: voiceProfiles.length,
      languages: languages.length,
      supportedVoices: voiceProfiles.map(v => v.name),
      supportedLanguages: languages.map(l => ({ code: l.code, name: l.name })),
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
