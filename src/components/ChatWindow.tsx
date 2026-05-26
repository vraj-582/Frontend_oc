import { useEffect, useRef, useState } from 'react'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import type { Message } from '../types'

type Suggestion = {
  title: string
  subtitle: string
  query: string
  color: 'start' | 'mid' | 'end'
  icon: React.ReactNode
}

const SUGGESTIONS: Suggestion[] = [
  {
    title: 'Query company policy',
    subtitle: 'Try: How many leave days does a senior employee get?',
    query: 'How many leave days does a senior employee get?',
    color: 'start',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375M20.25 6.375c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375" />
        <path d="M3.75 6.375v11.25c0 2.278 3.694 4.125 8.25 4.125s8.25-1.847 8.25-4.125V6.375" />
        <path d="M3.75 12.5c0 2.278 3.694 4.125 8.25 4.125s8.25-1.847 8.25-4.125" />
      </svg>
    ),
  },
  {
    title: 'Summarize market trends',
    subtitle: 'Try: What are the latest AI trends in 2025?',
    query: 'What are the latest AI trends in 2025?',
    color: 'mid',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
  },
  {
    title: 'Combine internal & web data',
    subtitle: 'Try: Our leave policy and current AI tools in the market?',
    query: 'Our leave policy and current AI tools in the market?',
    color: 'end',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
]

function colorFor(c: Suggestion['color']) {
  return c === 'start' ? 'var(--grad-start)' : c === 'mid' ? 'var(--grad-mid)' : 'var(--grad-end)'
}

function SuggestionCard({
  suggestion,
  delay,
  onClick,
  disabled,
}: {
  suggestion: Suggestion
  delay: number
  onClick: () => void
  disabled: boolean
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fade-in-up"
      style={{
        flex: '1 1 220px',
        maxWidth: 260,
        padding: '20px 18px',
        background: hovered
          ? 'linear-gradient(135deg, var(--grad-start), var(--grad-mid), var(--grad-end)) top/100% 3px no-repeat, var(--bg)'
          : 'var(--bg)',
        border: hovered
          ? '1px solid rgba(168,86,247,0.35)'
          : '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        cursor: disabled ? 'default' : 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        transition: 'box-shadow 200ms ease, border-color 200ms ease, transform 200ms ease, background 200ms ease',
        boxShadow: hovered ? 'var(--shadow-md)' : 'none',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        animationDelay: `${delay}ms`,
        animationFillMode: 'both',
        opacity: disabled ? 0.6 : 1,
        overflow: 'hidden',
      }}
    >
      <div style={{ color: colorFor(suggestion.color), marginBottom: 2 }}>
        {suggestion.icon}
      </div>
      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
        {suggestion.title}
      </span>
      <span
        style={{
          fontSize: 12,
          fontWeight: 400,
          color: 'var(--text-secondary)',
          lineHeight: 1.4,
        }}
      >
        {suggestion.subtitle}
      </span>
    </button>
  )
}

function WelcomeScreen({
  onSend,
  isLoading,
}: {
  onSend: (text: string) => void
  isLoading: boolean
}) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px 20px',
        gap: 14,
      }}
    >
      <h1
        className="gradient-text fade-in-up"
        style={{
          fontWeight: 700,
          fontSize: 48,
          letterSpacing: '-0.03em',
          margin: 0,
          lineHeight: 1.1,
        }}
      >
        Orchestrix
      </h1>

      <p
        className="fade-in-up"
        style={{
          fontWeight: 300,
          fontSize: 18,
          color: 'var(--text-secondary)',
          margin: 0,
          animationDelay: '80ms',
          animationFillMode: 'both',
        }}
      >
        Orchestrate your conversations
      </p>

      <div
        className="fade-in-up"
        style={{
          width: 80,
          height: 2,
          background: 'var(--gradient)',
          borderRadius: 1,
          margin: '4px 0 12px',
          animationDelay: '140ms',
          animationFillMode: 'both',
        }}
      />

      <div
        style={{
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: 840,
        }}
      >
        {SUGGESTIONS.map((s, i) => (
          <SuggestionCard
            key={s.title}
            suggestion={s}
            delay={200 + i * 80}
            disabled={isLoading}
            onClick={() => onSend(s.query)}
          />
        ))}
      </div>
    </div>
  )
}

function ChatHeader({ title }: { title: string }) {
  return (
    <div
      style={{
        height: 56,
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: 'var(--text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </span>
    </div>
  )
}

export function ChatWindow({
  messages,
  isLoading,
  onSend,
}: {
  messages: Message[]
  isLoading: boolean
  onSend: (text: string) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const prevCount = useRef(0)

  useEffect(() => {
    const el = scrollRef.current
    if (el) requestAnimationFrame(() => { el.scrollTop = el.scrollHeight })
  }, [messages.length, isLoading])

  useEffect(() => {
    prevCount.current = messages.length
  }, [messages.length])

  if (messages.length === 0) {
    return <WelcomeScreen onSend={onSend} isLoading={isLoading} />
  }

  const headerTitle =
    messages.find(m => m.role === 'user')?.content.slice(0, 60) || 'Conversation'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <ChatHeader title={headerTitle} />
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {messages.map((m, i) => (
          <MessageBubble
            key={m.id}
            message={m}
            isNew={i >= prevCount.current - 1}
          />
        ))}
        {isLoading && <TypingIndicator />}
      </div>
    </div>
  )
}
