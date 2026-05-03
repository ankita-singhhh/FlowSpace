import { useState, useRef, useEffect } from 'react';
import { Brain, X, Send } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';

export default function AIChatbot() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const textareaRef = useRef(null);

  // Check API status when component mounts
  useEffect(() => {
    if (!user) return;

    const checkAPIStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('fs_token')}`
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'Hello' }],
            max_tokens: 1000
          })
        });

        if (response.ok) {
          setMessages([{
            id: 1,
            type: 'system',
            content: `🤖 **FlowSpace AI is Ready!**

I'm powered by Google Gemini and here to help you with:

- **Task Management**: "Create task: Finish report by Friday"
- **Daily Planning**: "What should I focus on today?"
- **Weekly Planning**: "Plan my week"
- **Productivity Advice**: "Help me prioritize my work"
- **Natural Language**: Just tell me what you need!

Try asking me anything about your productivity! 🚀`,
            timestamp: new Date().toISOString()
          }]);
        } else {
          setMessages([{
            id: 1,
            type: 'system',
            content: `🤖 **AI Chatbot Setup Required**

Choose a FREE AI provider to get started:

## 🆓 **Google Gemini (Recommended - 100% Free)**
1. **Get API Key**: [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **No credit card required**
3. **60 requests per minute** free tier
4. **Add to .env file**: GEMINI_API_KEY=your-key-here
5. **Restart backend server**

## 🚀 **What the AI Can Do:**
- Create tasks from natural language
- Plan your weekly schedule
- Give productivity advice
- Help prioritize your work

**Start with Google Gemini - it is completely free!** 🎯`,
            timestamp: new Date().toISOString()
          }]);
        }
      } catch (error) {
        setMessages([{
          id: 1,
          type: 'system',
          content: `🤖 **AI Chatbot Setup Required**

Choose a FREE AI provider to get started:

## 🆓 **Google Gemini (Recommended - 100% Free)**
1. **Get API Key**: [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **No credit card required**
3. **60 requests per minute** free tier
4. **Add to .env file**: GEMINI_API_KEY=your-key-here
5. **Restart backend server`

## 🚀 **What the AI Can Do:**
- Create tasks from natural language
- Plan your weekly schedule
- Give productivity advice
- Help prioritize your work

**Start with Google Gemini - it is completely free!** 🎯`,
          timestamp: new Date().toISOString()
        }]);
      }
    };

    checkAPIStatus();
  }, [user]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('fs_token')}`
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are FlowSpace AI, a helpful productivity assistant. Be concise and actionable.' },
            { role: 'user', content: inputValue.trim() }
          ],
          max_tokens: 1000
        })
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: data.content,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          type: 'system',
          content: 'Sorry, I had trouble processing that. Please try again.',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'system',
        content: 'Connection error. Please check your internet connection and try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#06b6d4',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(6, 182, 212, 0.4)',
          zIndex: 9999,
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#0891b2';
          e.target.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#06b6d4';
          e.target.style.transform = 'scale(1)';
        }}
      >
        <Brain size={24} color="white" />
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <div
            style={{
              width: '90%',
              maxWidth: '420px',
              height: '600px',
              maxHeight: '90vh',
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: '16px',
                borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: isDark ? '#111827' : '#f9fafb'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Brain size={24} color="#06b6d4" />
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '18px',
                  fontWeight: '600',
                  color: isDark ? '#ffffff' : '#111827'
                }}>
                  FlowSpace AI
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  color: isDark ? '#9ca3af' : '#6b7280'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '12px',
                      borderRadius: '12px',
                      backgroundColor: message.type === 'user' 
                        ? '#06b6d4' 
                        : message.type === 'system'
                          ? isDark ? '#92400e' : '#fef3c7'
                          : isDark ? '#374151' : '#f3f4f6',
                      color: message.type === 'user' 
                        ? '#ffffff' 
                        : message.type === 'system'
                          ? isDark ? '#fef3c7' : '#92400e'
                          : isDark ? '#ffffff' : '#111827',
                      fontSize: '14px',
                      lineHeight: '1.5'
                    }}
                  >
                    {message.content}
                    <div
                      style={{
                        fontSize: '11px',
                        opacity: 0.7,
                        marginTop: '4px'
                      }}
                    >
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      backgroundColor: isDark ? '#374151' : '#f3f4f6',
                      color: isDark ? '#ffffff' : '#111827',
                      fontSize: '14px'
                    }}
                  >
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div
              style={{
                padding: '16px',
                borderTop: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                display: 'flex',
                gap: '8px'
              }}
            >
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your productivity..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  resize: 'none',
                  minHeight: '40px',
                  maxHeight: '120px',
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  color: isDark ? '#ffffff' : '#111827',
                  fontFamily: 'inherit',
                  opacity: isLoading ? 0.6 : 1
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                style={{
                  padding: '8px 12px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: (inputValue.trim() && !isLoading) ? '#06b6d4' : (isDark ? '#374151' : '#d1d5db'),
                  color: (inputValue.trim() && !isLoading) ? '#ffffff' : (isDark ? '#9ca3af' : '#6b7280'),
                  cursor: (inputValue.trim() && !isLoading) ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
