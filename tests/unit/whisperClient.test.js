// Tailored Care Solutions - PSW Voice Reporting System
// Unit Tests for WhisperClient
// Test speech-to-text functionality

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WhisperClient, createWhisperClient, isWhisperConfigured } from '@/lib/audio/whisperClient';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';

// Mock child_process
vi.mock('child_process', async () => {
  const { vi } = await import('vitest');
  return {
    default: {},
    spawn: vi.fn()
  };
});

// Mock fs
vi.mock('fs', async () => {
  const { vi } = await import('vitest');
  return {
    default: {},
    promises: {
      writeFile: vi.fn(),
      unlink: vi.fn(),
      readFile: vi.fn()
    }
  };
});

describe('WhisperClient', () => {
  let client;
  
  beforeEach(() => {
    // Reset environment variables
    process.env.WHISPER_MODEL = 'small';
    process.env.WHISPER_DEVICE = 'mps';
    process.env.WHISPER_LANGUAGE = 'en';
    process.env.WHISPER_PATH = '/Volumes/AI/models/whisper';
    
    // Create new client instance
    client = new WhisperClient();
    
    // Clear all mocks
    vi.clearAllMocks();
    
    // Setup default mock implementations
    fs.writeFile.mockResolvedValue();
    fs.unlink.mockResolvedValue();
    fs.readFile.mockResolvedValue(Buffer.from('fake audio'));
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with environment variables', () => {
      expect(client.model).toBe('small');
      expect(client.device).toBe('mps');
      expect(client.language).toBe('en');
      expect(client.modelPath).toBe('/Volumes/AI/models/whisper');
    });

    it('should fall back to defaults when env vars missing', () => {
      delete process.env.WHISPER_MODEL;
      delete process.env.WHISPER_DEVICE;
      
      const defaultClient = new WhisperClient();
      
      expect(defaultClient.model).toBe('small');
      expect(defaultClient.device).toBe('mps');
    });

    it('should accept custom options', () => {
      const customClient = new WhisperClient({
        model: 'medium',
        device: 'cpu',
        language: 'fil'
      });
      
      expect(customClient.model).toBe('medium');
      expect(customClient.device).toBe('cpu');
      expect(customClient.language).toBe('fil');
    });
  });

  describe('transcribe()', () => {
    it('should transcribe audio buffer successfully', async () => {
      // Mock successful Whisper response
      const mockStdout = JSON.stringify({
        text: 'Good morning, I assisted Margaret Smith with her shower.',
        language: 'en',
        segments: [
          {
            start: 0,
            end: 5,
            text: 'Good morning',
            avg_logprob: -0.1
          }
        ]
      });

      const mockProcess = {
        stdout: { on: vi.fn((event, callback) => {
          if (event === 'data') callback(Buffer.from(mockStdout));
        })},
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === 'close') callback(0);
        })
      };

      spawn.mockReturnValue(mockProcess);

      const audioBuffer = Buffer.from('fake audio data');
      const result = await client.transcribe(audioBuffer);

      expect(result.success).toBe(true);
      expect(result.transcript).toBe('Good morning, I assisted Margaret Smith with her shower.');
      expect(result.language).toBe('en');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.model).toBe('small');
    });

    it('should handle transcription errors gracefully', async () => {
      const mockProcess = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn((event, callback) => {
          if (event === 'data') callback(Buffer.from('Error: Model not found'));
        })},
        on: vi.fn((event, callback) => {
          if (event === 'close') callback(1); // Exit with error
        })
      };

      spawn.mockReturnValue(mockProcess);

      const audioBuffer = Buffer.from('fake audio data');
      const result = await client.transcribe(audioBuffer);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.fallback).toBe('browser');
    });

    it('should accept file path as input', async () => {
      const mockStdout = JSON.stringify({
        text: 'Test transcription',
        language: 'en',
        segments: []
      });

      const mockProcess = {
        stdout: { on: vi.fn((event, callback) => {
          if (event === 'data') callback(Buffer.from(mockStdout));
        })},
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === 'close') callback(0);
        })
      };

      spawn.mockReturnValue(mockProcess);

      const result = await client.transcribe('/path/to/audio.wav');

      expect(result.success).toBe(true);
      expect(result.transcript).toBe('Test transcription');
    });
  });

  describe('_calculateConfidence()', () => {
    it('should calculate confidence from log probabilities', () => {
      const result = {
        segments: [
          { avg_logprob: -0.1 },
          { avg_logprob: -0.2 },
          { avg_logprob: -0.15 }
        ]
      };

      const confidence = client._calculateConfidence(result);

      expect(confidence).toBeGreaterThan(0);
      expect(confidence).toBeLessThanOrEqual(1);
    });

    it('should return 0 for empty segments', () => {
      const result = { segments: [] };
      const confidence = client._calculateConfidence(result);

      expect(confidence).toBe(0);
    });
  });

  describe('getModelInfo()', () => {
    it('should return correct model information', () => {
      const info = client.getModelInfo();

      expect(info.model).toBe('small');
      expect(info.device).toBe('mps');
      expect(info.language).toBe('en');
      expect(info.size).toBe('461MB');
      expect(info.speed).toBe('50x');
      expect(info.optimizedFor).toBe('PSW conversational speech');
    });

    it('should return info for different models', () => {
      const mediumClient = new WhisperClient({ model: 'medium' });
      const info = mediumClient.getModelInfo();

      expect(info.model).toBe('medium');
      expect(info.size).toBe('1.5GB');
      expect(info.speed).toBe('25x');
    });
  });

  describe('Factory functions', () => {
    it('createWhisperClient() should create new instance', () => {
      const newClient = createWhisperClient({ model: 'large-v3' });

      expect(newClient).toBeInstanceOf(WhisperClient);
      expect(newClient.model).toBe('large-v3');
    });

    it('isWhisperConfigured() should check environment', () => {
      process.env.WHISPER_MODEL = 'small';
      process.env.WHISPER_PATH = '/path/to/models';

      expect(isWhisperConfigured()).toBe(true);

      delete process.env.WHISPER_MODEL;
      expect(isWhisperConfigured()).toBe(false);
    });
  });

  describe('PSW Conversational Speech Optimization', () => {
    it('should use correct settings for PSW speech', () => {
      expect(client.task).toBe('transcribe');
      expect(client.bestOf).toBe(5);
      expect(client.temperature).toBe(0.0); // Deterministic
      expect(client.compression_ratio_threshold).toBe(2.4);
    });

    it('should detect PSW common vocabulary', async () => {
      const mockStdout = JSON.stringify({
        text: 'Assisted with shower, breakfast, and medication. Client was happy.',
        language: 'en',
        segments: []
      });

      const mockProcess = {
        stdout: { on: vi.fn((event, callback) => {
          if (event === 'data') callback(Buffer.from(mockStdout));
        })},
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === 'close') callback(0);
        })
      };

      spawn.mockReturnValue(mockProcess);

      const audioBuffer = Buffer.from('fake audio data');
      const result = await client.transcribe(audioBuffer);

      expect(result.success).toBe(true);
      expect(result.transcript).toContain('shower');
      expect(result.transcript).toContain('breakfast');
      expect(result.transcript).toContain('medication');
    });
  });
});
