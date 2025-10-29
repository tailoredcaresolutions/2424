/**
 * Mock AI Services for Local Development
 * Provides realistic responses without external API calls
 */

// Mock conversational responses based on common PSW scenarios
const conversationResponses = {
  greeting: [
    "Hello! I'm ready to help you document your PSW shift. Let's start with the client's information. Who are you caring for today?",
    "Hi there! Ready to record your shift. Can you tell me the client's name?",
    "Good day! Let's document your care visit. What's the client's name?"
  ],

  clientInfo: [
    "Thank you. What time did you arrive at the client's home?",
    "Got it. When did your shift start?",
    "Noted. What time did you begin care today?"
  ],

  activities: [
    "That's helpful. What activities or care tasks did you complete during this visit?",
    "Thank you. Can you describe the care you provided?",
    "I see. What specific care activities did you perform?"
  ],

  observations: [
    "Good. Did you notice anything unusual about the client's condition, mood, or behavior?",
    "Thank you. Were there any changes in the client's health or wellbeing?",
    "Noted. Any observations about the client's physical or emotional state?"
  ],

  vitals: [
    "Would you like to record any vital signs? Blood pressure, temperature, pulse?",
    "Did you measure any vital signs during this visit?",
    "Should we record any health measurements?"
  ],

  meals: [
    "What about meals? Did you help prepare or serve any food?",
    "Can you tell me about any meals or nutrition support provided?",
    "Did the client eat during your visit? What did they have?"
  ],

  summary: [
    "Let me summarize what you've told me. Does this sound correct?",
    "Here's what I've documented. Is this accurate?",
    "I'll read back your report. Please confirm if everything is correct."
  ]
};

// Mock report templates
const reportTemplates = {
  standard: (data) => `
PERSONAL SUPPORT WORKER SHIFT REPORT

Date: ${data.date || new Date().toLocaleDateString('en-CA')}
PSW Name: ${data.pswName || 'Test PSW'}
Client Name: ${data.clientName || 'Test Client'}
Shift Time: ${data.startTime || '09:00'} - ${data.endTime || '17:00'}

CARE PROVIDED:
${data.activities || 'Personal care, meal preparation, and companionship provided as per care plan.'}

OBSERVATIONS:
${data.observations || 'Client was alert and oriented. Mood was stable. No concerns noted.'}

VITAL SIGNS:
${data.vitals || 'Blood Pressure: 120/80 mmHg\nPulse: 72 bpm\nTemperature: 36.8°C'}

MEALS AND NUTRITION:
${data.meals || 'Breakfast and lunch prepared and consumed without difficulty. Adequate fluid intake maintained.'}

ADDITIONAL NOTES:
${data.notes || 'No incidents or concerns to report. All care activities completed as planned.'}

SIGNATURE: ${data.pswName || 'Test PSW'}
Date: ${new Date().toLocaleString('en-CA')}
`,

  clinical: (data) => `
CLINICAL DOCUMENTATION - PSW VISIT

CLIENT INFORMATION:
Name: ${data.clientName || 'Test Client'}
Date of Visit: ${data.date || new Date().toLocaleDateString('en-CA')}
Time: ${data.startTime || '09:00'} - ${data.endTime || '17:00'}

PHYSICAL ASSESSMENT:
${data.physicalAssessment || 'Client ambulating independently. No visible signs of distress. Skin integrity intact.'}

COGNITIVE STATUS:
${data.cognitiveStatus || 'Alert and oriented x3 (person, place, time). Communicating clearly.'}

ACTIVITIES OF DAILY LIVING:
- Bathing: ${data.bathing || 'Assisted with shower, client cooperative'}
- Dressing: ${data.dressing || 'Minimal assistance required'}
- Mobility: ${data.mobility || 'Independent with walker'}
- Toileting: ${data.toileting || 'Independent'}

MEDICATION REMINDERS:
${data.medications || 'Reminded client to take morning medications as prescribed.'}

SAFETY CONCERNS:
${data.safety || 'None identified. Environment safe and accessible.'}

FOLLOW-UP REQUIRED:
${data.followUp || 'Continue with current care plan. No immediate concerns.'}

Documented by: ${data.pswName || 'Test PSW'}
`
};

