'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { HelpChatProps } from './HelpChat.types';

const hintStyle = { color: 'var(--groupfit-grey)', fontSize: 14, margin: 0 };
const bubbleBase = {
  display: 'inline-block',
  padding: '8px 12px',
  borderRadius: 8,
  maxWidth: '85%',
  fontSize: 14,
};
const rowStyle = (isUser: boolean) => ({
  marginBottom: 8,
  textAlign: (isUser ? 'right' : 'left') as const,
});

export function HelpChatWeb({
  messages,
  onSend,
  sending,
  error,
  hintText,
  inputPlaceholder = 'Type a message…',
}: HelpChatProps) {
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || sending) return;
    onSend(text);
    setInputValue('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: 12,
          background: 'var(--groupfit-bg-secondary, #f8f9fa)',
          borderRadius: 8,
          marginBottom: 12,
        }}
      >
        {messages.length === 0 && <p style={hintStyle}>{hintText}</p>}
        {messages.map((m, i) => (
          <div key={i} style={rowStyle(m.role === 'user')}>
            <span
              style={{
                ...bubbleBase,
                background:
                  m.role === 'user' ? 'var(--groupfit-secondary)' : 'var(--groupfit-border-light)',
                color: m.role === 'user' ? '#fff' : 'var(--groupfit-black)',
              }}
            >
              {m.content}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={inputPlaceholder}
          disabled={sending}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 8,
            border: '1px solid var(--groupfit-border-light)',
            fontSize: 14,
          }}
        />
        <button
          type="submit"
          disabled={sending || !inputValue.trim()}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: 'none',
            background: 'var(--groupfit-secondary)',
            color: '#fff',
            fontWeight: 600,
            cursor: sending ? 'not-allowed' : 'pointer',
          }}
        >
          {sending ? '…' : 'Send'}
        </button>
      </form>
      {error && (
        <p style={{ color: 'var(--groupfit-error, #c00)', fontSize: 13, marginTop: 8 }}>{error}</p>
      )}
    </div>
  );
}
