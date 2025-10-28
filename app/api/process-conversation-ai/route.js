import { NextResponse } from 'next/server';
import { mockProcessConversation, isLocalMode } from '@/lib/mocks/mockAI';
import ollamaClient from '@/lib/ai/ollamaClient';
import Ajv from 'ajv';

// ================================
// 1) DAR SYSTEM PROMPT (Ontario)
// ================================
const SYSTEM_PROMPT_DAR = `
You convert a PSW’s casual speech into a concise, non-clinical progress note AND a DAR JSON summary.

Rules (must follow):
- Ontario PSW scope: PSWs document observations and care completed; they do NOT diagnose or create clinical “assessments” or “plans.” If clinical issues are mentioned, record them as observations and set "follow_up.notify_supervisor_RN": true with a short reason.
- Style: plain language, objective, short sentences. No medical jargon or advice.
- Include client quotes when helpful. Capture exact numbers (e.g., "120/80").
- If medications, vitals, or symptoms are mentioned, record them as "observed/reported" only.
- Output BOTH, in this order:
  (A) A brief paragraph note (2–5 sentences, English).
  (B) A VALID JSON object (UTF-8, no code fences) using this schema:

{
  "client_name": "<if stated or 'unknown'>",
  "date_time": "<ISO8601 or 'unknown'>",
  "language": "<detected>",
  "DAR": {
    "Data": "Objective facts + client quotes",
    "Action": "What the PSW did",
    "Response": "How the client responded"
  },
  "adls": {
    "personal_care": "...",
    "mobility": "...",
    "nutrition": {"meal": "breakfast/lunch/dinner/unknown", "intake": "all/most/some/little/none", "items": []},
    "continence": "...",
    "mood": "...",
    "social": "...",
    "safety_environment": "..."
  },
  "observations": {
    "vital_signs": {"bp": "...", "hr": "...", "temp": "...", "spo2": "..."},
    "medications": [{"name": "...", "dose": "...", "time": "...", "source": "observed/reported"}],
    "pain": {"scale_0_10": "...", "location": "..."}
  },
  "follow_up": {"notify_supervisor_RN": true/false, "reason": "..."},
  "psw_id": "<if provided>",
  "errors_or_gaps": ["missing client name", "time unclear"]
}

When unsure, write "unknown" instead of guessing. Output the paragraph FIRST, then the JSON object.
`;

// =====================================
// 2) JSON Schema + helpers (validation)
// =====================================
const ajv = new Ajv({ allErrors: true, strict: false });

const darSchema = {
  type: 'object',
  required: ['client_name', 'date_time', 'language', 'DAR', 'adls', 'observations', 'follow_up'],
  properties: {
    client_name: { type: 'string' },
    date_time: { type: 'string' },
    language: { type: 'string' },
    DAR: {
      type: 'object',
      required: ['Data', 'Action', 'Response'],
      properties: {
        Data: { type: 'string' },
        Action: { type: 'string' },
        Response: { type: 'string' }
      }
    },
    adls: {
      type: 'object',
      properties: {
        personal_care: { type: 'string' },
        mobility: { type: 'string' },
        nutrition: {
          type: 'object',
          properties: {
            meal: { type: 'string' },
            intake: { type: 'string' },
            items: { type: 'array', items: { type: 'string' } }
          },
          required: ['meal', 'intake']
        },
        continence: { type: 'string' },
        mood: { type: 'string' },
        social: { type: 'string' },
        safety_environment: { type: 'string' }
      }
    },
    observations: {
      type: 'object',
      properties: {
        vital_signs: {
          type: 'object',
          properties: { bp: { type: 'string' }, hr: { type: 'string' }, temp: { type: 'string' }, spo2: { type: 'string' } }
        },
        medications: {
          type: 'array',
          items: {
            type: 'object',
            properties: { name: { type: 'string' }, dose: { type: 'string' }, time: { type: 'string' }, source: { type: 'string' } },
            required: ['name']
          }
        },
        pain: { type: 'object', properties: { scale_0_10: { type: ['number', 'string'] }, location: { type: 'string' } } }
      }
    },
    follow_up: {
      type: 'object',
      properties: { notify_supervisor_RN: { type: ['boolean', 'string'] }, reason: { type: 'string' } }
    },
    psw_id: { type: 'string' },
    errors_or_gaps: { type: 'array', items: { type: 'string' } }
  }
};

const validateDAR = ajv.compile(darSchema);

// Extract the last JSON object in a string safely
function extractLastJson(text) {
  const lastOpen = text.lastIndexOf('{');
  if (lastOpen === -1) return null;
  let candidate = text.slice(lastOpen).trim();

  // naive clip: try to find a matching closing brace by balance
  let balance = 0;
  let end = -1;
  for (let i = lastOpen; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') balance++;
    if (ch === '}') balance--;
    if (balance === 0) { end = i; break; }
  }
  if (end !== -1) candidate = text.slice(lastOpen, end + 1);

  try { return JSON.parse(candidate); } catch (e) { return null; }
}

