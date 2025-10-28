import { NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai/llm';

export async function POST(request) {
  const { report, sourceLang } = await request.json();

  if (sourceLang === 'en') {
    return NextResponse.json({ translatedReport: report });
  }

  try {
    console.log('🌐 Local LLM: Translating report with Ollama');

    // Use local Ollama for translation
    const translatedReport = await chatCompletion({
      model: process.env.OLLAMA_PRIMARY_MODEL || 'llama3.3:70b',
      messages: [
        { 
          role: 'system', 
          content: 'You are a professional translator for healthcare documentation. Translate the following report to English, maintaining all formatting and professional terminology.' 
        },
        { role: 'user', content: report }
      ],
      temperature: 0.3,
    });

    return NextResponse.json({ translatedReport });

  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ 
      translatedReport: report,
      error: 'Translation failed',
      message: error.message,
      suggestion: 'Ensure Ollama is running on localhost:11434'
    });
  }
}
