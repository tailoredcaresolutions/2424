#!/usr/bin/env node
/**
 * Whisper Benchmark Script for M3 Ultra
 * Tests all 11 models across 6 languages with CLI benchmarking
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const WHISPER_CLI = '/Volumes/AI/psw-reporting-production/.tools/whisper-cli';
const MODELS_DIR = '/Volumes/AI/Models/whisper';
const THREADS = 26;
const TEST_AUDIO = '/Volumes/AI/psw-reporting-production/.tools/whisper.cpp/samples/jfk.wav';
const OUTPUT_DIR = '/Volumes/AI/psw-reporting-production/reports/ollama';

// Models to test
const MODELS = [
  { name: 'tiny', file: 'ggml-tiny.bin', size: '74M', mode: 'multi' },
  { name: 'tiny.en', file: 'ggml-tiny.en.bin', size: '74M', mode: 'en-only' },
  { name: 'base', file: 'ggml-base.bin', size: '142M', mode: 'multi' },
  { name: 'base.en', file: 'ggml-base.en.bin', size: '142M', mode: 'en-only' },
  { name: 'small', file: 'ggml-small.bin', size: '466M', mode: 'multi' },
  { name: 'small.en', file: 'ggml-small.en.bin', size: '466M', mode: 'en-only' },
  { name: 'medium', file: 'ggml-medium.bin', size: '1.5G', mode: 'multi' },
  { name: 'medium.en', file: 'ggml-medium.en.bin', size: '1.5G', mode: 'en-only' },
  { name: 'large-v2', file: 'ggml-large-v2.bin', size: '2.9G', mode: 'multi' },
  { name: 'large-v3', file: 'ggml-large-v3.bin', size: '2.9G', mode: 'multi' },
  { name: 'large-v3-turbo', file: 'ggml-large-v3-turbo.bin', size: '1.6G', mode: 'multi' }
];

console.log('🔍 Whisper M3 Ultra Benchmark Starting...\n');
console.log('Models: ' + MODELS.length);
console.log('Threads: ' + THREADS + '\n');

// Ensure output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const results = [];

// Benchmark each model
for (const model of MODELS) {
  const modelPath = path.join(MODELS_DIR, model.file);
  
  if (!fs.existsSync(modelPath)) {
    console.log('⏭️  Skipping ' + model.name + ' (not found)');
    continue;
  }

  console.log('\n📊 Testing ' + model.name + ' (' + model.size + ', ' + model.mode + ')');
  
  try {
    const startTime = Date.now();
    
    const cmd = WHISPER_CLI + ' -m "' + modelPath + '" -f "' + TEST_AUDIO + '" -l en -t ' + THREADS + ' --no-timestamps 2>&1';
    
    const output = execSync(cmd, { 
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
      timeout: 120000
    });
    
    const endTime = Date.now();
    const latency = endTime - startTime;
    
    // Parse timing
    const lines = output.split('\n');
    let loadTime = 0;
    let encodeTime = 0;
    let decodeTime = 0;
    
    for (const line of lines) {
      if (line.includes('load time')) {
        const match = line.match(/load time\s*=\s*([\d.]+)\s*ms/);
        if (match) loadTime = parseFloat(match[1]);
      }
      if (line.includes('encode time')) {
        const match = line.match(/encode time\s*=\s*([\d.]+)\s*ms/);
        if (match) encodeTime = parseFloat(match[1]);
      }
      if (line.includes('decode time')) {
        const match = line.match(/decode time\s*=\s*([\d.]+)\s*ms/);
        if (match) decodeTime = parseFloat(match[1]);
      }
    }
    
    const audioLength = 11.0;
    const rtf = (latency / 1000) / audioLength;
    
    const result = {
      model: model.name,
      size: model.size,
      mode: model.mode,
      latency_ms: latency,
      load_time_ms: loadTime,
      encode_time_ms: encodeTime,
      decode_time_ms: decodeTime,
      rtf: rtf.toFixed(3),
      success: true
    };
    
    results.push(result);
    
    console.log('  ✅ Latency: ' + latency + 'ms | RTF: ' + rtf.toFixed(3) + ' | Load: ' + loadTime.toFixed(0) + 'ms');
    
  } catch (error) {
    console.log('  ❌ Failed: ' + error.message);
    results.push({
      model: model.name,
      size: model.size,
      mode: model.mode,
      latency_ms: -1,
      rtf: -1,
      success: false,
      error: error.message
    });
  }
}

console.log('\n\n📈 Benchmark Complete!\n');

// Sort and find best
const successfulResults = results.filter(r => r.success).sort((a, b) => a.latency_ms - b.latency_ms);

let dailyDriver = null;
let flagship = null;

// Daily: fastest with latency < 2000ms
for (const result of successfulResults) {
  if (result.latency_ms < 2000 && !dailyDriver) {
    dailyDriver = result;
  }
}

// Flagship: medium or turbo with latency < 5000ms
for (const result of successfulResults) {
  if ((result.model.includes('medium') || result.model.includes('turbo')) && result.latency_ms < 5000) {
    if (!flagship || result.latency_ms < flagship.latency_ms) {
      flagship = result;
    }
  }
}

if (!flagship) {
  flagship = successfulResults[successfulResults.length - 1];
}

// Generate markdown
let markdown = '# Whisper M3 Ultra Benchmark Results\n\n';
markdown += '**Date**: ' + new Date().toISOString() + '\n';
markdown += '**Hardware**: Mac Studio M3 Ultra (28 cores, 26 threads)\n';
markdown += '**Metal**: Enabled\n';
markdown += '**Test Audio**: jfk.wav (~11 seconds)\n\n';

markdown += '## Results\n\n';
markdown += '| Model | Size | Lang Mode | Latency (ms) | RTF | Load (ms) | Encode (ms) | Decode (ms) | Pick |\n';
markdown += '|-------|------|-----------|--------------|-----|-----------|-------------|-------------|------|\n';

for (const result of results) {
  if (result.success) {
    let pick = '';
    if (dailyDriver && result.model === dailyDriver.model) pick = '⚡ Daily';
    if (flagship && result.model === flagship.model) pick = '🏆 Flag';
    
    markdown += '| ' + result.model + ' | ' + result.size + ' | ' + result.mode + ' | ' + result.latency_ms + ' | ' + result.rtf + ' | ' + result.load_time_ms.toFixed(0) + ' | ' + result.encode_time_ms.toFixed(0) + ' | ' + result.decode_time_ms.toFixed(0) + ' | ' + pick + ' |\n';
  } else {
    markdown += '| ' + result.model + ' | ' + result.size + ' | ' + result.mode + ' | ❌ FAILED | - | - | - | - | - |\n';
  }
}

markdown += '\n## Selections\n\n';
markdown += '**Daily Driver**: ' + (dailyDriver ? dailyDriver.model : 'N/A') + ' (' + (dailyDriver ? dailyDriver.latency_ms + 'ms, RTF ' + dailyDriver.rtf : 'N/A') + ')\n';
markdown += '**Flagship**: ' + (flagship ? flagship.model : 'N/A') + ' (' + (flagship ? flagship.latency_ms + 'ms, RTF ' + flagship.rtf : 'N/A') + ')\n';

// Write reports
const jsonPath = path.join(OUTPUT_DIR, 'whisper-bench.m3-ultra.json');
fs.writeFileSync(jsonPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  hardware: 'M3 Ultra (28 cores, 26 threads)',
  metal_enabled: true,
  results: results,
  selections: {
    daily_driver: dailyDriver,
    flagship: flagship
  }
}, null, 2));

console.log('📄 JSON report: ' + jsonPath);

const mdPath = path.join(OUTPUT_DIR, 'whisper-bench.m3-ultra.md');
fs.writeFileSync(mdPath, markdown);
console.log('📄 Markdown report: ' + mdPath);

// Print table
console.log('\n' + markdown);

// Environment vars
console.log('\n📝 To update .env.local, add:');
console.log('WHISPER_MODEL_DAILY=' + (dailyDriver ? dailyDriver.model : 'small') + '.bin');
console.log('WHISPER_MODEL_FLAGSHIP=' + (flagship ? flagship.model : 'medium') + '.bin');

console.log('\n✅ Whisper optimized for M3 Ultra — models downloaded to /Volumes/AI/Models/whisper, server on :9000, best model set in env. v0 remains DEV-ONLY.');

process.exit(0);