function skeletonDAR() {
  return {
    client_name: 'unknown',
    date_time: new Date().toISOString(),
    language: 'unknown',
    DAR: { Data: '', Action: '', Response: '' },
    adls: {
      personal_care: '',
      mobility: '',
      nutrition: { meal: 'unknown', intake: 'unknown', items: [] },
      continence: '',
      mood: '',
      social: '',
      safety_environment: ''
    },
    observations: { vital_signs: {}, medications: [], pain: {} },
    follow_up: { notify_supervisor_RN: false, reason: '' },
    errors_or_gaps: ['json_parse_failed']
  };
}

// ==================================
// 3) Voice commands + smart summary
// ==================================
const voiceCommands = {
  en: ['go back', 'summarize', 'what have i told you', 'skip'],
  es: ['regresar', 'resumir', 'qué te he dicho', 'saltar'],
  fil: ['bumalik', 'ibuod', 'ano ang sinabi ko', 'laktawan'],
  pt: ['voltar', 'resumir', 'o que eu disse', 'pular'],
  hi: ['वापस जाओ', 'सारांश', 'मैंने क्या बताया', 'छोड़ें'],
  bo: ['ཕྱིར་ལོག', 'བསྡུས་དོན', 'ངས་ཁྱོད་ལ་ཅི་ཞིག་བཤད་པ་རེད', 'མཆོང་བ']
};

function getLocalizedResponse(language, type) {
  const responses = {
    goBack: {
      en: 'Of course, let me go back to the previous question.',
      es: 'Por supuesto, volvamos a la pregunta anterior.',
      fil: 'Sige, balik tayo sa nakaraang tanong.',
      pt: 'Claro, vamos voltar à pergunta anterior.',
      hi: 'ज़रूर, चलिए पिछले सवाल पर वापस चलते हैं।',
      bo: 'ལགས་སོ། སྔོན་གྱི་དྲི་བ་དེར་ཕྱིར་ལོག་གི་ཡིན།'
    }
  };
  return responses[type][language] || responses[type]['en'];
}

function generateSmartSummary(shiftData, language = 'en') {
  const summaries = {
    en: `Here's what you've documented so far:

📋 CLIENT INFORMATION
- Name: ${shiftData.client_name || 'Not recorded'}
- Current Status: ${shiftData.observations?.[0] || 'Not assessed'}

🤲 CARE PROVIDED
${(shiftData.care_activities?.length || 0) > 0 ? shiftData.care_activities.map(a => `✓ ${a}`).join('\n') : 'No care activities recorded yet'}

👀 OBSERVATIONS
${(shiftData.observations?.length || 0) > 0 ? shiftData.observations.map(o => `• ${o}`).join('\n') : 'No observations recorded yet'}

💬 CLIENT RESPONSES
${(shiftData.client_responses?.length || 0) > 0 ? shiftData.client_responses.map(r => `• ${r}`).join('\n') : 'No client responses recorded yet'}

📞 COMMUNICATIONS
${(shiftData.communications?.length || 0) > 0 ? shiftData.communications.map(c => `• ${c}`).join('\n') : 'No communications recorded yet'}

Would you like to continue or make any corrections?`,
    es: `Esto es lo que has documentado hasta ahora:

📋 INFORMACIÓN DEL CLIENTE
- Nombre: ${shiftData.client_name || 'No registrado'}
- Estado actual: ${shiftData.observations?.[0] || 'No evaluado'}

🤲 CUIDADOS PROPORCIONADOS
${(shiftData.care_activities?.length || 0) > 0 ? shiftData.care_activities.map(a => `✓ ${a}`).join('\n') : 'Aún no se han registrado actividades de cuidado'}

¿Deseas continuar o hacer alguna corrección?`,
    fil: `Narito ang iyong naidokumento hanggang ngayon:

📋 IMPORMASYON NG KLIYENTE
- Pangalan: ${shiftData.client_name || 'Hindi naitala'}
- Kasalukuyang Kalagayan: ${shiftData.observations?.[0] || 'Hindi pa nasusuri'}

🤲 PANGANGALAGANG IBINIGAY
${(shiftData.care_activities?.length || 0) > 0 ? shiftData.care_activities.map(a => `✓ ${a}`).join('\n') : 'Wala pang naitala na gawain'}

Gusto mo bang magpatuloy o may gustong iwasto?`
  };

  const summary = summaries[language] || summaries['en'];
  return NextResponse.json({ response: summary, updatedShiftData: shiftData, isSummary: true });
}

