#!/usr/bin/env node

/**
 * DAR JSON Integration Test Script
 * Tests the /api/generate-ai-report endpoint with sample PSW conversations
 */

const testCases = [
  {
    name: "Test 1: Basic ADL Care (English)",
    shiftData: {
      client_name: "Margaret Smith",
      psw_name: "Sarah Johnson",
      observations: [
        "Client was alert and oriented times three",
        "Skin appeared dry on lower legs",
        "Client mentioned feeling a bit tired today"
      ],
      care_activities: [
        "Assisted with morning hygiene routine",
        "Helped client get dressed in comfortable clothing",
        "Supported client to walk to dining room for breakfast"
      ],
      client_responses: [
        "Client said 'Thank you dear, you're so helpful'",
        "Client smiled and appeared comfortable",
        "Client ate most of breakfast independently"
      ],
      communications: [],
      languages_used: ["en"]
    },
    conversation: [
      { role: "user", content: "Hi, I'm here with Margaret Smith this morning" },
      { role: "assistant", content: "Good morning! How is Margaret doing today?" },
      { role: "user", content: "She's alert and oriented. I helped her with her morning routine and getting dressed. Her skin looks dry on her legs though." },
      { role: "assistant", content: "That's good to note. How did she respond to the care?" },
      { role: "user", content: "She was really sweet, thanked me and smiled. I walked with her to breakfast and she ate most of it on her own. She did say she feels a bit tired today." }
    ]
  },
  {
    name: "Test 2: Medical Observation - Supervisor Notification Required (English)",
    shiftData: {
      client_name: "John Davis",
      psw_name: "Maria Garcia",
      observations: [
        "Client blood pressure measured at 168/95",
        "Client heart rate 92 bpm",
        "Client reports headache, rated 6 out of 10",
        "Client appears flushed in face"
      ],
      care_activities: [
        "Took vital signs as per care plan",
        "Assisted client to lie down in quiet room",
        "Offered water"
      ],
      client_responses: [
        "Client said 'My head is pounding'",
        "Client accepted water and drank half a glass",
        "Client remained lying down with eyes closed"
      ],
      communications: [
        "Need to notify supervisor about elevated BP and headache"
      ],
      languages_used: ["en"]
    },
    conversation: [
      { role: "user", content: "I'm checking on John Davis. I just took his vitals" },
      { role: "assistant", content: "What did you find?" },
      { role: "user", content: "His blood pressure is 168 over 95, heart rate is 92. He's complaining of a headache, says it's a 6 out of 10. His face looks flushed." },
      { role: "assistant", content: "That blood pressure is elevated. What did you do?" },
      { role: "user", content: "I helped him lie down in a quiet room and gave him some water. He drank half a glass. He's resting now with his eyes closed. He said 'my head is pounding'. I think I need to call the supervisor about this." }
    ]
  },
  {
    name: "Test 3: Mixed Language - Filipino/English",
    shiftData: {
      client_name: "Elena Rodriguez",
      psw_name: "Jessica Santos",
      observations: [
        "Client in good spirits",
        "Client speaking in Tagalog and English",
        "Client mentions missing family"
      ],
      care_activities: [
        "Provided lunch assistance",
        "Engaged in conversation in Tagalog",
        "Assisted with afternoon medication"
      ],
      client_responses: [
        "Client said 'Salamat, napakabait mo' (Thank you, you're so kind)",
        "Client talked about her grandchildren",
        "Client took medication without difficulty"
      ],
      communications: [],
      languages_used: ["tl", "en"]
    },
    conversation: [
      { role: "user", content: "Kumusta po si Elena today?" },
      { role: "assistant", content: "How is Elena doing?" },
      { role: "user", content: "She's in good spirits. I helped her with lunch and we talked in Tagalog. She told me about her apo, her grandchildren. She misses them." },
      { role: "assistant", content: "That's nice that you could speak with her in Tagalog. How did the rest of the visit go?" },
      { role: "user", content: "After lunch I gave her the afternoon meds, she took them no problem. She said 'Salamat, napakabait mo' which means thank you, you're so kind." }
    ]
  },
  {
    name: "Test 4: Medication Administration with Details",
    shiftData: {
      client_name: "Robert Thompson",
      psw_name: "Ahmed Hassan",
      observations: [
        "Client awake and alert at medication time",
        "Client reports no pain today",
        "Client appears relaxed"
      ],
      care_activities: [
        "Administered morning medications from blister pack",
        "Provided full glass of water with medications",
        "Remained with client while medications taken"
      ],
      client_responses: [
        "Client took all four pills without difficulty",
        "Client said 'I'm feeling much better today'",
        "Client thanked PSW"
      ],
      communications: [],
      languages_used: ["en"]
    },
    conversation: [
      { role: "user", content: "Good morning, I'm with Robert Thompson for his morning meds" },
      { role: "assistant", content: "How is Robert this morning?" },
      { role: "user", content: "He's alert and in good spirits. I gave him his four pills from the blister pack with a full glass of water. He took them all without any problems." },
      { role: "assistant", content: "Great. How is he feeling overall?" },
      { role: "user", content: "He said 'I'm feeling much better today'. He reports no pain. He seems relaxed and thanked me before I left." }
    ]
  },
  {
    name: "Test 5: Complex Situation - Pain, Vitals, and Positioning",
    shiftData: {
      client_name: "Dorothy Williams",
      psw_name: "Christine Lee",
      observations: [
        "Client reports lower back pain, 7 out of 10",
        "Blood pressure 142/88, heart rate 78, oxygen saturation 96%",
        "Client grimacing when moving",
        "Noted redness on right heel"
      ],
      care_activities: [
        "Took vital signs",
        "Assisted client to reposition in bed",
        "Placed extra pillow under knees for support",
        "Applied moisturizer to dry skin on heels",
        "Ensured call bell within reach"
      ],
      client_responses: [
        "Client said 'That's better' after repositioning",
        "Client's facial expression relaxed after position change",
        "Client able to rest more comfortably"
      ],
      communications: [
        "Documented redness on heel for wound prevention",
        "Will monitor pain level on next visit"
      ],
      languages_used: ["en"]
    },
    conversation: [
      { role: "user", content: "I'm checking on Dorothy Williams. She's complaining of back pain." },
      { role: "assistant", content: "What's her pain level?" },
      { role: "user", content: "She says it's a 7 out of 10 in her lower back. I took her vitals - BP is 142 over 88, heart rate 78, O2 sat is 96%. She's grimacing when she moves." },
      { role: "assistant", content: "What did you do to help her?" },
      { role: "user", content: "I helped her reposition in bed and put an extra pillow under her knees for support. That seemed to help. She said 'that's better' and her face relaxed. I also noticed some redness on her right heel so I put moisturizer on it." },
      { role: "assistant", content: "Good catch on the heel. Anything else?" },
      { role: "user", content: "I made sure her call bell is within reach. I'll check on her pain again next visit." }
    ]
  }
];

