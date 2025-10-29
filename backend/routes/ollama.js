/**
 * Ollama AI Routes - Local LLM Processing
 * Pure API endpoints - NO UI
 */

import express from 'express';
import ollamaClient from '../lib/ai/ollamaClient.js';

const router = express.Router();

/**
 * POST /api/ollama/chat
 * Chat completion with conversation history
 */
router.post('/chat', async (req, res) => {
  try {
    const { messages, temperature, max_tokens, quality } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        error: 'messages array is required'
      });
    }

    const result = await ollamaClient.chat(messages, {
      temperature: temperature || 0.7,
      max_tokens: max_tokens || 2048,
      quality: quality || 'speed'
    });

    res.json(result);
  } catch (error) {
    console.error('[Ollama Chat] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ollama/generate
 * Simple text generation
 */
router.post('/generate', async (req, res) => {
  try {
    const { prompt, temperature, max_tokens, quality, system } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'prompt is required'
      });
    }

    const result = await ollamaClient.generate(prompt, {
      temperature: temperature || 0.7,
      max_tokens: max_tokens || 2048,
      quality: quality || 'speed',
      system: system
    });

    res.json(result);
  } catch (error) {
    console.error('[Ollama Generate] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/ollama/models
 * List available models
 */
router.get('/models', async (req, res) => {
  try {
    const models = await ollamaClient.listModels();
    const modelInfo = ollamaClient.getModelInfo();

    res.json({
      success: true,
      models: models,
      configured: modelInfo
    });
  } catch (error) {
    console.error('[Ollama Models] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/ollama/health
 * Health check
 */
router.get('/health', async (req, res) => {
  try {
    const available = await ollamaClient.isAvailable();
    const modelInfo = ollamaClient.getModelInfo();

    res.json({
      status: available ? 'healthy' : 'unavailable',
      service: 'Ollama LLM',
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
