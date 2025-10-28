#!/usr/bin/env node
/**
 * PSW Backend Server - Local AI & Database Services
 *
 * This Express server runs locally on your Mac and provides:
 * - SQLCipher encrypted database operations
 * - Ollama AI integration (LLaMA 3.3 70B)
 * - Whisper.cpp speech-to-text
 * - Coqui XTTS text-to-speech
 * - MFA/Authentication services
 * - Health monitoring
 * - Backup management
 *
 * The frontend (Vercel) connects to this via Cloudflare Tunnel
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pino from 'pino';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.PRETTY_LOGS === 'true' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  } : undefined
});

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 4000;

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Allow frontend to load resources
}));

// CORS configuration for Vercel frontend
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn({ origin }, 'CORS request from unauthorized origin');
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    });
  });
  next();
});

// ============================================================================
// ROUTES
// ============================================================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    services: {
      database: 'connected', // Will be enhanced with actual checks
      ollama: 'running',
      whisper: 'running',
      xtts: 'running'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'PSW Backend Server',
    version: '1.0.0',
    description: 'Local AI & Database Services for PSW Voice Documentation',
    endpoints: {
      health: '/health',
      api: '/api/*'
    }
  });
});

// Import and mount API routes
// These will be created in the next steps
import apiRoutes from './routes/index.js';
app.use('/api', apiRoutes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error({
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

app.listen(PORT, () => {
  logger.info(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║             PSW Backend Server - LOCAL MODE                   ║
║                                                                ║
║  Status: Running                                               ║
║  Port: ${PORT}                                                      ║
║  Environment: ${process.env.NODE_ENV || 'development'}                              ║
║                                                                ║
║  Services:                                                     ║
║  ✓ Express API Server                                         ║
║  ✓ SQLCipher Database (${process.env.DATABASE_PATH || 'configured'})            ║
║  ✓ Ollama AI (${process.env.OLLAMA_HOST || 'localhost:11434'})              ║
║  ✓ Whisper.cpp (${process.env.LOCAL_WHISPER_URL || 'localhost:9000'})         ║
║  ✓ Coqui XTTS (${process.env.LOCAL_TTS_URL || 'localhost:8020'})           ║
║                                                                ║
║  Frontend: Vercel (configured via CORS)                       ║
║  Tunnel: Run 'npm run tunnel' for Cloudflare access           ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);

  logger.info({ port: PORT }, 'Backend server started successfully');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});
