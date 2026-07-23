import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Mic, MicOff, Volume2, VolumeX, Sparkles, User, RefreshCw, BookOpen, Flame, Award } from 'lucide-react';
import { aiService } from '../services/aiService';
import { storageService } from '../services/storageService';
import { voiceService } from '../services/voiceService';

export default function AIMentorChat({ onNotify }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('apex_learn_mentor_chat');
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      const initial = [
        {
          id: 'welcome-1',
          sender: 'ai',
          text: `👋 **Welcome to Apex AI Mentor!**\n\nI have full context of your active roadmap, study streak, completed sessions, and syllabus goals. Ask me to explain difficult topics, clarify concepts, debug code, or give personalized study strategy!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setMessages(initial);
      localStorage.setItem('apex_learn_mentor_chat', JSON.stringify(initial));
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const saveMessages = (newMsgs) => {
    setMessages(newMsgs);
    localStorage.setItem('apex_learn_mentor_chat', JSON.stringify(newMsgs));
  };

  const handleSend = async (textToSend = null) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    setInput('');

    const userMsg = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [...messages, userMsg];
    saveMessages(updated);
    setLoading(true);

    try {
      const profile = storageService.getUserProfile();
      const logs = storageService.getStudyLogs();
      const roadmap = storageService.getLearningPath();
      const xpData = storageService.calculateXPAndLevel(logs);

      const context = {
        goal: profile.goal || 'Developer',
        skills: profile.skills || 'Intermediate',
        durationWeeks: profile.durationWeeks || 4,
        roadmapTitle: roadmap?.title || profile.goal,
        streak: logs.streak || 0,
        totalMinutes: logs.totalMinutes || 0,
        completedSessions: logs.completedSessions || 0,
        level: xpData.level,
        totalXP: xpData.totalXP
      };

      const replyText = await aiService.chatWithAIMentor(query, updated, context);

      const aiMsg = {
        id: 'msg-ai-' + Date.now(),
        sender: 'ai',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalMsgs = [...updated, aiMsg];
      saveMessages(finalMsgs);

      if (speechEnabled) {
        voiceService.speak(replyText);
      }
    } catch (err) {
      onNotify('Failed to connect to AI Mentor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVoiceInput = () => {
    if (!voiceService.isSupported()) {
      onNotify('Voice recognition is not supported in your browser.', 'error');
      return;
    }

    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      voiceService.startListening(
        (transcript) => {
          setInput(transcript);
          setIsListening(false);
        },
        (err) => {
          onNotify(`Voice Error: ${err}`, 'error');
          setIsListening(false);
        },
        () => setIsListening(false)
      );
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Clear conversation history with your AI Mentor?")) {
      const initial = [
        {
          id: 'welcome-1',
          sender: 'ai',
          text: `👋 **Chat Cleared!** How can I assist your study goals today?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      saveMessages(initial);
    }
  };

  const promptChips = [
    "💡 Explain my next study topic in simple terms",
    "⚡ Give me a 5-minute summary of Week 1",
    "🎯 How can I improve my quiz scores?",
    "🔥 Give me a motivational push for my streak!"
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 180px)', minHeight: '520px' }}>
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '16px 20px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(16, 185, 129, 0.15))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '12px', color: 'var(--primary)' }}>
            <Bot size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Apex AI Mentor Chat</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Context-Aware AI Assistant • Remembers your roadmap, streak, and quiz performance.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className={`btn btn-sm ${speechEnabled ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSpeechEnabled(!speechEnabled)}
            title="Toggle Text-to-Speech Voice Responses"
          >
            {speechEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>Voice Audio: {speechEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button className="btn btn-secondary btn-sm" onClick={handleClearHistory} title="Clear Chat History">
            <RefreshCw size={14} /> Clear
          </button>
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '0' }}>
        {/* Messages Scroll Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: '12px',
                  flexDirection: isUser ? 'row-reverse' : 'row',
                  alignItems: 'flex-start'
                }}
              >
                <div
                  style={{
                    padding: '8px',
                    borderRadius: '10px',
                    background: isUser ? 'var(--primary)' : 'rgba(16, 185, 129, 0.2)',
                    color: isUser ? '#fff' : 'var(--accent-emerald)',
                    flexShrink: 0
                  }}
                >
                  {isUser ? <User size={18} /> : <Bot size={18} />}
                </div>

                <div
                  style={{
                    maxWidth: '80%',
                    padding: '14px 18px',
                    borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                    background: isUser ? 'linear-gradient(135deg, var(--primary), var(--primary-hover))' : 'rgba(15, 23, 42, 0.8)',
                    border: isUser ? 'none' : '1px solid var(--border-light)',
                    color: 'var(--text-main)',
                    fontSize: '0.92rem',
                    lineHeight: '1.5'
                  }}
                >
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                  <div style={{ fontSize: '0.72rem', color: isUser ? 'rgba(255,255,255,0.7)' : 'var(--text-subtle)', marginTop: '6px', textAlign: isUser ? 'right' : 'left' }}>
                    {msg.time}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-emerald)' }}>
                <Bot size={18} />
              </div>
              <div style={{ padding: '12px 18px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-light)', borderRadius: '4px 16px 16px 16px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                <Sparkles size={16} className="spin" style={{ display: 'inline', marginRight: '6px', color: 'var(--accent-cyan)' }} />
                Apex Mentor AI is thinking...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Chips */}
        <div style={{ padding: '8px 16px', background: 'rgba(15, 23, 42, 0.6)', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {promptChips.map((chip, idx) => (
            <button
              key={idx}
              className="btn btn-secondary btn-sm"
              onClick={() => handleSend(chip)}
              style={{ fontSize: '0.76rem', flexShrink: 0 }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          style={{ padding: '14px 16px', background: 'rgba(15, 23, 42, 0.95)', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '10px', alignItems: 'center' }}
        >
          <button
            type="button"
            onClick={handleToggleVoiceInput}
            className={`btn btn-icon ${isListening ? 'btn-accent' : 'btn-secondary'}`}
            title={isListening ? 'Listening... Click to stop' : 'Click to Speak'}
            style={{ color: isListening ? 'var(--accent-rose)' : 'var(--text-subtle)' }}
          >
            {isListening ? <MicOff size={18} className="pulse" /> : <Mic size={18} />}
          </button>

          <input
            type="text"
            className="form-input"
            style={{ flex: 1 }}
            placeholder={isListening ? "Listening to your voice..." : "Ask your AI Mentor anything about your roadmap, concepts, or code..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <button type="submit" className="btn btn-primary" disabled={!input.trim() || loading}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
