#!/usr/bin/env node

async function testAPI() {
  console.log('🧪 Testing DAR JSON API endpoint...\n');

  try {
    const testData = {
      shiftData: {
        client_name: "Margaret Smith",
        psw_name: "Sarah Johnson",
        observations: ["Client alert and oriented", "Skin appeared dry on lower legs"],
        care_activities: ["Assisted with morning hygiene", "Helped client get dressed"],
        client_responses: ["Client said 'Thank you dear'", "Client smiled and appeared comfortable"],
        communications: [],
        languages_used: ["en"]
      },
      conversation: [
        { role: "user", content: "Hi, I'm here with Margaret Smith this morning" },
        { role: "assistant", content: "Good morning! How is Margaret doing?" },
        { role: "user", content: "She's alert and oriented. I helped her with her morning routine." }
      ]
    };

    console.log('📤 Sending request to http://localhost:3000/api/generate-ai-report\n');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch('http://localhost:3000/api/generate-ai-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log(`📥 Response Status: ${response.status} ${response.statusText}\n`);

    const data = await response.json();

    if (data.success) {
      console.log('✅ SUCCESS!\n');
      console.log('📄 PARAGRAPH NOTE:');
      console.log('-'.repeat(80));
      console.log(data.noteText);
      console.log('-'.repeat(80));

      console.log('\n📋 DAR JSON RECEIVED:');
      console.log('Client:', data.dar.client_name);
      console.log('Date/Time:', data.dar.date_time);
      console.log('Language:', data.dar.language);
      console.log('PSW ID:', data.dar.psw_id);

      if (data.dar.DAR) {
        console.log('\n📊 DAR Structure:');
        console.log('  Data:', data.dar.DAR.Data ? '✅ Present' : '❌ Missing');
        console.log('  Action:', data.dar.DAR.Action ? '✅ Present' : '❌ Missing');
        console.log('  Response:', data.dar.DAR.Response ? '✅ Present' : '❌ Missing');
      }

      if (data.dar.errors_or_gaps && data.dar.errors_or_gaps.length > 0) {
        console.log('\n⚠️  Errors/Gaps:', data.dar.errors_or_gaps.join(', '));
      } else {
        console.log('\n✅ No errors or gaps reported');
      }

      console.log('\n📄 Full DAR JSON:');
      console.log(JSON.stringify(data.dar, null, 2));

      if (data.localMode) {
        console.log('\n🏠 Running in LOCAL MODE (using mock data)');
      }

    } else {
      console.log('❌ FAILED:', data.error || 'Unknown error');
      if (data.dar) {
        console.log('\n📄 Fallback DAR returned:');
        console.log(JSON.stringify(data.dar, null, 2));
      }
    }

  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('❌ Request timed out after 10 seconds');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

testAPI();
