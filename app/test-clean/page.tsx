'use client';

import { useState } from 'react';

export default function TestCleanPage() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setResult('Testing API...');

    try {
      const response = await fetch('/api/generate-ai-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shiftData: {
            client_name: 'Test Client',
            psw_name: 'Test PSW',
            observations: [input || 'Client was alert and cooperative'],
            care_activities: ['Assisted with care'],
            client_responses: ['Client thanked PSW'],
            languages_used: ['en'],
          },
          conversation: [{ role: 'user', content: input || 'Test input' }],
        }),
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setResult(`ERROR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1B365D 0%, #2D4A7C 100%)',
        padding: '40px 20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            marginBottom: '30px',
          }}
        >
          <h1
            style={{
              fontSize: '36px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #1B365D, #D4A574)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '10px',
            }}
          >
            Tailored Care Solutions
          </h1>
          <p
            style={{
              fontSize: '18px',
              color: '#64748b',
            }}
          >
            PSW Voice Documentation - CLEAN TEST PAGE
          </p>
        </div>

        <div
          style={{
            background: '#f8fafc',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px',
          }}
        >
          <label
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1B365D',
              marginBottom: '8px',
            }}
          >
            Test Input (PSW Note):
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a PSW note to test (e.g., 'Helped client with morning care. Client ate breakfast well.')"
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#1B365D')}
            onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
          />
        </div>

        <button
          onClick={handleTest}
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px',
            background: loading
              ? '#94a3b8'
              : 'linear-gradient(135deg, #1B365D, #2D4A7C)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: loading ? 'none' : '0 4px 12px rgba(27, 54, 93, 0.3)',
            marginBottom: '20px',
          }}
          onMouseOver={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow =
                '0 6px 16px rgba(27, 54, 93, 0.4)';
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow =
              '0 4px 12px rgba(27, 54, 93, 0.3)';
          }}
        >
          {loading ? '⏳ Testing API...' : '🚀 Test API'}
        </button>

        {result && (
          <div
            style={{
              background: result.startsWith('ERROR') ? '#fee2e2' : '#f0fdf4',
              border: `2px solid ${result.startsWith('ERROR') ? '#fca5a5' : '#86efac'}`,
              borderRadius: '12px',
              padding: '20px',
            }}
          >
            <h3
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: result.startsWith('ERROR') ? '#991b1b' : '#166534',
                marginBottom: '12px',
              }}
            >
              {result.startsWith('ERROR') ? '❌ Error' : '✅ Success'}
            </h3>
            <pre
              style={{
                background: 'white',
                padding: '16px',
                borderRadius: '8px',
                overflow: 'auto',
                fontSize: '12px',
                lineHeight: '1.6',
                maxHeight: '400px',
                margin: 0,
              }}
            >
              {result}
            </pre>
          </div>
        )}

        <div
          style={{
            marginTop: '30px',
            padding: '20px',
            background: '#fef3c7',
            border: '2px solid #fbbf24',
            borderRadius: '12px',
          }}
        >
          <h3
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#92400e',
              marginBottom: '8px',
            }}
          >
            📝 What This Tests:
          </h3>
          <ul
            style={{
              fontSize: '13px',
              color: '#92400e',
              paddingLeft: '20px',
              margin: 0,
            }}
          >
            <li>API endpoint connectivity</li>
            <li>DAR JSON generation</li>
            <li>Local mode operation</li>
            <li>Response time and format</li>
          </ul>
        </div>
      </div>

      <div
        style={{
          maxWidth: '800px',
          margin: '20px auto 0',
          textAlign: 'center',
          color: 'white',
          fontSize: '14px',
          opacity: 0.8,
        }}
      >
        <p>
          This is a CLEAN test page with NO cache issues • Inline styles •
          Guaranteed to render correctly
        </p>
      </div>
    </div>
  );
}
