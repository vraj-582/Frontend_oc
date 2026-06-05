import { useEffect, useState } from 'react'
import { getSessions, deleteSession } from '../services/api'
import type { Session } from '../types'
import toast from 'react-hot-toast'

/* ── Soft pastel sidebar palette ── */
const SIDEBAR = {
  bg: 'linear-gradient(180deg, #F0EAFF 0%, #E8F0FF 50%, #F0EBFF 100%)',
  border: 'rgba(168, 86, 247, 0.12)',
  hoverBg: 'rgba(168, 86, 247, 0.08)',
  activeBg: 'rgba(168, 86, 247, 0.13)',
  activeHighlight: 'rgba(168, 86, 247, 0.16)',
  iconBg: 'rgba(168, 86, 247, 0.07)',
  iconBorder: 'rgba(168, 86, 247, 0.15)',
}

function relativeTime(iso: string): string {
  // Backend returns UTC timestamps without 'Z' — append it so the
  // browser treats them as UTC instead of local time.
  const utc = iso.endsWith('Z') || iso.includes('+') ? iso : iso + 'Z'
  const date = new Date(utc)
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
        background: isActive
          ? SIDEBAR.activeHighlight
          : hovered
            ? SIDEBAR.hoverBg
            : 'transparent',
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
}: {
  currentId?: string
  onSelect: (id: string) => void
  onNewChat: () => void
  isOpen: boolean
  onClose: () => void
  isMobile: boolean
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
    background: SIDEBAR.bg,
    borderRight: collapsedOnDesktop ? 'none' : `1px solid ${SIDEBAR.border}`,
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img
                src="/logo.svg"
                alt="Orchestrix logo"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  objectFit: 'cover',
                  flexShrink: 0,
                }}
              />
              <span
                className="gradient-text"
                style={{ fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em' }}
              >
                Orchestrix
              </span>
            </div>
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

      </aside>
    </>
  )
}