// ===========================
// 4) Main POST entry point
// ===========================
export async function POST(request) {
  const { input, context, shiftData = {}, conversation, language = 'en' } = await request.json();

  try {
    // A) Local mode (mocks) — unchanged behavior
    if (isLocalMode()) {
      console.log('🏠 Running in LOCAL MODE - Using mock AI responses');

      const mockResponse = mockProcessConversation(input, { context, shiftData, language });

      let updatedShiftData = { ...shiftData };
      if (mockResponse.extractedData) {
        Object.keys(mockResponse.extractedData).forEach(key => {
          if (Array.isArray(updatedShiftData[key])) {
            updatedShiftData[key] = [...updatedShiftData[key], mockResponse.extractedData[key]];
          } else {
            updatedShiftData[key] = mockResponse.extractedData[key];
          }
        });
      }

      // Return original fields for compatibility
      return NextResponse.json({
        response: mockResponse.response,
        updatedShiftData,
        detectedLanguage: mockResponse.language,
        emotionalTone: mockResponse.emotion,
        nextContext: context,
        localMode: true,
        // new (for UI): no paragraph/JSON split in mock
        noteText: mockResponse.response,
        dar: skeletonDAR()
      });
    }

    // B) Voice command intercept (all languages)
    const lower = (input || '').toLowerCase();
    for (const [lang, commands] of Object.entries(voiceCommands)) {
      if (commands.some(cmd => lower.includes(cmd))) {
        // go back
        if (lower.includes(commands[0])) {
          return NextResponse.json({
            response: getLocalizedResponse(lang, 'goBack'),
            updatedShiftData: shiftData,
            goBack: true,
            noteText: '',
            dar: skeletonDAR()
          });
        }
        // summarize
        if (lower.includes(commands[1])) {
          return generateSmartSummary(shiftData, lang);
        }
      }
    }

    // ================================
    // C) Call local Ollama model with DAR prompt
    // ================================
    const sys = SYSTEM_PROMPT_DAR
      + `\n\nContext: ${context || 'none'}\nClient: ${shiftData.client_name || 'unknown'}\nPSW: ${shiftData.psw_name || 'unknown'}\nDetected Lang (hint): ${language}\n`;

    // Use Ollama Client for local AI inference (Qwen3 14B primary)
    const completion = await ollamaClient.chat([
      {
        role: 'system',
        content: sys
      },
      {
        role: 'user',
        content: String(input || '')
      }
    ], {
      temperature: 0.3,
      top_p: 0.9,
      max_tokens: 800,
      quality: 'speed' // Use Qwen3 14B for conversations (fast)
    });

    if (!completion.success) {
      throw new Error(completion.error || 'Ollama chat failed');
    }

    const raw = completion.message?.content || '';

    // D) Split paragraph + JSON
    const firstBrace = raw.indexOf('{');
    const noteText = (firstBrace > 0 ? raw.slice(0, firstBrace) : raw).trim();
    let darJson = extractLastJson(raw);

    if (!darJson) {
      // fallback: skeleton with gap note
      darJson = skeletonDAR();
      darJson.errors_or_gaps.push('model_returned_no_valid_json');
    }

    // E) Validate schema; attach validation errors if any
    const valid = validateDAR(darJson);
    if (!valid) {
      darJson.errors_or_gaps = (darJson.errors_or_gaps || []).concat(['schema_validation_failed']);
    }

    // F) Update your existing shiftData arrays for backward compatibility
    let updatedShiftData = { ...shiftData };
    updatedShiftData.languages_used = updatedShiftData.languages_used || [];
    if (darJson.language && !updatedShiftData.languages_used.includes(darJson.language)) {
      updatedShiftData.languages_used.push(darJson.language);
    }

    // Basic mapping to your older shape (optional; keep your UI working)
    const obsArray = [];
    if (darJson.DAR?.Data) obsArray.push(darJson.DAR.Data);
    if (darJson.observations?.vital_signs) {
      const vs = darJson.observations.vital_signs;
      const vsStr = ['bp', 'hr', 'temp', 'spo2']
        .filter(k => vs[k])
        .map(k => `${k.toUpperCase()}: ${vs[k]}`).join(', ');
      if (vsStr) obsArray.push(`Vitals: ${vsStr}`);
    }

    updatedShiftData.observations = [...(updatedShiftData.observations || []), ...obsArray].filter(Boolean);
    updatedShiftData.care_activities = [
      ...(updatedShiftData.care_activities || []),
      darJson.DAR?.Action || ''
    ].filter(Boolean);
    updatedShiftData.client_responses = [
      ...(updatedShiftData.client_responses || []),
      darJson.DAR?.Response || ''
    ].filter(Boolean);

    // G) Final response: paragraph + DAR JSON (for your new export button)
    return NextResponse.json({
      response: noteText,                // conversational reply if you show it
      noteText,                          // explicit paragraph field
      dar: darJson,                      // structured DAR JSON
      updatedShiftData,
      detectedLanguage: darJson.language || 'unknown',
      emotionalTone: 'empathetic',       // you can refine tone detection later
      nextContext: context
    });

  } catch (error) {
    console.error('AI processing error:', error);
    return NextResponse.json({
      response: 'I understand. Can you tell me more about that?',
      updatedShiftData: shiftData,
      nextContext: context,
      noteText: '',
      dar: skeletonDAR()
    });
  }
}
