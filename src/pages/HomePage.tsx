import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSessions, deleteSession } from '../services/api'
import type { User, Session } from '../types'
import toast from 'react-hot-toast'

function initialsOf(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(p => p[0]?.toUpperCase() ?? '')
      .join('') || 'U'
  )
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  const hr = Math.floor(min / 60)
  const day = Math.floor(hr / 24)
  if (min < 1) return 'Just now'
  if (min < 60) return `${min} min ago`
  if (hr < 24) return `${hr} hr ago`
  if (day === 1) return 'Yesterday'
  if (day < 7) return `${day} days ago`
  return new Date(iso).toLocaleDateString()
}

function Navbar({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        height: 'var(--topbar-h)',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
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
        <h1
          className="gradient-text"
          style={{
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: '-0.02em',
            margin: 0,
            lineHeight: 1,
          }}
        >
          Orchestrix
        </h1>
      </div>

      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Account menu"
          title={user.name}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            padding: 2,
            background: 'var(--gradient)',
            cursor: 'pointer',
            border: 'none',
          }}
        >
          <span
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'var(--bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            {initialsOf(user.name)}
          </span>
        </button>

        {menuOpen && (
          <>
            <div
              onClick={() => setMenuOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 40 }}
            />
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: 220,
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
                padding: 10,
                zIndex: 50,
              }}
            >
              <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {user.email}
                </div>
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false)
                  onLogout()
                }}
                style={{
                  width: '100%',
                  marginTop: 6,
                  padding: '8px 10px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  fontSize: 13,
                  fontWeight: 500,
                  textAlign: 'left',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  transition: 'background 150ms ease, color 150ms ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--surface)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}

function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '80px 24px 72px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(circle at 20% 0%, rgba(168,86,247,0.18), transparent 55%),' +
            'radial-gradient(circle at 80% 30%, rgba(0,161,224,0.16), transparent 55%),' +
            'radial-gradient(circle at 50% 90%, rgba(106,90,205,0.14), transparent 60%)',
          zIndex: 0,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 880 }}>
        <span
          className="fade-in-up"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 'var(--radius-pill)',
            background: 'rgba(168,86,247,0.08)',
            border: '1px solid rgba(168,86,247,0.20)',
            color: 'var(--grad-mid)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: 24,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--gradient)',
            }}
          />
          Building intelligence
        </span>

        <h2
          className="fade-in-up"
          style={{
            fontWeight: 700,
            fontSize: 'clamp(36px, 6vw, 64px)',
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            margin: 0,
            color: 'var(--text-primary)',
            animationDelay: '60ms',
            animationFillMode: 'both',
          }}
        >
          The Future of <span className="gradient-text">Research</span>
          <br />
          <span className="gradient-text">Intelligence</span> for the Enterprise.
        </h2>

        <p
          className="fade-in-up"
          style={{
            fontWeight: 300,
            fontSize: 18,
            color: 'var(--text-secondary)',
            margin: '22px auto 0',
            maxWidth: 640,
            lineHeight: 1.55,
            animationDelay: '140ms',
            animationFillMode: 'both',
          }}
        >
          Internal knowledge and real-time web intelligence orchestrated by a
          multi-agent AI workflow — built for teams that need answers grounded in
          both their own data and the open web.
        </p>

        <div
          className="fade-in-up"
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            marginTop: 36,
            flexWrap: 'wrap',
            animationDelay: '220ms',
            animationFillMode: 'both',
          }}
        >
          <button
            onClick={onStart}
            style={{
              background: 'var(--gradient)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              padding: '13px 26px',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-md)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'filter 150ms ease, transform 150ms ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.filter = 'brightness(1.08)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.filter = 'brightness(1)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Start new research session
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>

          <a
            href="#sessions"
            style={{
              background: 'var(--bg)',
              color: 'var(--text-primary)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-pill)',
              padding: '13px 26px',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'border-color 150ms ease, background 150ms ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--grad-start)'
              e.currentTarget.style.background = 'var(--surface)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.background = 'var(--bg)'
            }}
          >
            View recent sessions
          </a>
        </div>
      </div>
    </section>
  )
}

const CAPABILITIES = [
  {
    title: 'Internal Knowledge Retrieval',
    desc: 'Grounded RAG over your enterprise policy and document index for precise, citeable answers.',
    color: 'var(--grad-start)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375M20.25 6.375c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375" />
        <path d="M3.75 6.375v11.25c0 2.278 3.694 4.125 8.25 4.125s8.25-1.847 8.25-4.125V6.375" />
      </svg>
    ),
  },
  {
    title: 'Real-time Web Intelligence',
    desc: 'Live web search and synthesis for market trends, news and external context outside your corpus.',
    color: 'var(--grad-mid)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
  },
  {
    title: 'Multi-Agent Orchestration',
    desc: 'A manager agent routes every query to the right specialist — knowledge, web, or both — with full traceability.',
    color: 'var(--grad-end)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="2.5" />
        <circle cx="18" cy="6" r="2.5" />
        <circle cx="12" cy="18" r="2.5" />
        <path d="M7.8 7.6l3.2 8.2M16.2 7.6l-3.2 8.2" />
      </svg>
    ),
  },
  {
    title: 'Hybrid Semantic Search',
    desc: 'Combines dense vector retrieval with keyword matching for higher recall and precision over your data.',
    color: 'var(--grad-start)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
]

