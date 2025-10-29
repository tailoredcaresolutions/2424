import { NextResponse } from 'next/server';
import { mockGenerateReport, isLocalMode } from '@/lib/mocks/mockAI';
import Ajv from 'ajv';

// Initialize AJV for JSON schema validation
const ajv = new Ajv({ allErrors: true, strict: false });

// DAR JSON Schema (Ontario PSW Documentation Standard)
const darSchema = {
  type: "object",
  required: ["client_name", "date_time", "language", "DAR", "adls", "observations", "follow_up"],
  properties: {
    client_name: { type: "string" },
    date_time: { type: "string" },
    language: { type: "string" },
    DAR: {
      type: "object",
      required: ["Data", "Action", "Response"],
      properties: {
        Data: { type: "string" },
        Action: { type: "string" },
        Response: { type: "string" }
      }
    },
    adls: {
      type: "object",
      properties: {
        personal_care: { type: "string" },
        mobility: { type: "string" },
        nutrition: {
          type: "object",
          properties: {
            meal: { type: "string" },
            intake: { type: "string" },
            items: { type: "array", items: { type: "string" } }
          },
          required: ["meal", "intake"]
        },
        continence: { type: "string" },
        mood: { type: "string" },
        social: { type: "string" },
        safety_environment: { type: "string" }
      }
    },
    observations: {
      type: "object",
      properties: {
        vital_signs: {
          type: "object",
          properties: {
            bp: { type: "string" },
            hr: { type: "string" },
            temp: { type: "string" },
            spo2: { type: "string" }
          }
        },
        medications: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              dose: { type: "string" },
              time: { type: "string" },
              source: { type: "string" }
            },
            required: ["name"]
          }
        },
        pain: {
          type: "object",
          properties: {
            scale_0_10: { type: ["number", "string"] },
            location: { type: "string" }
          }
        }
      }
    },
    follow_up: {
      type: "object",
      properties: {
        notify_supervisor_RN: { type: ["boolean", "string"] },
        reason: { type: "string" }
      }
    },
    psw_id: { type: "string" },
    errors_or_gaps: {
      type: "array",
      items: { type: "string" }
    }
  }
};

const validateDAR = ajv.compile(darSchema);

// DAR JSON System Prompt (Ontario PSW Documentation Standard)
const SYSTEM_PROMPT_DAR = `You convert a PSW's casual speech into a concise, non-clinical progress note and a DAR JSON summary.

Rules (must follow):
- Ontario PSW scope: PSWs document observations and care completed; they do NOT diagnose or create clinical "assessments" or "plans." If clinical issues are mentioned, record them as observations and add "notify supervisor/RN".
- Style: plain language, objective, short sentences. No medical jargon or advice.
- Include client quotes when helpful. Capture exact numbers (e.g., "120/80").
- If medications, vitals, or symptoms are mentioned, record them as "reported/observed" only.
- Output both: (A) a brief paragraph note; (B) valid JSON (UTF-8, no code fences) using this schema:

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

When unsure, write "unknown" instead of guessing. Output the paragraph first, then the JSON.`;

// Extract last JSON object from text
function extractLastJson(text) {
  const lastOpen = text.lastIndexOf("{");
  if (lastOpen === -1) return null;

  let candidate = text.slice(lastOpen).trim();

  try {
    return JSON.parse(candidate);
  } catch (e) {
    // Try to find the closing brace
    let braceCount = 0;
    let endIdx = -1;

    for (let i = 0; i < candidate.length; i++) {
      if (candidate[i] === '{') braceCount++;
      if (candidate[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          endIdx = i + 1;
          break;
        }
      }
    }

    if (endIdx > 0) {
      candidate = candidate.slice(0, endIdx);
      try {
        return JSON.parse(candidate);
      } catch (e2) {
        return null;
      }
    }

    return null;
  }
}

// Create fallback DAR JSON
function createFallbackDAR(shiftData) {
  return {
    client_name: shiftData.client_name || "unknown",
    date_time: new Date().toISOString(),
    language: shiftData.languages_used?.[0] || "en",
    DAR: {
      Data: shiftData.observations?.join(". ") || "",
      Action: shiftData.care_activities?.join(". ") || "",
      Response: shiftData.client_responses?.join(". ") || ""
    },
    adls: {
      personal_care: "",
      mobility: "",
      nutrition: {
        meal: "unknown",
        intake: "unknown",
        items: []
      },
      continence: "",
      mood: "",
      social: "",
      safety_environment: ""
    },
    observations: {
      vital_signs: {},
      medications: [],
      pain: {}
    },
    follow_up: {
      notify_supervisor_RN: false,
      reason: ""
    },
    psw_id: shiftData.psw_name || "",
    errors_or_gaps: ["json_parse_failed", "using_fallback_data"]
  };
}