// Mock AI conversation processor
export function mockProcessConversation(input, context = {}) {
  // Handle undefined or null input
  if (!input || typeof input !== 'string') {
    return {
      response: "I'm sorry, I didn't catch that. Could you please repeat?",
      extractedData: {},
      emotion: 'supportive',
      language: context.language || 'en',
      confidence: 0.5
    };
  }
  
  const inputLower = input.toLowerCase();

  // Detect context/stage of conversation
  let responseType = 'clientInfo';

  if (inputLower.includes('hello') || inputLower.includes('hi') || inputLower.includes('start')) {
    responseType = 'greeting';
  } else if (inputLower.includes('name') || inputLower.includes('client')) {
    responseType = 'clientInfo';
  } else if (inputLower.includes('activity') || inputLower.includes('care') || inputLower.includes('help')) {
    responseType = 'activities';
  } else if (inputLower.includes('observe') || inputLower.includes('notice') || inputLower.includes('mood')) {
    responseType = 'observations';
  } else if (inputLower.includes('vital') || inputLower.includes('blood pressure') || inputLower.includes('temperature')) {
    responseType = 'vitals';
  } else if (inputLower.includes('meal') || inputLower.includes('food') || inputLower.includes('eat')) {
    responseType = 'meals';
  } else if (inputLower.includes('summary') || inputLower.includes('done') || inputLower.includes('finish')) {
    responseType = 'summary';
  }

  // Random response selection for variety
  const responses = conversationResponses[responseType];
  const response = responses[Math.floor(Math.random() * responses.length)];

  // Extract structured data from input
  const extractedData = extractDataFromInput(input, responseType);

  return {
    response,
    extractedData,
    emotion: 'supportive',
    language: context.language || 'en',
    confidence: 0.95
  };
}

// Mock data extraction
function extractDataFromInput(input, context) {
  const data = {};

  // Simple pattern matching for common data points
  const timePattern = /(\d{1,2}):(\d{2})\s*(am|pm)?/i;
  const timeMatch = input.match(timePattern);
  if (timeMatch) {
    data.time = timeMatch[0];
  }

  // Extract names (capitalized words)
  const namePattern = /(?:named?|called)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/;
  const nameMatch = input.match(namePattern);
  if (nameMatch) {
    data.name = nameMatch[1];
  }

  // Detect vital signs
  if (input.includes('blood pressure') || input.match(/\d{2,3}\/\d{2,3}/)) {
    const bpMatch = input.match(/(\d{2,3})\/(\d{2,3})/);
    if (bpMatch) {
      data.bloodPressure = bpMatch[0];
    }
  }

  return data;
}

// Mock report generation
export function mockGenerateReport(shiftData) {
  const reportType = shiftData.reportType || 'standard';
  const template = reportTemplates[reportType] || reportTemplates.standard;

  return {
    report: template(shiftData),
    generatedAt: new Date().toISOString(),
    format: 'text/plain'
  };
}

// Mock text-to-speech
export function mockTextToSpeech(text) {
  console.log('🎤 Mock TTS:', text);

  return {
    audioUrl: 'data:audio/wav;base64,mock_audio_data',
    duration: text.length * 0.05, // Approximate duration in seconds
    text
  };
}

// Mock translation
export function mockTranslateText(text, targetLanguage) {
  const translations = {
    es: { hello: 'hola', goodbye: 'adiós', thank: 'gracias' },
    fr: { hello: 'bonjour', goodbye: 'au revoir', thank: 'merci' },
    tl: { hello: 'kamusta', goodbye: 'paalam', thank: 'salamat' },
    pt: { hello: 'olá', goodbye: 'tchau', thank: 'obrigado' }
  };

  // Simple mock translation (just log in real app)
  console.log(`<
 Mock Translation to ${targetLanguage}:`, text);

  return {
    translatedText: `[${targetLanguage.toUpperCase()}] ${text}`,
    sourceLanguage: 'en',
    targetLanguage
  };
}

// Check if we're in local mode
export function isLocalMode() {
  return process.env.NEXT_PUBLIC_ENVIRONMENT === 'local' ||
         process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
}

// Mock client database for testing
export const mockClients = [
  {
    id: 1,
    name: 'Margaret Smith',
    age: 78,
    address: '123 Maple Street, Toronto, ON',
    conditions: ['Diabetes', 'Hypertension'],
    medications: ['Metformin', 'Lisinopril'],
    careplan: 'Assistance with ADLs, meal preparation, medication reminders'
  },
  {
    id: 2,
    name: 'John Wilson',
    age: 82,
    address: '456 Oak Avenue, Toronto, ON',
    conditions: ['Arthritis', 'COPD'],
    medications: ['Prednisone', 'Albuterol'],
    careplan: 'Mobility assistance, respiratory monitoring, companionship'
  },
  {
    id: 3,
    name: 'Elizabeth Chen',
    age: 75,
    address: '789 Pine Road, Toronto, ON',
    conditions: ['Dementia', 'Heart Disease'],
    medications: ['Donepezil', 'Atorvastatin'],
    careplan: 'Supervision, personal care, memory support activities'
  }
];

const mockAI = {
  mockProcessConversation,
  mockGenerateReport,
  mockTextToSpeech,
  mockTranslateText,
  isLocalMode,
  mockClients
};

export default mockAI;
