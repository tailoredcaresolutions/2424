# 🛡️ Production Hardening Plan
## Builder.io, V0, Sigma, and Entire App

**Status**: 🔴 Critical fixes needed before production  
**Last Updated**: January 2025

---

## 🚨 CRITICAL SECURITY FIXES (DO FIRST)

### 1. **Change Default Encryption Keys** ⚠️ CRITICAL
**Files**: 
- `lib/database/encryptedDb.ts`
- `backend/lib/database/encryptedDb.ts`

**Current Risk**: Using default/hardcoded keys
**Fix Required**:
```bash
# Generate production keys
openssl rand -hex 32  # DATABASE_ENCRYPTION_KEY
openssl rand -base64 32  # SESSION_SECRET
openssl rand -base64 48  # JWT_SECRET
```

**Action**: Update `.env.production` with generated keys

---

### 2. **Replace Console Statements** ⚠️ HIGH PRIORITY
**Found**: 425 instances across 75 files

**Replace Pattern**:
```javascript
// ❌ REMOVE
console.log('debug info');
console.error('error');

// ✅ USE
import { logger } from '@/lib/logging/logger';
logger.info('debug info');
logger.error('error');
```

**Critical Files**:
- `app/api/**/*.js` (all API routes)
- `components/PSWVoiceReporter.js`
- `lib/ai/**/*.js`

---

### 3. **Harden Security Headers** ⚠️ HIGH PRIORITY
**File**: `next.config.js`

**Current**: Basic headers (X-Frame-Options, X-XSS-Protection)
**Needs**: CSP (Content Security Policy) + HSTS

---

## 🎨 FIGMA INTEGRATION HARDENING

### Current Status
- ✅ Multiple clients: `figma-client.ts`, `figma-official.ts`, `figma-oauth.ts`, `figma-integration.ts`
- ✅ API token support
- ✅ OAuth2 support
- ⚠️ **NOW HARDENED**: Error handling, retry logic, validation

### Hardening Checklist

#### 1. **API Token Security** ✅
```typescript
// ✅ SECURE - Validates token format
if (!token || token.length < 20) {
  throw new Error('Figma API token appears invalid');
}
if (!token.startsWith('figd_') && !/^[A-Za-z0-9_-]{20,}$/.test(token)) {
  throw new Error('Figma API token appears invalid (invalid format)');
}
```

#### 2. **Error Handling** ✅
- ✅ Try/catch blocks on all requests
- ✅ Retry logic with exponential backoff
- ✅ Request timeouts (15 seconds)
- ✅ Rate limit handling (429 status)

#### 3. **OAuth2 Security** ✅
- ✅ Client ID/Secret validation
- ✅ Token caching with expiry
- ✅ Secure token storage (never expose)

#### 4. **Response Validation** ✅
- ✅ Validates response structure
- ✅ Validates OAuth token response
- ✅ Handles invalid JSON gracefully

---

## 🔧 BUILDER.IO HARDENING

### Current Status
- ✅ Dependencies: `@builder.io/react@8.2.9`, `@builder.io/sdk@6.1.3`
- ✅ Client exists: `lib/integrations/builder-client.ts`
- ⚠️ API key not validated
- ⚠️ No error boundaries
- ⚠️ No rate limiting
- ⚠️ No cache invalidation

### Hardening Checklist

#### 1. **API Key Security**
```typescript
// ✅ SECURE
const apiKey = process.env.BUILDER_API_KEY;
if (!apiKey || apiKey.length < 32) {
  throw new Error('Invalid BUILDER_API_KEY');
}
```

#### 2. **Error Boundaries**
```typescript
// Wrap Builder.io components
<ErrorBoundary fallback={<BuilderFallback />}>
  <BuilderComponent />
</ErrorBoundary>
```

#### 3. **Rate Limiting**
- Add request throttling (max 10 requests/second)
- Cache responses (TTL: 5 minutes)
- Handle Builder.io API rate limits gracefully

#### 4. **Content Validation**
- Validate Builder.io responses before rendering
- Sanitize HTML content
- Prevent XSS from dynamic content

---

## 🎨 V0 COMPONENT HARDENING

### Current Status
- ✅ SDK: `v0-sdk@0.15.0`
- ✅ Scripts: `scripts/generate-v0-component.js`
- ⚠️ No component validation
- ⚠️ No version pinning
- ⚠️ API key exposed in client-side (if used)

### Hardening Checklist

#### 1. **Component Validation**
```typescript
// Validate V0 components before use
function validateV0Component(component: any) {
  // Check structure
  if (!component?.type || !component?.props) {
    throw new Error('Invalid V0 component');
  }
  
  // Check for dangerous props
  if (component.props.dangerouslySetInnerHTML) {
    throw new Error('XSS risk: dangerouslySetInnerHTML not allowed');
  }
  
  return component;
}
```

