// Tailored Care Solutions - PSW Voice Reporting System
// Unit Tests for XTTSClient
// Test text-to-speech functionality

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { XTTSClient, createXTTSClient, isXTTSConfigured } from '@/lib/audio/xttsClient';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';

// Mock child_process
vi.mock('child_process');

// Mock fs
vi.mock('fs', () => ({
  promises: {
    writeFile: vi.fn(),
    unlink: vi.fn(),
    readFile: vi.fn()
  }
}));

describe('XTTSClient', () => {
  let client;
  
  beforeEach(() => {
    // Reset environment variables
    process.env.XTTS_MODEL = 'tts_models/multilingual/multi-dataset/xtts_v2';
    process.env.XTTS_DEVICE = 'mps';
    process.env.XTTS_SAMPLE_RATE = '24000';
    process.env.XTTS_PATH = '/Volumes/AI/models/xtts';
    
    // Create new client instance
    client = new XTTSClient();
    
    // Clear all mocks
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with environment variables', () => {
      expect(client.model).toBe('tts_models/multilingual/multi-dataset/xtts_v2');
      expect(client.device).toBe('mps');
      expect(client.sampleRate).toBe(24000);
      expect(client.modelPath).toBe('/Volumes/AI/models/xtts');
    });

    it('should fall back to defaults when env vars missing', () => {
      delete process.env.XTTS_MODEL;
      delete process.env.XTTS_DEVICE;
      
      const defaultClient = new XTTSClient();
      
      expect(defaultClient.model).toBe('tts_models/multilingual/multi-dataset/xtts_v2');
      expect(defaultClient.device).toBe('mps');
    });

    it('should have voice profiles defined', () => {
      expect(client.voiceProfiles).toHaveProperty('supportive');
      expect(client.voiceProfiles).toHaveProperty('encouraging');
      expect(client.voiceProfiles).toHaveProperty('clarifying');
    });
  });

  describe('synthesize()', () => {
    it('should synthesize text successfully with supportive voice', async () => {
      // Mock WAV file buffer (simplified header + data)
      const mockWavBuffer = Buffer.alloc(1000);
      // Write WAV header (44 bytes)
      mockWavBuffer.write('RIFF', 0);
      mockWavBuffer.writeUInt32LE(992, 4); // Chunk size
      mockWavBuffer.write('WAVE', 8);
      
      fs.readFile.mockResolvedValue(mockWavBuffer);

      const mockProcess = {
        stdout: { on: vi.fn((event, callback) => {
          if (event === 'data') callback(Buffer.from('✅ Synthesis complete'));
        })},
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === 'close') callback(0);
        })
      };

      spawn.mockReturnValue(mockProcess);

      const text = 'Good morning! Let me help you document your shift.';
      const result = await client.synthesize(text, { voice: 'supportive' });

      expect(result.success).toBe(true);
      expect(result.audioData).toBeDefined();
      expect(result.format).toBe('wav');
      expect(result.voice).toBe('supportive');
      expect(result.text).toBe(text);
    });

    it('should handle synthesis errors gracefully', async () => {
      const mockProcess = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn((event, callback) => {
          if (event === 'data') callback(Buffer.from('Error: Model not loaded'));
        })},
        on: vi.fn((event, callback) => {
          if (event === 'close') callback(1); // Exit with error
        })
      };

      spawn.mockReturnValue(mockProcess);

      const result = await client.synthesize('Test text');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.fallback).toBe('browser');
    });

    it('should reject empty text', async () => {
      const result = await client.synthesize('');

      expect(result.success).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should synthesize with encouraging voice', async () => {
      const mockWavBuffer = Buffer.alloc(1000);
      fs.readFile.mockResolvedValue(mockWavBuffer);

      const mockProcess = {
        stdout: { on: vi.fn((event, callback) => {
          if (event === 'data') callback(Buffer.from('✅ Synthesis complete'));
        })},
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === 'close') callback(0);
        })
      };

      spawn.mockReturnValue(mockProcess);

      const result = await client.synthesize('Great work!', { voice: 'encouraging' });

      expect(result.success).toBe(true);
      expect(result.voice).toBe('encouraging');
    });
  });

  describe('Voice Profiles', () => {
    it('should have correct voice profile settings', () => {
      expect(client.voiceProfiles.supportive.emotion).toBe('calm');
      expect(client.voiceProfiles.supportive.speed).toBe(1.0);
      
      expect(client.voiceProfiles.encouraging.emotion).toBe('happy');
      expect(client.voiceProfiles.encouraging.speed).toBe(1.05);
      
      expect(client.voiceProfiles.clarifying.emotion).toBe('neutral');
      expect(client.voiceProfiles.clarifying.speed).toBe(0.95);
    });

    it('should fall back to supportive voice for unknown profile', async () => {
      const mockWavBuffer = Buffer.alloc(1000);
      fs.readFile.mockResolvedValue(mockWavBuffer);

      const mockProcess = {
        stdout: { on: vi.fn((event, callback) => {
          if (event === 'data') callback(Buffer.from('✅ Synthesis complete'));
        })},
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === 'close') callback(0);
        })
      };

      spawn.mockReturnValue(mockProcess);

      const result = await client.synthesize('Test', { voice: 'unknown_voice' });

      expect(result.success).toBe(true);
      // Should use supportive as fallback
    });
  });

  describe('getSupportedLanguages()', () => {
    it('should return all supported languages', () => {
      const languages = client.getSupportedLanguages();

      expect(languages).toHaveLength(6);
      expect(languages.map(l => l.code)).toContain('en');
      expect(languages.map(l => l.code)).toContain('fil');
      expect(languages.map(l => l.code)).toContain('es');
      expect(languages.map(l => l.code)).toContain('pt');
      expect(languages.map(l => l.code)).toContain('hi');
      expect(languages.map(l => l.code)).toContain('bo');
    });

    it('should include language names and flags', () => {
      const languages = client.getSupportedLanguages();
      const english = languages.find(l => l.code === 'en');

      expect(english.name).toBe('English (Canadian)');
      expect(english.flag).toBe('🇨🇦');
    });
  });

  describe('getVoiceProfiles()', () => {
    it('should return all voice profiles with descriptions', () => {
      const profiles = client.getVoiceProfiles();

      expect(profiles).toHaveLength(3);
      expect(profiles.map(p => p.name)).toContain('supportive');
      expect(profiles.map(p => p.name)).toContain('encouraging');
      expect(profiles.map(p => p.name)).toContain('clarifying');

      const supportive = profiles.find(p => p.name === 'supportive');
      expect(supportive.description).toContain('PSW');
    });
  });

  describe('getModelInfo()', () => {
    it('should return model information', () => {
      const info = client.getModelInfo();

      expect(info.model).toBe('tts_models/multilingual/multi-dataset/xtts_v2');
      expect(info.device).toBe('mps');
      expect(info.sampleRate).toBe(24000);
      expect(info.size).toBe('1.8GB');
      expect(info.languages).toBe(6);
      expect(info.voices).toBe(3);
      expect(info.optimizedFor).toContain('PHIPA');
    });
  });

  describe('Factory functions', () => {
    it('createXTTSClient() should create new instance', () => {
      const newClient = createXTTSClient({ device: 'cpu' });

      expect(newClient).toBeInstanceOf(XTTSClient);
      expect(newClient.device).toBe('cpu');
    });

    it('isXTTSConfigured() should check environment', () => {
      process.env.XTTS_MODEL = 'tts_models/multilingual/multi-dataset/xtts_v2';
      process.env.XTTS_PATH = '/path/to/models';

      expect(isXTTSConfigured()).toBe(true);

      delete process.env.XTTS_MODEL;
      expect(isXTTSConfigured()).toBe(false);
    });
  });

  describe('PSW Voice Output Optimization', () => {
    it('should support PSW guidance phrases', async () => {
      const mockWavBuffer = Buffer.alloc(1000);
      fs.readFile.mockResolvedValue(mockWavBuffer);

      const mockProcess = {
        stdout: { on: vi.fn((event, callback) => {
          if (event === 'data') callback(Buffer.from('✅ Synthesis complete'));
        })},
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === 'close') callback(0);
        })
      };

      spawn.mockReturnValue(mockProcess);

      const pswPhrase = 'For dry skin, document the location and severity. Notify supervisor if severe.';
      const result = await client.synthesize(pswPhrase, { voice: 'supportive' });

      expect(result.success).toBe(true);
      expect(result.text).toBe(pswPhrase);
    });

    it('should handle multi-language PSW responses', async () => {
      const mockWavBuffer = Buffer.alloc(1000);
      fs.readFile.mockResolvedValue(mockWavBuffer);

      const mockProcess = {
        stdout: { on: vi.fn((event, callback) => {
          if (event === 'data') callback(Buffer.from('✅ Synthesis complete'));
        })},
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === 'close') callback(0);
        })
      };

      spawn.mockReturnValue(mockProcess);

      const filipinoText = 'Mabuti ang kalagayan ng client ngayong umaga.';
      const result = await client.synthesize(filipinoText, { 
        voice: 'supportive',
        language: 'fil'
      });

      expect(result.success).toBe(true);
    });
  });
});
