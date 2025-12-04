import React, { useState, useRef, useEffect } from 'react';
import './AiBar.css';

/**
 * AiBar - Floating AI Assistant Component
 * Modern React component with glassmorphism and neumorphic styling
 *
 * @param {Object} props
 * @param {Array} props.messages - Array of message objects { id, role, text }
 * @param {Function} props.onSendMessage - Callback when message is sent
 * @param {boolean} props.isListening - Voice listening state
 * @param {Function} props.onToggleVoice - Callback for voice toggle (press/release)
 * @param {boolean} props.voiceEnabled - Whether voice input is enabled (default: true)
 */
const AiBar = ({
  messages = [],
  onSendMessage,
  isListening = false,
  onToggleVoice,
  voiceEnabled = true
}) => {
  const [draft, setDraft] = useState('');
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [draft]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = () => {
    const text = draft.trim();
    if (!text) return;

    if (onSendMessage) {
      onSendMessage(text);
    }
    setDraft('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleVoiceStart = () => {
    if (onToggleVoice) {
      onToggleVoice(true);
    }
  };

  const handleVoiceStop = () => {
    if (onToggleVoice) {
      onToggleVoice(false);
    }
  };

  // Show last 3 messages
  const recentMessages = messages.slice(-3);

  return (
    <section className="ai-bar">
      {/* Glassmorphic Glow Background */}
      <div className="ai-bar__glow"></div>

      {/* Message History */}
      {recentMessages.length > 0 && (
        <div className="ai-bar__messages">
          <div className="ai-messages-container">
            {recentMessages.map((message) => (
              <div
                key={message.id}
                className={`ai-message ai-message--${message.role}`}
              >
                <div className="ai-message__role">
                  {message.role === 'user' && (
                    <span className="ai-message__icon">👤</span>
                  )}
                  {message.role === 'assistant' && (
                    <span className="ai-message__icon">🤖</span>
                  )}
                  {message.role === 'system' && (
                    <span className="ai-message__icon">⚙️</span>
                  )}
                  <span className="ai-message__role-text">{message.role}</span>
                </div>
                <div className="ai-message__body">{message.text}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Input Row */}
      <div className="ai-bar__input-row">
        {/* Neumorphic Textarea Container */}
        <div className="ai-input-container">
          <textarea
            ref={textareaRef}
            className="ai-input-field"
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the AI assistant..."
            aria-label="AI message input"
          />
        </div>

        {/* Control Buttons */}
        <div className="ai-controls">
          {/* Voice Toggle Button */}
          {voiceEnabled && (
            <button
              className={`ai-control-button ai-mic-button ${
                isListening ? 'ai-mic-button--active' : ''
              }`}
              title="Hold to speak"
              aria-label={isListening ? 'Listening' : 'Hold to speak'}
              onMouseDown={(e) => {
                e.preventDefault();
                handleVoiceStart();
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                handleVoiceStop();
              }}
              onMouseLeave={(e) => {
                if (isListening) {
                  e.preventDefault();
                  handleVoiceStop();
                }
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                handleVoiceStart();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleVoiceStop();
              }}
            >
              <span className="ai-button__icon">🎙</span>
              {isListening && (
                <>
                  <span className="ai-mic-pulse"></span>
                  <span className="ai-mic-pulse ai-mic-pulse--delay"></span>
                </>
              )}
            </button>
          )}

          {/* Send Button */}
          <button
            className="ai-control-button ai-send-button"
            title="Send message (Enter)"
            aria-label="Send message"
            disabled={!draft.trim()}
            onClick={handleSubmit}
          >
            <span className="ai-button__icon">➤</span>
            <span className="ai-button__glow"></span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default AiBar;
