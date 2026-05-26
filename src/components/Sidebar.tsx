import { useEffect, useState } from 'react'
import { getSessions, deleteSession } from '../services/api'
import type { Message, Session } from '../types'
import toast from 'react-hot-toast'

type AgentKey = 'orchestrator' | 'knowledge' | 'web'
type AgentStatus = 'active' | 'querying' | 'completed' | 'standby' | 'idle'

const AGENTS: { key: AgentKey; label: string; color: string; icon: React.ReactNode }[] = [
  {
    key: 'orchestrator',
    label: 'ORCHESTRATOR',
    color: 'var(--grad-mid)',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="2.5" />
        <circle cx="18" cy="6" r="2.5" />
        <circle cx="12" cy="18" r="2.5" />
        <path d="M7.8 7.6l3.2 8.2M16.2 7.6l-3.2 8.2" />
      </svg>
    ),
  },
  {
    key: 'knowledge',
    label: 'KNOWLEDGE',
    color: '#0891B2',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375M20.25 6.375c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375" />
        <path d="M3.75 6.375v11.25c0 2.278 3.694 4.125 8.25 4.125s8.25-1.847 8.25-4.125V6.375" />
      </svg>
    ),
  },
  {
    key: 'web',
    label: 'WEB',
    color: 'var(--grad-start)',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
  },
]

function agentStatus(
  key: AgentKey,
  isProcessing: boolean,
  lastAgent?: Message['agent_used']
): AgentStatus {
  if (isProcessing) {
    if (key === 'orchestrator') return 'active'
    return 'standby'
  }
  if (lastAgent === 'both' && (key === 'knowledge' || key === 'web')) return 'completed'
  if (lastAgent === key) return 'completed'
  return 'idle'
}

function statusLabel(s: AgentStatus): string {
  switch (s) {
    case 'active': return 'routing'
    case 'querying': return 'querying'
    case 'completed': return 'done'
    case 'standby': return 'standby'
    default: return 'idle'
  }
}

function AgentStatusPanel({
  isProcessing,
  lastAgent,
}: {
  isProcessing: boolean
  lastAgent?: Message['agent_used']
}) {
  return (
    <div
      style={{
        borderTop: '1px solid var(--border)',
        padding: '12px 10px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <div
        style={{
          padding: '4px 6px 8px',
          fontSize: 10,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--text-secondary)',
        }}
      >
        Agents
      </div>

      {AGENTS.map(a => {
        const status = agentStatus(a.key, isProcessing, lastAgent)
        const isActive = status === 'active' || status === 'querying'
        const isDone = status === 'completed'

        const iconBg = isActive
          ? `${a.color}1F`
          : isDone
            ? 'rgba(16,185,129,0.12)'
            : 'var(--bg)'
        const iconColor = isActive ? a.color : isDone ? '#10B981' : 'var(--text-muted)'
        const dotColor = isActive ? a.color : isDone ? '#10B981' : 'rgba(26,26,46,0.20)'

        return (
          <div
            key={a.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 8px',
              borderRadius: 'var(--radius-sm)',
              background: isActive ? '#F3F0FF' : 'transparent',
              transition: 'background 200ms ease',
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: iconBg,
                border: '1px solid var(--border)',
                color: iconColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 200ms ease, color 200ms ease',
              }}
            >
              {a.icon}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  color: 'var(--text-primary)',
                }}
              >
                {a.label}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span
                  className={isActive ? 'agent-pulse' : ''}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: dotColor,
                    display: 'inline-block',
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    color: 'var(--text-secondary)',
                    fontWeight: 500,
                  }}
                >
                  {statusLabel(status)}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function relativeTime(iso: string): string {
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const sec = Math.floor(diffMs / 1000)
  const min = Math.floor(sec / 60)
  const hr = Math.floor(min / 60)
  const day = Math.floor(hr / 24)
  if (sec < 60) return 'Just now'
  if (min < 60) return `${min} min ago`
  if (hr < 24) return `${hr} hr ago`
  if (day === 1) return 'Yesterday'
  if (day < 7) return `${day} days ago`
  if (day < 30) return 'Last week'
  return date.toLocaleDateString()
}

function ChatItem({
  session,
  isActive,
  onClick,
  onDelete,
}: {
  session: Session
  isActive: boolean
  onClick: () => void
  onDelete: (e: React.MouseEvent) => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        padding: '10px 14px',
        background: isActive ? '#EDE9FF' : hovered ? '#F3F0FF' : 'transparent',
        textAlign: 'left',
        transition: 'background 150ms ease',
        cursor: 'pointer',
        gap: 4,
        position: 'relative',
      }}
    >
      {isActive && (
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: 6,
            bottom: 6,
            width: 3,
            background: 'var(--gradient)',
            borderRadius: '0 3px 3px 0',
          }}
        />
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
            minWidth: 0,
          }}
        >
          {session.title}
        </span>

        {hovered ? (
          <button
            onClick={onDelete}
            aria-label="Delete chat"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 2,
              display: 'flex',
              alignItems: 'center',
              borderRadius: 4,
              flexShrink: 0,
              transition: 'color 150ms ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#DC2626')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h18" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
            </svg>
          </button>
        ) : (
          <span
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              flexShrink: 0,
              fontWeight: 400,
            }}
          >
            {relativeTime(session.updated_at)}
          </span>
        )}
      </div>

      <span
        style={{
          fontSize: 12,
          fontWeight: 400,
          color: 'var(--text-secondary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          width: '100%',
        }}
      >
        {session.message_count} message{session.message_count === 1 ? '' : 's'}
      </span>
    </div>
  )
}