#### 2. **Version Pinning**
- Pin specific V0 component versions
- Test updates before deploying
- Document breaking changes

#### 3. **API Key Protection**
- ✅ Server-side only (never expose to client)
- ✅ Use environment variables
- ✅ Rotate keys quarterly

---

## 📦 SIGMA INTEGRATION HARDENING

### Status: Not Found in Codebase
**If Adding Sigma**:
1. Validate all Sigma components
2. Implement error boundaries
3. Rate limit Sigma API calls
4. Cache responses
5. Monitor usage/performance

---

## 🔐 API SECURITY HARDENING

### 1. **Rate Limiting** (Currently: ⚠️ Configured but not tuned)
```typescript
// Add to API routes
import { rateLimit } from '@/lib/security/rateLimit';

export const POST = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later',
});
```

### 2. **Input Validation**
- ✅ AJV schema validation (already implemented)
- ✅ Zod validation for API inputs
- ⚠️ Add file upload size limits
- ⚠️ Sanitize user inputs

### 3. **API Key Management**
```typescript
// Secure API key validation
function validateApiKey(key: string): boolean {
  // Length check
  if (key.length < 32) return false;
  
  // Pattern validation
  if (!/^[A-Za-z0-9_-]+$/.test(key)) return false;
  
  // Rate limit check
  if (rateLimitExceeded(key)) return false;
  
  return true;
}
```

---

## 🛡️ ENHANCED SECURITY HEADERS

### Update `next.config.js`:
```javascript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        // Existing
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        
        // NEW - Add these
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Builder.io/V0 may need this
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "font-src 'self' data:",
            "connect-src 'self' https://cdn.builder.io https://v0.dev",
            "frame-src 'self' https://builder.io",
          ].join('; '),
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains; preload',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
      ],
    },
  ];
},
```

---

## 🔍 ERROR HANDLING & MONITORING

### 1. **Structured Logging**
Replace all `console.log` with structured logger:
```typescript
import { logger } from '@/lib/logging/logger';

// ✅ Structured logging
logger.info({
  event: 'api_request',
  endpoint: '/api/generate-report',
  userId: user.id,
  duration: 1234,
  status: 'success',
});
```

### 2. **Error Boundaries**
```typescript
// components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    logger.error({
      event: 'react_error_boundary',
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }
}
```

### 3. **API Error Responses**
```typescript
// Standardized error format
export function createErrorResponse(
  code: string,
  message: string,
  statusCode = 500
) {
  logger.error({ code, message, statusCode });
  
  return Response.json(
    {
      error: {
        code,
        message,
        timestamp: new Date().toISOString(),
      },
    },
    { status: statusCode }
  );
}
```

---

## 🧪 TESTING HARDENING

### 1. **Security Testing**
```bash
# Add to package.json
"test:security": "npm audit && npm run lint:security"
```

### 2. **Component Testing**
```typescript
// Test Builder.io/V0 components
describe('Builder.io Component', () => {
  it('should not expose sensitive data', () => {
    const component = render(<BuilderComponent />);
    expect(component).not.toContain('api_key');
  });
  
  it('should handle API failures gracefully', () => {
    mockBuilderAPI.reject();
    const component = render(<BuilderComponent />);
    expect(component).toHaveTextContent('Failed to load content');
  });
});
```

---

## 📋 IMPLEMENTATION PRIORITY

### Phase 1: Critical Security (1-2 days)
1. ✅ Change default encryption keys
2. ✅ Replace console.log statements (50+ files)
3. ✅ Add CSP headers
4. ✅ Validate API keys

### Phase 2: Builder.io/V0/Figma Hardening (2-3 days)
1. ✅ Error boundaries for Builder.io components
2. ✅ Rate limiting for Builder.io API
3. ✅ Component validation for V0
4. ✅ Figma integration hardened (all clients)
5. ✅ Cache invalidation strategies

### Phase 3: Monitoring & Testing (1-2 days)
1. ✅ Structured logging implementation
2. ✅ Error tracking (Sentry already installed)
3. ✅ Security testing suite
4. ✅ Component testing

---

## ✅ VERIFICATION CHECKLIST

Before Production:
- [ ] All default keys changed
- [ ] All console.log replaced with logger
- [ ] CSP headers configured
- [ ] Builder.io error boundaries added
- [ ] V0 components validated
- [ ] Rate limiting tested
- [ ] API keys secured
- [ ] Error logging working
- [ ] Security headers verified
- [ ] All tests passing

---

## 🚀 QUICK START HARDENING

Run this command to start automated fixes:
```bash
npm run harden:production
```

This will:
1. Generate new encryption keys
2. Find all console.log statements
3. Validate security headers
4. Check for exposed API keys
5. Run security audit

---

**Next Steps**: See `HARDENING_IMPLEMENTATION.md` for detailed implementation guide.