async function runTest(testCase) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🧪 ${testCase.name}`);
  console.log('='.repeat(80));

  try {
    const response = await fetch('http://localhost:3000/api/generate-ai-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shiftData: testCase.shiftData,
        conversation: testCase.conversation
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log('\n✅ Success: Report generated');
      console.log('\n📄 PARAGRAPH NOTE:');
      console.log('-'.repeat(80));
      console.log(data.noteText);
      console.log('-'.repeat(80));

      console.log('\n📋 DAR JSON STRUCTURE:');
      console.log('-'.repeat(80));

      // Validate required fields
      const requiredFields = ['client_name', 'date_time', 'language', 'DAR', 'adls', 'observations', 'follow_up'];
      const missingFields = requiredFields.filter(field => !data.dar || !(field in data.dar));

      if (missingFields.length > 0) {
        console.log(`❌ Missing required fields: ${missingFields.join(', ')}`);
      } else {
        console.log('✅ All required fields present');
      }

      // Check DAR structure
      if (data.dar.DAR) {
        const darFields = ['Data', 'Action', 'Response'];
        const missingDarFields = darFields.filter(field => !data.dar.DAR[field]);
        if (missingDarFields.length > 0) {
          console.log(`❌ DAR missing: ${missingDarFields.join(', ')}`);
        } else {
          console.log('✅ DAR (Data-Action-Response) structure complete');
        }
      }

      // Check for errors or gaps
      if (data.dar.errors_or_gaps && data.dar.errors_or_gaps.length > 0) {
        console.log(`\n⚠️  Errors or Gaps Detected:`);
        data.dar.errors_or_gaps.forEach(error => console.log(`   - ${error}`));
      } else {
        console.log('\n✅ No errors or gaps reported');
      }

      // Display key sections
      console.log('\n📊 Key DAR Elements:');
      console.log(`   Client: ${data.dar.client_name}`);
      console.log(`   Date/Time: ${data.dar.date_time}`);
      console.log(`   Language: ${data.dar.language}`);
      console.log(`   PSW ID: ${data.dar.psw_id || 'not specified'}`);

      if (data.dar.observations && data.dar.observations.vital_signs) {
        const vitals = data.dar.observations.vital_signs;
        if (Object.keys(vitals).length > 0) {
          console.log(`   Vital Signs: ${JSON.stringify(vitals)}`);
        }
      }

      if (data.dar.observations && data.dar.observations.pain) {
        const pain = data.dar.observations.pain;
        if (pain.scale_0_10) {
          console.log(`   Pain: ${pain.scale_0_10}/10 ${pain.location ? `(${pain.location})` : ''}`);
        }
      }

      if (data.dar.follow_up && data.dar.follow_up.notify_supervisor_RN) {
        console.log(`   ⚠️  SUPERVISOR NOTIFICATION REQUIRED: ${data.dar.follow_up.reason || 'See details above'}`);
      }

      // Ontario PSW Scope Check
      console.log('\n🏥 Ontario PSW Scope Compliance:');
      const noteTextLower = data.noteText.toLowerCase();
      const clinicalTerms = ['diagnose', 'diagnosis', 'assess', 'assessment', 'prescribe', 'treatment plan'];
      const foundClinicalTerms = clinicalTerms.filter(term => noteTextLower.includes(term));

      if (foundClinicalTerms.length > 0) {
        console.log(`   ❌ Found clinical terms (outside PSW scope): ${foundClinicalTerms.join(', ')}`);
      } else {
        console.log('   ✅ No clinical diagnoses or assessments detected');
      }

      console.log('\n📄 Full DAR JSON:');
      console.log(JSON.stringify(data.dar, null, 2));

    } else {
      console.log(`\n❌ Failed: ${data.error || 'Unknown error'}`);
      if (data.dar) {
        console.log('\n📄 Fallback DAR JSON returned:');
        console.log(JSON.stringify(data.dar, null, 2));
      }
    }

  } catch (error) {
    console.log(`\n❌ Error: ${error.message}`);
  }
}

async function runAllTests() {
  console.log('\n🚀 Starting DAR JSON Integration Tests');
  console.log(`Testing ${testCases.length} scenarios...\n`);

  for (const testCase of testCases) {
    await runTest(testCase);
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ All tests completed!');
  console.log('='.repeat(80));
  console.log('\nTest Summary:');
  console.log(`- Total test cases: ${testCases.length}`);
  console.log('- Scenarios covered:');
  console.log('  1. Basic ADL care');
  console.log('  2. Medical observation requiring supervisor notification');
  console.log('  3. Mixed language (Filipino/English)');
  console.log('  4. Medication administration');
  console.log('  5. Complex situation with pain and vitals');
  console.log('\n📝 Review the output above to verify:');
  console.log('  ✓ Paragraph notes are concise and professional');
  console.log('  ✓ DAR JSON structure is complete and valid');
  console.log('  ✓ Language detection works correctly');
  console.log('  ✓ No clinical diagnoses in PSW notes');
  console.log('  ✓ Supervisor notifications triggered appropriately');
  console.log('  ✓ Vital signs and observations captured accurately\n');
}

// Run all tests
runAllTests().catch(console.error);
