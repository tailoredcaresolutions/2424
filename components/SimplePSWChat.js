'use client';

import React, { useState, useRef, useEffect } from 'react';

const SimplePSWChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasVoiceSupport, setHasVoiceSupport] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check for voice support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && window.speechSynthesis) {
      setHasVoiceSupport(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-CA';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMsg = {
        role: 'assistant',
        content: "Hi! I'm here to help you document your PSW shift. What's your name?",
        timestamp: new Date()
      };
      setMessages([welcomeMsg]);
      // Speak welcome message
      speakMessage(welcomeMsg.content);
    }
  }, [messages.length]);

  const speakMessage = (text) => {
    if (!window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-CA';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      const response = await fetch('/api/process-conversation-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: userMessage.content,
          conversationHistory: [...messages, userMessage],
          language: 'en-CA'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const aiMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // Speak AI response
        speakMessage(data.response);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMsg = {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
      speakMessage(errorMsg.content);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateReport = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/generate-ai-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation: messages,
          language: 'en-CA'
        })
      });

      const data = await response.json();
      if (data.success) {
        const reportMsg = {
          role: 'assistant',
          content: `✅ **Report Generated**\n\n${data.noteText || data.report}`,
          timestamp: new Date(),
          isReport: true
        };
        setMessages(prev => [...prev, reportMsg]);
        speakMessage('Your report has been generated successfully.');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleVoice = () => {
    if (!hasVoiceSupport) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold">
            TC
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-900">PSW Documentation</h1>
            <p className="text-xs text-gray-500">Tailored Care Solutions {isSpeaking && '🔊 Speaking...'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isSpeaking && (
            <button
              onClick={toggleSpeech}
              className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors"
            >
              🔇 Stop
            </button>
          )}
          {messages.length > 2 && (
            <button
              onClick={generateReport}
              disabled={isProcessing}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              Generate Report
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-amber-500 text-white'
                    : message.isReport
                    ? 'bg-green-50 border border-green-200 text-gray-900'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
                <p className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-amber-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-gray-200 bg-white px-4 py-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex gap-3">
            {hasVoiceSupport && (
              <button
                type="button"
                onClick={toggleVoice}
                disabled={isProcessing || isSpeaking}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                } disabled:opacity-50`}
              >
                {isListening ? '⏹️' : '🎤'}
              </button>
            )}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={hasVoiceSupport ? "Type or click 🎤 to speak..." : "Type your message..."}
              disabled={isProcessing || isListening || isSpeaking}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 text-sm"
            />
            <button
              type="submit"
              disabled={!input.trim() || isProcessing || isListening || isSpeaking}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimplePSWChat;
