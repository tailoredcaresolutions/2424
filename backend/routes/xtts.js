/**
 * XTTS Text-to-Speech Routes
 * Pure API endpoints - NO UI
 */

import express from 'express';
import xttsClient from '../lib/audio/xttsClient.js';

const router = express.Router();

/**
 * POST /api/xtts/synthesize
 * Synthesize text to speech
 */
router.post('/synthesize', async (req, res) => {
  try {
    const { text, voice, language, speed } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'text is required and cannot be empty'
      });
    }

    if (text.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Text too long (max 1000 characters)'
      });
    }

    const result = await xttsClient.synthesize(text, {
      voice: voice || 'supportive',
      language: language || 'en',
      speed: speed || 1.0
    });

    res.json(result);
  } catch (error) {
    console.error('[XTTS Synthesize] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      fallback: 'browser'
    });
  }
});

/**
 * GET /api/xtts/voices
 * Get available voice profiles
 */
router.get('/voices', (req, res) => {
  try {
    const voices = xttsClient.getVoiceProfiles();
    res.json({
      success: true,
      voices: voices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/xtts/languages
 * Get supported languages
 */
router.get('/languages', (req, res) => {
  try {
    const languages = xttsClient.getSupportedLanguages();
    res.json({
      success: true,
      languages: languages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/xtts/health
 * Health check
 */
router.get('/health', async (req, res) => {
  try {
    const available = await xttsClient.isAvailable();
    const modelInfo = xttsClient.getModelInfo();

    res.json({
      status: available ? 'healthy' : 'unavailable',
      service: 'XTTS TTS',
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
