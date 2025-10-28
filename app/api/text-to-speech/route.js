import { NextResponse } from 'next/server';
import { textToSpeech } from '@/lib/ai/tts';

export async function POST(request) {
  const { text, language = 'en', voice = 'default', speed = 1.0 } = await request.json();

  try {
    console.log('🎤 Local TTS: Generating speech with Coqui XTTS');

    // Use local Coqui XTTS server
    const audioBlob = await textToSpeech({
      text,
      language,
      voice,
      speed,
    });

    // Convert Blob to ArrayBuffer
    const audioData = await audioBlob.arrayBuffer();
    
    // Return as audio response
    return new NextResponse(audioData, {
      headers: {
        'Content-Type': 'audio/wav', // XTTS returns WAV by default
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('TTS Error:', error);
    return NextResponse.json({ 
      error: 'TTS generation failed',
      message: error.message,
      suggestion: 'Ensure XTTS server is running on localhost:8020'
    }, { status: 500 });
  }
}
