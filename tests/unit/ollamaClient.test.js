// Tailored Care Solutions - PSW Voice Reporting System
// Unit Tests for OllamaClient
// Test local LLM management with Qwen3 models

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OllamaClient, createOllamaClient, isOllamaConfigured } from '@/lib/ai/ollamaClient';

// Mock fetch globally
global.fetch = vi.fn();

describe('OllamaClient', () => {
  let client;
  
  beforeEach(() => {
    // Reset environment variables
    process.env.OLLAMA_HOST = 'http://localhost:11434';
    process.env.OLLAMA_PRIMARY_MODEL = 'qwen2.5:14b-instruct-q4_K_M';
    process.env.OLLAMA_QUALITY_MODEL = 'qwen2.5:30b-instruct-q4_K_M';
    process.env.OLLAMA_MAX_QUALITY_MODEL = 'qwen2.5:72b-instruct-q4_K_M';
    
    // Create new client instance
    client = new OllamaClient();
    
    // Clear all mocks
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with environment variables', () => {
      expect(client.host).toBe('http://localhost:11434');
      expect(client.models.primary).toBe('qwen2.5:14b-instruct-q4_K_M');
      expect(client.models.quality).toBe('qwen2.5:30b-instruct-q4_K_M');
      expect(client.models.max).toBe('qwen2.5:72b-instruct-q4_K_M');
    });

    it('should fall back to defaults when env vars missing', () => {
      delete process.env.OLLAMA_HOST;
      delete process.env.OLLAMA_PRIMARY_MODEL;
      
      const defaultClient = new OllamaClient();
      
      expect(defaultClient.host).toBe('http://localhost:11434');
      expect(defaultClient.models.primary).toBe('qwen2.5:14b-instruct-q4_K_M');
    });

    it('should accept custom options', () => {
      const customClient = new OllamaClient({ 
        host: 'http://custom-host:8080',
        primaryModel: 'custom-model'
      });
      
      expect(customClient.host).toBe('http://custom-host:8080');
      expect(customClient.models.primary).toBe('custom-model');
    });
  });

  describe('_selectModel()', () => {
    it('should select primary model for speed quality', () => {
      const model = client._selectModel('speed');
      expect(model).toBe('qwen2.5:14b-instruct-q4_K_M');
    });

    it('should select quality model for balanced quality', () => {
      const model = client._selectModel('balanced');
      expect(model).toBe('qwen2.5:30b-instruct-q4_K_M');
    });

    it('should select max model for max quality', () => {
      const model = client._selectModel('max');
      expect(model).toBe('qwen2.5:72b-instruct-q4_K_M');
    });

    it('should default to primary model for unknown quality', () => {
      const model = client._selectModel('unknown');
      expect(model).toBe('qwen2.5:14b-instruct-q4_K_M');
    });
  });

  describe('generate()', () => {
    it('should generate response successfully', async () => {
      const mockResponse = {
        model: 'qwen2.5:14b-instruct-q4_K_M',
        response: 'This is a test response.',
        done: true,
        total_duration: 1500000000, // 1.5 seconds in nanoseconds
        eval_count: 50,
        eval_duration: 1500000000 // 1.5 seconds for token generation
      };

      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const prompt = 'What is the PSW scope of practice?';
      const result = await client.generate(prompt, { quality: 'speed' });

      expect(result.success).toBe(true);
      expect(result.response).toBe('This is a test response.');
      expect(result.model).toBe('qwen2.5:14b-instruct-q4_K_M');
      expect(result.duration).toBe(1.5);
      expect(result.tokensPerSecond).toBeGreaterThan(0);
    });

    it('should handle API errors gracefully', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const result = await client.generate('Test prompt');

      expect(result.success).toBe(false);
      expect(result.error).toContain('500');
    });

    it('should handle network errors', async () => {
      fetch.mockRejectedValue(new Error('Network error'));

      const result = await client.generate('Test prompt');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });

    it('should use balanced quality model when specified', async () => {
      const mockResponse = {
        model: 'qwen2.5:30b-instruct-q4_K_M',
        response: 'High quality response.',
        done: true,
        total_duration: 2500000000, // 2.5 seconds
        eval_count: 75
      };

      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await client.generate('Generate report', { quality: 'balanced' });

      expect(result.success).toBe(true);
      expect(result.model).toBe('qwen2.5:30b-instruct-q4_K_M');
    });
  });

  describe('chat()', () => {
    it('should process chat messages successfully', async () => {
      const mockResponse = {
        model: 'qwen2.5:14b-instruct-q4_K_M',
        message: {
          role: 'assistant',
          content: 'I understand. PSWs observe and document.'
        },
        done: true,
        total_duration: 1500000000,
        eval_count: 45
      };

      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const messages = [
        { role: 'system', content: 'You are a PSW assistant.' },
        { role: 'user', content: 'What can PSWs document?' }
      ];

      const result = await client.chat(messages, { quality: 'speed' });

      expect(result.success).toBe(true);
      expect(result.message.content).toBe('I understand. PSWs observe and document.');
      expect(result.message.role).toBe('assistant');
      expect(result.model).toBe('qwen2.5:14b-instruct-q4_K_M');
    });

    it('should handle empty messages array', async () => {
      const result = await client.chat([]);

      expect(result.success).toBe(false);
      expect(result.error).toContain('messages');
    });

    it('should use quality model for final reports', async () => {
      const mockResponse = {
        model: 'qwen2.5:30b-instruct-q4_K_M',
        message: {
          role: 'assistant',
          content: 'Detailed professional report...'
        },
        done: true,
        total_duration: 2500000000,
        eval_count: 100
      };

      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const messages = [
        { role: 'user', content: 'Generate final shift report' }
      ];

      const result = await client.chat(messages, { quality: 'balanced' });

      expect(result.success).toBe(true);
      expect(result.model).toBe('qwen2.5:30b-instruct-q4_K_M');
    });
  });

  describe('isAvailable()', () => {
    it('should return true when Ollama is running', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ version: '0.1.0' })
      });

      const available = await client.isAvailable();

      expect(available).toBe(true);
    });

    it('should return false when Ollama is not running', async () => {
      fetch.mockRejectedValue(new Error('Connection refused'));

      const available = await client.isAvailable();

      expect(available).toBe(false);
    });
  });

  describe('listModels()', () => {
    it('should list installed models', async () => {
      const mockModels = {
        models: [
          { name: 'qwen2.5:14b-instruct-q4_K_M', size: 8500000000 },
          { name: 'qwen2.5:30b-instruct-q4_K_M', size: 18000000000 },
          { name: 'whisper:small', size: 461000000 }
        ]
      };

      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockModels
      });

      const models = await client.listModels();

      expect(models).toHaveLength(3);
      expect(models.map(m => m.name)).toContain('qwen2.5:14b-instruct-q4_K_M');
    });

    it('should return empty array on error', async () => {
      fetch.mockRejectedValue(new Error('API error'));

      const models = await client.listModels();

      expect(models).toEqual([]);
    });
  });

  describe('Factory functions', () => {
    it('createOllamaClient() should create new instance', () => {
      const newClient = createOllamaClient({ host: 'http://custom:8080' });

      expect(newClient).toBeInstanceOf(OllamaClient);
      expect(newClient.host).toBe('http://custom:8080');
    });

    it('isOllamaConfigured() should check environment', () => {
      process.env.OLLAMA_HOST = 'http://localhost:11434';
      process.env.OLLAMA_PRIMARY_MODEL = 'qwen2.5:14b-instruct-q4_K_M';

      expect(isOllamaConfigured()).toBe(true);

      delete process.env.OLLAMA_PRIMARY_MODEL;
      expect(isOllamaConfigured()).toBe(false);
    });
  });

  describe('PSW-Specific Functionality', () => {
    it('should handle PSW scope validation prompts', async () => {
      const mockResponse = {
        model: 'qwen2.5:14b-instruct-q4_K_M',
        message: {
          role: 'assistant',
          content: 'PSWs observe vital signs and document readings. Notify supervisor for concerning readings.'
        },
        done: true,
        total_duration: 1500000000,
        eval_count: 60
      };

      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const messages = [
        { role: 'system', content: 'You enforce PSW scope: observations only, no diagnoses.' },
        { role: 'user', content: 'Client blood pressure is 160/95. What should I do?' }
      ];

      const result = await client.chat(messages);

      expect(result.success).toBe(true);
      expect(result.message.content).toContain('observe');
      expect(result.message.content).toContain('Notify supervisor');
      expect(result.message.content).not.toContain('diagnose');
    });

    it('should support DAR JSON generation', async () => {
      const mockResponse = {
        model: 'qwen2.5:30b-instruct-q4_K_M',
        message: {
          role: 'assistant',
          content: JSON.stringify({
            DAR: {
              Data: 'Client alert and oriented x3',
              Action: 'Assisted with morning ADLs',
              Response: 'Client cooperative, thanked PSW'
            }
          })
        },
        done: true,
        total_duration: 2500000000,
        eval_count: 120
      };

      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const messages = [
        { role: 'user', content: 'Generate DAR JSON for shift' }
      ];

      const result = await client.chat(messages, { quality: 'balanced' });

      expect(result.success).toBe(true);
      const darJson = JSON.parse(result.message.content);
      expect(darJson.DAR).toHaveProperty('Data');
      expect(darJson.DAR).toHaveProperty('Action');
      expect(darJson.DAR).toHaveProperty('Response');
    });

    it('should handle multi-language conversations', async () => {
      const mockResponse = {
        model: 'qwen2.5:14b-instruct-q4_K_M',
        message: {
          role: 'assistant',
          content: 'Mabuti ang kalagayan ng client. Nakatulong ako sa paglilinis.'
        },
        done: true,
        total_duration: 1500000000,
        eval_count: 50
      };

      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const messages = [
        { role: 'user', content: 'Kumusta ang client?' }
      ];

      const result = await client.chat(messages);

      expect(result.success).toBe(true);
      expect(result.message.content).toContain('client');
    });
  });

  describe('Performance Metrics', () => {
    it('should calculate tokens per second correctly', async () => {
      const mockResponse = {
        model: 'qwen2.5:14b-instruct-q4_K_M',
        response: 'Test response',
        done: true,
        total_duration: 1000000000, // 1 second
        eval_count: 120, // 120 tokens
        eval_duration: 1000000000 // 1 second for token generation
      };

      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await client.generate('Test');

      expect(result.tokensPerSecond).toBeCloseTo(120, 0);
    });

    it('should track duration accurately', async () => {
      const mockResponse = {
        model: 'qwen2.5:30b-instruct-q4_K_M',
        response: 'Response',
        done: true,
        total_duration: 2500000000, // 2.5 seconds
        eval_count: 75,
        eval_duration: 2500000000 // 2.5 seconds for token generation (30 tok/s)
      };

      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await client.generate('Test', { quality: 'balanced' });

      expect(result.duration).toBe(2.5);
      expect(result.tokensPerSecond).toBeCloseTo(30, 0);
    });
  });
});
