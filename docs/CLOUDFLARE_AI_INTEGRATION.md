# Cloudflare Workers AI Integration (PHIPA-Compliant)

## Overview

This guide shows how to use **Cloudflare Workers AI** for non-PHI tasks while maintaining **PHIPA compliance** by keeping all patient data processing on your local Mac.

---

## ⚠️ PHIPA Compliance Rules

### ✅ Safe to Use Cloudflare AI For:
- UI text translation (non-patient content)
- Interface help text generation
- General healthcare tips (no patient-specific info)
- Form validation messages
- Navigation assistance
- Tutorial content

### ❌ NEVER Use Cloudflare AI For:
- Patient names, health card numbers, or identifying information
- Shift reports or clinical observations
- Medication information for specific patients
- Voice transcriptions containing PHI
- Report generation with patient data
- Any task involving PHI (Personal Health Information)

**Rule:** If it contains patient data, use **local AI** (Ollama) only!

---

## Architecture: Hybrid AI Strategy

```
┌─────────────────────────────────────────────────────────┐
│  Cloudflare Workers AI (Edge)                           │
│  ────────────────────────────────────────────────────  │
│  ✅ UI translations (interface text)                    │
│  ✅ Help text generation                                │
│  ✅ Form validation suggestions                         │
│  ✅ General healthcare tips                             │
│  ❌ NO patient data                                     │
│  ❌ NO PHI processing                                   │
└─────────────────────────────────────────────────────────┘
                         │
                         │ For UI tasks only
                         │
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Your Frontend (Vercel)                                 │
│  ────────────────────────────────────────────────────  │
│  - Decides: PHI or non-PHI?                             │
│  - Routes accordingly                                   │
└─────────────────────────────────────────────────────────┘
                         │
                         │ For PHI tasks
                         │
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Your Mac (Ontario) - Local AI                          │
│  ────────────────────────────────────────────────────  │
│  ✅ Ollama (LLaMA 3.3 70B) - PHI processing             │
│  ✅ Whisper.cpp - Voice transcription                   │
│  ✅ XTTS - Voice synthesis                              │
│  ✅ All patient data processing                         │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation

### Step 1: Create Cloudflare Worker

Create `cloudflare-worker/index.ts`:

```typescript
/**
 * Cloudflare Worker with AI
 * PHIPA Compliant - NO PHI Processing
 */

import { Ai } from '@cloudflare/ai';

export interface Env {
  AI: any;
}

