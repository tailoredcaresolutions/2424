import { NextRequest, NextResponse } from 'next/server';

const WHISPER_ASR_URL = process.env.WHISPER_ASR_URL || 'http://127.0.0.1:18886';

export async function POST(request: NextRequest) {
  try {
    const { audioData } = await request.json();

    if (!audioData) {
      return NextResponse.json(
        { success: false, error: 'No audio data provided' },
        { status: 400 }
      );
    }

    // Send audio to Whisper ASR service
    const response = await fetch(`${WHISPER_ASR_URL}/transcribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio: audioData,
        language: 'en',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Whisper ASR error:', errorText);
      return NextResponse.json(
        { success: false, error: 'Transcription service error' },
        { status: 500 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      text: data.text || data.transcription || '',
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