function Capabilities() {
  return (
    <section style={{ padding: '40px 32px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h3
          style={{
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: '-0.01em',
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          Platform capabilities
        </h3>
        <p style={{ marginTop: 6, fontSize: 14, color: 'var(--text-secondary)' }}>
          The building blocks behind every Orchestrix conversation.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        }}
      >
        {CAPABILITIES.map((c, i) => (
          <div
            key={c.title}
            className="fade-in-up"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: 22,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              transition: 'box-shadow 200ms ease, transform 200ms ease, border-color 200ms ease',
              animationDelay: `${i * 60}ms`,
              animationFillMode: 'both',
              cursor: 'default',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = 'var(--shadow-md)'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.borderColor = 'rgba(168,86,247,0.25)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'rgba(168,86,247,0.08)',
                color: c.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {c.icon}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
              {c.title}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              {c.desc}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function SessionCard({
  session,
  onOpen,
  onDelete,
}: {
  session: Session
  onOpen: () => void
  onDelete: (e: React.MouseEvent) => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg)',
        border: `1px solid ${hovered ? 'rgba(168,86,247,0.30)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: 18,
        cursor: 'pointer',
        transition: 'border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease',
        boxShadow: hovered ? 'var(--shadow-md)' : 'none',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        minHeight: 120,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-primary)',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {session.title}
        </div>
        <button
          onClick={onDelete}
          aria-label="Delete session"
          style={{
            background: 'transparent',
            border: 'none',
            color: hovered ? 'var(--text-muted)' : 'transparent',
            padding: 4,
            cursor: 'pointer',
            flexShrink: 0,
            display: 'flex',
            transition: 'color 150ms ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#DC2626')}
          onMouseLeave={e => (e.currentTarget.style.color = hovered ? 'var(--text-muted)' : 'transparent')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 6h18" />
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
          </svg>
        </button>
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
        {session.message_count} message{session.message_count === 1 ? '' : 's'}
      </div>

      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 11,
          color: 'var(--text-muted)',
        }}
      >
        <span>{relativeTime(session.updated_at)}</span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            color: 'var(--grad-mid)',
            fontWeight: 500,
          }}
        >
          Open
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
      </div>
    </div>
  )
}

function RecentSessions({
  sessions,
  loading,
  onOpen,
  onDelete,
  onStart,
}: {
  sessions: Session[]
  loading: boolean
  onOpen: (id: string) => void
  onDelete: (id: string) => void
  onStart: () => void
}) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? sessions : sessions.slice(0, 6)

  return (
    <section id="sessions" style={{ padding: '32px 32px 16px', maxWidth: 1200, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 18,
        }}
      >
        <div>
          <h3
            style={{
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: '-0.01em',
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            Recent research sessions
          </h3>
          <p style={{ marginTop: 6, fontSize: 14, color: 'var(--text-secondary)' }}>
            Pick up where you left off, or start a fresh investigation.
          </p>
        </div>

        {sessions.length > 6 && (
          <button
            onClick={() => setShowAll(s => !s)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--grad-mid)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {showAll ? 'Show less' : 'View all sessions'}
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '12px 0' }}>
          Loading sessions…
        </div>
      ) : sessions.length === 0 ? (
        <div
          style={{
            border: '1px dashed var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '36px 24px',
            textAlign: 'center',
            background: 'var(--surface)',
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
            No sessions yet
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '6px 0 16px' }}>
            Kick things off with a question — Orchestrix will route it to the right agents.
          </p>
          <button
            onClick={onStart}
            style={{
              background: 'var(--gradient)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              padding: '10px 22px',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            Start your first session
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gap: 14,
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          }}
        >
          {visible.map(s => (
            <SessionCard
              key={s.id}
              session={s}
              onOpen={() => onOpen(s.id)}
              onDelete={e => {
                e.stopPropagation()
                onDelete(s.id)
              }}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function StatusBar() {
  const items = [
    { label: 'Knowledge agent', tone: 'ok' },
    { label: 'Web agent', tone: 'ok' },
    { label: 'Search index', tone: 'ok' },
    { label: 'Hybrid retrieval', tone: 'ok' },
  ]
  return (
    <section style={{ padding: '24px 32px 64px', maxWidth: 1200, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          alignItems: 'center',
          padding: '14px 18px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginRight: 8,
          }}
        >
          System status
        </span>
        {items.map(item => (
          <span
            key={item.label}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--text-primary)',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: item.tone === 'ok' ? '#10B981' : '#F59E0B',
                boxShadow: item.tone === 'ok' ? '0 0 0 3px rgba(16,185,129,0.15)' : 'none',
              }}
            />
            {item.label}
          </span>
        ))}
      </div>
    </section>
  )
}

export function HomePage({ user, onLogout }: { user: User; onLogout: () => void }) {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getSessions()
      .then(data => {
        if (!cancelled) setSessions(data)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const startNew = () => navigate('/chat')
  const openSession = (id: string) =>
    navigate('/chat', { state: { sessionId: id } })
  const removeSession = async (id: string) => {
    try {
      await deleteSession(id)
      setSessions(prev => prev.filter(s => s.id !== id))
    } catch {
      toast.error('Failed to delete session.')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        height: '100%',
        background: 'var(--bg)',
        color: 'var(--text-primary)',
        overflowY: 'auto',
      }}
    >
      <Navbar user={user} onLogout={onLogout} />
      <Hero onStart={startNew} />
      <RecentSessions
        sessions={sessions}
        loading={loading}
        onOpen={openSession}
        onDelete={removeSession}
        onStart={startNew}
      />
      <Capabilities />
      <StatusBar />
    </div>
  )
}
