/**
 * Whisper Speech-to-Text Routes
 * Pure API endpoints - NO UI
 */

import express from 'express';
import whisperClient from '../lib/audio/whisperClient.js';

const router = express.Router();

/**
 * POST /api/whisper/transcribe
 * Transcribe audio to text
 */
router.post('/transcribe', async (req, res) => {
  try {
    const { audioData, format, language } = req.body;

    if (!audioData) {
      return res.status(400).json({
        success: false,
        error: 'audioData is required'
      });
    }

    // Convert base64 to buffer if needed
    const audioBuffer = typeof audioData === 'string'
      ? Buffer.from(audioData, 'base64')
      : audioData;

    const result = await whisperClient.transcribe(audioBuffer, {
      language: language || 'en'
    });

    res.json(result);
  } catch (error) {
    console.error('[Whisper Transcribe] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      fallback: 'browser'
    });
  }
});

/**
 * GET /api/whisper/health
 * Health check
 */
router.get('/health', async (req, res) => {
  try {
    const available = await whisperClient.isAvailable();
    const modelInfo = whisperClient.getModelInfo();

    res.json({
      status: available ? 'healthy' : 'unavailable',
      service: 'Whisper STT',
      available: available,
      model: modelInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

export default router;