export function Sidebar({
  currentId,
  onSelect,
  onNewChat,
  isOpen,
  onClose,
  isMobile,
  isProcessing,
  lastAgent,
}: {
  currentId?: string
  onSelect: (id: string) => void
  onNewChat: () => void
  isOpen: boolean
  onClose: () => void
  isMobile: boolean
  isProcessing: boolean
  lastAgent?: Message['agent_used']
}) {
  const [sessions, setSessions] = useState<Session[]>([])

  useEffect(() => {
    getSessions()
      .then(setSessions)
      .catch(() => {})
  }, [currentId])

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      await deleteSession(id)
      setSessions(prev => prev.filter(s => s.id !== id))
      if (id === currentId) onNewChat()
    } catch {
      toast.error('Failed to delete session.')
    }
  }

  const collapsedOnDesktop = !isMobile && !isOpen

  const sidebarStyle: React.CSSProperties = {
    width: collapsedOnDesktop ? 0 : 'var(--sidebar-w)',
    height: isMobile ? '100vh' : '100%',
    background: 'var(--surface)',
    borderRight: collapsedOnDesktop ? 'none' : '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    position: isMobile ? 'fixed' : 'relative',
    top: isMobile ? 0 : 'auto',
    left: 0,
    zIndex: isMobile ? 200 : 1,
    transform: isMobile && !isOpen ? 'translateX(-100%)' : 'translateX(0)',
    transition:
      'transform 300ms cubic-bezier(0.16, 1, 0.3, 1), width 300ms cubic-bezier(0.16, 1, 0.3, 1)',
    flexShrink: 0,
    overflow: 'hidden',
  }

  return (
    <>
      {isMobile && isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(26,26,46,0.35)',
            zIndex: 199,
            animation: 'overlayFadeIn 200ms ease-out',
          }}
        />
      )}

      <aside style={sidebarStyle}>
        {isMobile && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 14px 0',
            }}
          >
            <span
              className="gradient-text"
              style={{ fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em' }}
            >
              Orchestrix
            </span>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: 18,
                padding: '4px 6px',
                borderRadius: 6,
                cursor: 'pointer',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
        )}

        <div style={{ padding: '16px 14px 12px' }}>
          <button
            onClick={onNewChat}
            style={{
              width: '100%',
              padding: '11px 0',
              background: 'var(--gradient)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              fontWeight: 600,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'filter 150ms ease',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.1)')}
            onMouseLeave={e => (e.currentTarget.style.filter = 'brightness(1)')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Chat
          </button>
        </div>

        <div
          style={{
            padding: '6px 14px',
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--text-secondary)',
          }}
        >
          Recent
        </div>

        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {sessions.length === 0 ? (
            <div
              style={{
                padding: '16px 14px',
                fontSize: 12,
                color: 'var(--text-muted)',
              }}
            >
              No conversations yet.
            </div>
          ) : (
            sessions.map(s => (
              <ChatItem
                key={s.id}
                session={s}
                isActive={s.id === currentId}
                onClick={() => onSelect(s.id)}
                onDelete={e => handleDelete(e, s.id)}
              />
            ))
          )}
        </div>

        <AgentStatusPanel isProcessing={isProcessing} lastAgent={lastAgent} />
      </aside>
    </>
  )
}
