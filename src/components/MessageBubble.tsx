import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import type { Message } from '../types'

// All links in AI responses open in a new tab
const markdownComponents: Components = {
  a: ({ href, children, ...props }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
}

type AgentKey = 'knowledge' | 'web' | 'both' | 'none' | 'document'

const agentConfig: Record<AgentKey, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  knowledge: {
    label: 'Internal Knowledge',
    color: '#0891B2',
    bg: 'rgba(8,145,178,0.06)',
    border: 'rgba(8,145,178,0.18)',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375M20.25 6.375c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375" />
        <path d="M3.75 6.375v11.25c0 2.278 3.694 4.125 8.25 4.125s8.25-1.847 8.25-4.125V6.375" />
      </svg>
    ),
  },
  web: {
    label: 'Web Search',
    color: '#A856F7',
    bg: 'rgba(168,86,247,0.06)',
    border: 'rgba(168,86,247,0.18)',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
  },
  both: {
    label: 'Combined Research',
    color: '#6A5ACD',
    bg: 'rgba(106,90,205,0.07)',
    border: 'rgba(106,90,205,0.20)',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
      </svg>
    ),
  },
  none: {
    label: 'System',
    color: '#6B6B8A',
    bg: 'rgba(107,107,138,0.06)',
    border: 'rgba(107,107,138,0.18)',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9 9a3 3 0 015.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  document: {
    label: 'Document Reader',
    color: '#00A1E0',
    bg: 'rgba(0,161,224,0.06)',
    border: 'rgba(0,161,224,0.18)',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
}

function GradientAvatar({ size = 28 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--gradient)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: Math.round(size * 0.4),
        fontWeight: 600,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      O
    </div>
  )
}

export function MessageBubble({ message, isNew }: { message: Message; isNew?: boolean }) {
  const isUser = message.role === 'user'
  const agentKey: AgentKey | null =
    !isUser && message.agent_used && agentConfig[message.agent_used as AgentKey]
      ? (message.agent_used as AgentKey)
      : null
  const agent = agentKey ? agentConfig[agentKey] : null

  if (isUser) {
    return (
      <div
        className={isNew ? 'message-enter' : ''}
        style={{
          display: 'flex',
          gap: 10,
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
          maxWidth: '100%',
        }}
      >
        <div
          style={{
            maxWidth: '72%',
            padding: '12px 16px',
            background: 'var(--gradient)',
            color: '#FFFFFF',
            borderRadius: '18px 18px 4px 18px',
            fontSize: 14,
            fontWeight: 400,
            lineHeight: 1.6,
            boxShadow: 'var(--shadow-sm)',
            wordBreak: 'break-word',
          }}
        >
          <div className="orx-prose orx-prose-on-gradient">
            <ReactMarkdown components={markdownComponents}>{message.content}</ReactMarkdown>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={isNew ? 'message-enter' : ''}
      style={{
        display: 'flex',
        gap: 10,
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        maxWidth: '100%',
      }}
    >
      <GradientAvatar size={28} />
      <div
        style={{
          maxWidth: '72%',
          padding: '12px 16px',
          background: agent ? agent.bg : 'var(--surface)',
          color: 'var(--text-primary)',
          border: `1px solid ${agent ? agent.border : 'var(--border)'}`,
          borderRadius: '18px 18px 18px 4px',
          fontSize: 14,
          fontWeight: 400,
          lineHeight: 1.6,
          wordBreak: 'break-word',
        }}
      >
        {agent && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 8,
              padding: '3px 10px',
              borderRadius: 'var(--radius-pill)',
              background: '#FFFFFF',
              border: `1px solid ${agent.border}`,
              color: agent.color,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.02em',
            }}
          >
            {agent.icon}
            {agent.label}
          </div>
        )}
        <div className="orx-prose">
          <ReactMarkdown components={markdownComponents}>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
