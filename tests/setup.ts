// Tailored Care Solutions - PSW Voice Reporting System
// Vitest Global Test Setup
// Configures test environment for all unit tests

import { expect } from 'vitest';

// Global test configuration for Node.js environment tests
// Our audio/AI clients don't need React Testing Library
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = false;