export default {
  async fetch(request: Request, env: Env) {
    const ai = new Ai(env.AI);

    // Parse request
    const { task, content } = await request.json();

    // ⚠️ SECURITY: Validate no PHI in request
    if (containsPHI(content)) {
      return new Response(JSON.stringify({
        error: 'PHI detected - use local AI instead',
        phipaCompliance: false
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Route to appropriate AI task
    switch (task) {
      case 'translate_ui':
        return await translateUIText(ai, content);

      case 'help_text':
        return await generateHelpText(ai, content);

      case 'validate_form':
        return await validateFormInput(ai, content);

      default:
        return new Response(JSON.stringify({
          error: 'Unknown task'
        }), { status: 400 });
    }
  }
};

/**
 * PHI Detection (Basic - enhance as needed)
 */
function containsPHI(content: any): boolean {
  const phiKeywords = [
    'patient', 'client', 'health card', 'ohip',
    'medication', 'diagnosis', 'treatment', 'vital signs',
    'shift report', 'observation', 'incident'
  ];

  const contentStr = JSON.stringify(content).toLowerCase();

  return phiKeywords.some(keyword => contentStr.includes(keyword));
}

/**
 * Translate UI Text (Safe - No PHI)
 */
async function translateUIText(ai: Ai, content: any) {
  const { text, targetLanguage } = content;

  const response = await ai.run('@cf/meta/m2m100-1.2b', {
    text: text,
    source_lang: 'en',
    target_lang: targetLanguage
  });

  return new Response(JSON.stringify({
    success: true,
    translation: response.translated_text,
    phipaCompliance: true,
    note: 'UI text only - no PHI processed'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Generate Help Text (Safe - No PHI)
 */
async function generateHelpText(ai: Ai, content: any) {
  const { topic } = content;

  const prompt = `Generate a helpful, professional explanation for PSW interface: ${topic}.
  Keep it concise (2-3 sentences). Do not mention specific patients or PHI.`;

  const response = await ai.run('@cf/meta/llama-3-8b-instruct', {
    messages: [
      { role: 'system', content: 'You are a helpful assistant for a healthcare application UI. Never discuss specific patients.' },
      { role: 'user', content: prompt }
    ]
  });

  return new Response(JSON.stringify({
    success: true,
    helpText: response.response,
    phipaCompliance: true
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Validate Form Input (Safe - No PHI)
 */
async function validateFormInput(ai: Ai, content: any) {
  const { fieldName, value } = content;

  // Simple validation suggestions (no PHI)
  const prompt = `Suggest if this ${fieldName} value is valid: "${value}".
  Only check format/structure, not content. One sentence response.`;

  const response = await ai.run('@cf/meta/llama-3-8b-instruct', {
    messages: [
      { role: 'user', content: prompt }
    ]
  });

  return new Response(JSON.stringify({
    success: true,
    suggestion: response.response,
    phipaCompliance: true
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### Step 2: Deploy Worker

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create new worker
wrangler init cloudflare-worker

# Copy the code above to cloudflare-worker/index.ts

# Deploy
wrangler deploy
```

### Step 3: Update Frontend to Use Hybrid AI

Create `lib/ai/hybrid-ai-router.ts`:

```typescript
/**
 * Hybrid AI Router
 * Routes tasks to appropriate AI service based on PHI content
 */

const CLOUDFLARE_WORKER_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL;
const LOCAL_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export enum AITask {
  // Cloudflare AI (No PHI)
  TRANSLATE_UI = 'translate_ui',
  GENERATE_HELP = 'help_text',
  VALIDATE_FORM = 'validate_form',

  // Local AI (PHI Processing)
  TRANSCRIBE_VOICE = 'transcribe_voice',
  GENERATE_REPORT = 'generate_report',
  ANALYZE_OBSERVATION = 'analyze_observation',
  QUARTERLY_REVIEW = 'quarterly_review'
}

/**
 * Route AI task to appropriate service
 */
export async function routeAITask(task: AITask, content: any) {
  // Determine if task involves PHI
  const isPHITask = [
    AITask.TRANSCRIBE_VOICE,
    AITask.GENERATE_REPORT,
    AITask.ANALYZE_OBSERVATION,
    AITask.QUARTERLY_REVIEW
  ].includes(task);

  if (isPHITask) {
    // Route to local AI (Ontario, Canada)
    console.log('🇨🇦 Using LOCAL AI (PHIPA compliant)');
    return await callLocalAI(task, content);
  } else {
    // Route to Cloudflare AI (Edge, faster for UI tasks)
    console.log('⚡ Using Cloudflare AI (No PHI)');
    return await callCloudflareAI(task, content);
  }
}

/**
 * Call Local AI (Your Mac in Ontario)
 */
async function callLocalAI(task: AITask, content: any) {
  const response = await fetch(`${LOCAL_BACKEND_URL}/api/ai/${task}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-PHIPA-Compliance': 'local-processing'
    },
    body: JSON.stringify(content)
  });

  return await response.json();
}

/**
 * Call Cloudflare AI (Edge)
 */
async function callCloudflareAI(task: AITask, content: any) {
  const response = await fetch(CLOUDFLARE_WORKER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ task, content })
  });

  const result = await response.json();

  // Verify PHIPA compliance flag
  if (!result.phipaCompliance) {
    throw new Error('Cloudflare AI response not marked as PHIPA compliant');
  }

  return result;
}

/**
 * Example Usage: Translate UI text
 */
export async function translateUIText(text: string, language: string) {
  return await routeAITask(AITask.TRANSLATE_UI, {
    text,
    targetLanguage: language
  });
}

/**
 * Example Usage: Generate report (PHI - Local AI)
 */
export async function generateShiftReport(conversationData: any) {
  return await routeAITask(AITask.GENERATE_REPORT, {
    conversation: conversationData
  });
}
```

### Step 4: Use in Components

```typescript
// components/LanguageSelector.tsx
import { translateUIText } from '@/lib/ai/hybrid-ai-router';

export function LanguageSelector() {
  const [translated, setTranslated] = useState('');

  const handleTranslate = async () => {
    // ✅ Safe - No PHI, uses Cloudflare AI
    const result = await translateUIText(
      'Welcome to PSW Documentation System',
      'tl' // Filipino/Tagalog
    );

    setTranslated(result.translation);
  };

  return (
    <div>
      <button onClick={handleTranslate}>
        Translate Interface
      </button>
      {translated && <p>{translated}</p>}
    </div>
  );
}
```

```typescript
// components/PSWVoiceReporter.js
import { routeAITask, AITask } from '@/lib/ai/hybrid-ai-router';

// When generating actual shift report with patient data
const generateReport = async (conversationData) => {
  // ✅ PHIPA Compliant - Routes to LOCAL AI
  const result = await routeAITask(
    AITask.GENERATE_REPORT,
    { conversation: conversationData }
  );

  console.log('Report generated on local Mac in Ontario');
  return result;
};
```

---

## Example Prompts for Cloudflare AI

### 1. Multi-Language UI Translation

```typescript
// Translate button labels, menu items, help text
await translateUIText('Save Draft', 'tl'); // Filipino
await translateUIText('Submit Report', 'es'); // Spanish
await translateUIText('View History', 'pt'); // Portuguese
```

### 2. Generate Help Text

```typescript
// Context-sensitive help (no PHI)
await routeAITask(AITask.GENERATE_HELP, {
  topic: 'How to navigate the report submission form'
});

// Response: "Click the sections on the left to fill in your shift details.
// Use the voice button to record observations. Submit when complete."
```

### 3. Form Validation Suggestions

```typescript
// Suggest better input (no PHI)
await routeAITask(AITask.VALIDATE_FORM, {
  fieldName: 'shift_time',
  value: '25:00' // Invalid
});

// Response: "Invalid time format. Please use 24-hour format (00:00-23:59)."
```

---

## PHIPA Compliance Verification

### Audit Trail

```typescript
// Log all AI usage for PHIPA audit
function logAIUsage(task: AITask, isPHI: boolean, service: 'cloudflare' | 'local') {
  auditLog.record({
    event: 'ai_task_executed',
    task,
    containsPHI: isPHI,
    service,
    timestamp: new Date(),
    compliance: isPHI ? 'local_only' : 'edge_allowed'
  });
}
```

### Testing PHI Detection

```bash
# Test PHI detection
curl -X POST https://your-worker.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "task": "translate_ui",
    "content": {
      "text": "Patient John Doe has diabetes"
    }
  }'

# Expected Response:
# {
#   "error": "PHI detected - use local AI instead",
#   "phipaCompliance": false
# }
```

---

## Cost Comparison

| Service | Cost | Use Case | PHIPA Status |
|---------|------|----------|--------------|
| **Cloudflare AI** | Free (10k requests/day) | UI tasks, translations | ✅ If no PHI |
| **Local Ollama** | $0 (Your Mac) | All PHI processing | ✅ Always compliant |
| **OpenAI** | $0.50-$30 per 1M tokens | N/A | ❌ Not PHIPA compliant |

**Recommendation:** Use Cloudflare AI for UI enhancement, keep all patient data on local AI.

---

## Summary

### ✅ What You CAN Do with Cloudflare AI:
1. Translate interface text (buttons, menus, help)
2. Generate help documentation
3. Validate form inputs (format only, not content)
4. Provide general healthcare tips (non-patient-specific)

### ❌ What You MUST NOT Do:
1. Process patient names or identifiers
2. Transcribe voice containing PHI
3. Generate shift reports with patient data
4. Analyze clinical observations
5. Store any PHI on Cloudflare

### 🎯 Best Practice:
- **UI/UX tasks** → Cloudflare AI (fast, free, no PHI)
- **Patient data** → Local AI (PHIPA compliant, Ontario)
- **When in doubt** → Use local AI

---

## Next Steps

1. Deploy Cloudflare Worker (if you want edge AI for UI tasks)
2. Add hybrid router to frontend
3. Test PHI detection
4. Update audit logging
5. Document which tasks use which AI

**Remember:** When in doubt, use **local AI**. PHIPA compliance is non-negotiable!

---

**Document Version:** 1.0
**PHIPA Compliance:** ✅ Hybrid approach maintains data sovereignty
**IPC Ontario:** 1-800-387-0073