export async function POST(request) {
  const { shiftData: providedShiftData, conversation } = await request.json();

  // Extract shiftData from conversation if not provided
  const shiftData = providedShiftData || {
    client_name: "Unknown Client",
    psw_name: "PSW",
    observations: [],
    care_activities: [],
    client_responses: [],
    communications: [],
    languages_used: []
  };

  try {
    // 🏠 LOCAL MODE - Use mock report generation
    // Check both NEXT_PUBLIC and regular env vars for server-side
    const localMode = isLocalMode() ||
                     !process.env.OPENAI_API_KEY ||
                     process.env.OPENAI_API_KEY === 'local_development_mode_no_key_needed';

    if (localMode) {
      console.log('🏠 Running in LOCAL MODE - Using DAR JSON format');

      const mockReport = mockGenerateReport(shiftData);

      // Create a simple DAR JSON for local mode
      const localDAR = {
        client_name: shiftData.client_name || "Test Client",
        date_time: new Date().toISOString(),
        language: "en",
        DAR: {
          Data: shiftData.observations?.join(". ") || "Client observed during shift.",
          Action: shiftData.care_activities?.join(". ") || "Provided standard care.",
          Response: shiftData.client_responses?.join(". ") || "Client responded well."
        },
        adls: {
          personal_care: "Assisted with hygiene needs",
          mobility: "Ambulatory with assistance",
          nutrition: {
            meal: "lunch",
            intake: "most",
            items: ["sandwich", "water"]
          },
          continence: "No issues reported",
          mood: "Pleasant and cooperative",
          social: "Engaged in conversation",
          safety_environment: "Safe environment maintained"
        },
        observations: {
          vital_signs: {},
          medications: [],
          pain: {}
        },
        follow_up: {
          notify_supervisor_RN: false,
          reason: ""
        },
        psw_id: shiftData.psw_name || "Test PSW",
        errors_or_gaps: []
      };

      const noteText = `${shiftData.client_name || 'Client'} was observed during the shift. ${mockReport.report.substring(0, 200)}...`;

      return NextResponse.json({
        success: true,
        noteText,
        dar: localDAR,
        localMode: true
      });
    }

    // Prepare conversation summary for AI
    const conversationSummary = conversation?.map(msg =>
      `${msg.role === 'user' ? 'PSW' : 'System'}: ${msg.content}`
    ).join('\n') || '';

    const userPrompt = `Convert this PSW shift documentation into a concise paragraph note and DAR JSON:

PSW: ${shiftData.psw_name}
Client: ${shiftData.client_name}
Shift Date: ${new Date().toLocaleDateString('en-CA')}

CONVERSATION TRANSCRIPT:
${conversationSummary}

OBSERVATIONS:
${shiftData.observations?.join('\n') || 'None recorded'}

CARE PROVIDED:
${shiftData.care_activities?.join('\n') || 'None recorded'}

CLIENT RESPONSES:
${shiftData.client_responses?.join('\n') || 'None recorded'}

COMMUNICATIONS:
${shiftData.communications?.join('\n') || 'None recorded'}

Remember: Output (A) brief paragraph first, then (B) valid JSON. Use plain language, no medical jargon.`;

    // Call backend Ollama chat endpoint (supports Vercel + local Cloudflare tunnel)
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:4000';
    const ollamaResponse = await fetch(`${backendUrl}/api/ollama/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT_DAR },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2500,
        quality: 'balanced'
      })
    });

    const ollamaPayload = await ollamaResponse.text();

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama chat request failed: ${ollamaResponse.status} ${ollamaResponse.statusText} - ${ollamaPayload}`);
    }

    let completion;
    try {
      completion = JSON.parse(ollamaPayload);
    } catch (parseError) {
      throw new Error(`Failed to parse Ollama response: ${(parseError instanceof Error && parseError.message) || 'Unknown error'} - ${ollamaPayload}`);
    }

    if (!completion.success) {
      throw new Error(completion.error || 'Ollama chat failed');
    }

    const llmText = completion.message?.content || completion.response || '';

    // Extract paragraph (everything before JSON)
    const paragraph = llmText.split("{")[0].trim();

    // Extract JSON
    let darJson = extractLastJson(llmText);

    // Fallback if JSON extraction failed
    if (!darJson) {
      console.warn('JSON extraction failed, using fallback DAR');
      darJson = createFallbackDAR(shiftData);
    }

    // Validate JSON schema
    const isValid = validateDAR(darJson);
    if (!isValid) {
      console.warn('DAR JSON validation failed:', validateDAR.errors);
      darJson.errors_or_gaps = darJson.errors_or_gaps || [];
      darJson.errors_or_gaps.push("schema_validation_failed");
    }

    // Ensure errors_or_gaps exists
    if (!darJson.errors_or_gaps) {
      darJson.errors_or_gaps = [];
    }

    return NextResponse.json({
      success: true,
      noteText: paragraph,
      dar: darJson
    });

  } catch (error) {
    console.error('AI Report Generation Error:', error);

    // Return fallback DAR JSON on error
    const fallbackDAR = createFallbackDAR(shiftData);
    fallbackDAR.errors_or_gaps.push("api_error");

    return NextResponse.json({
      success: false,
      error: 'Failed to generate DAR report',
      noteText: `Documentation for ${shiftData.client_name || 'client'} on ${new Date().toLocaleDateString('en-CA')}. Error occurred during report generation.`,
      dar: fallbackDAR
    }, { status: 500 });
  }
}
