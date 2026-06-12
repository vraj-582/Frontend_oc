import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { ChatWindow } from '../components/ChatWindow'
import { InputBar } from '../components/InputBar'
import { RoutePanel } from '../components/RoutePanel'
import { useStreamChat } from '../hooks/useStreamChat'
import type { User, ChatMode } from '../types'

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  )
  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])
  return matches
}

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() ?? '')
    .join('') || 'U'
}

function Topbar({
  user,
  onLogout,
  onToggleSidebar,
  sidebarOpen,
  onHome,
}: {
  user: User
  onLogout: () => void
  onToggleSidebar: () => void
  sidebarOpen: boolean
  onHome: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header
      style={{
        height: 'var(--topbar-h)',
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        flexShrink: 0,
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            padding: 6,
            cursor: 'pointer',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
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
          {sidebarOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <line x1="9" y1="4" x2="9" y2="20" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="7" x2="21" y2="7" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="17" x2="21" y2="17" />
            </svg>
          )}
        </button>
        <button
          onClick={onHome}
          aria-label="Back to dashboard"
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            margin: 0,
            cursor: 'pointer',
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
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
            style={{
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: '-0.02em',
              lineHeight: 1,
              display: 'inline-block',
            }}
          >
            Orchestrix
          </span>
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
              flexShrink: 0,
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
      </div>
    </header>
  )
}

export function ChatPage({ user, onLogout }: { user: User; onLogout: () => void }) {
  const { messages, sessionId, isLoading, run, send, stop, loadSession, clearChat } = useStreamChat()
  const [chatMode, setChatMode] = useState<ChatMode>('research')
  const [routePanelOpen, setRoutePanelOpen] = useState(true)
  const isMobile = useMediaQuery('(max-width: 767px)')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    setSidebarOpen(!isMobile)
  }, [isMobile])
  const navigate = useNavigate()
  const location = useLocation()
  const initialLoaded = useRef(false)

  useEffect(() => {
    if (initialLoaded.current) return
    initialLoaded.current = true
    const incoming = (location.state as { sessionId?: string } | null)?.sessionId
    if (incoming) {
      loadSession(incoming)
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location, loadSession, navigate])

  const handleSend = useCallback(
    (text: string) => {
      send(text, chatMode)
    },
    [send, chatMode]
  )

  const handleNewChat = useCallback(() => {
    clearChat()
    if (isMobile) setSidebarOpen(false)
  }, [clearChat, isMobile])

  const handleHome = useCallback(() => navigate('/home'), [navigate])


  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'var(--bg)',
      }}
    >
      <Topbar
        user={user}
        onLogout={onLogout}
        onToggleSidebar={() => setSidebarOpen(o => !o)}
        sidebarOpen={sidebarOpen}
        onHome={handleHome}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
          currentId={sessionId}
          onSelect={id => {
            loadSession(id)
            if (isMobile) setSidebarOpen(false)
          }}
          onNewChat={handleNewChat}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
        />

        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: 'var(--bg)',
            animation: 'fadeIn 400ms ease-out',
            minWidth: 0,
          }}
        >
          <ChatWindow messages={messages} isLoading={isLoading} onSend={handleSend} />
          <InputBar onSend={handleSend} onStop={stop} disabled={isLoading} mode={chatMode} onModeChange={setChatMode} />
        </main>

        {!isMobile && (
          <RoutePanel run={run} open={routePanelOpen} onClose={() => setRoutePanelOpen(false)} />
        )}
        {!isMobile && !routePanelOpen && (
          <button
            onClick={() => setRoutePanelOpen(true)}
            title="Show agent route"
            style={{
              position: 'fixed', right: 18, bottom: 90, zIndex: 20,
              width: 48, height: 48, borderRadius: 14,
              background: 'var(--gradient)', color: '#fff',
              display: 'grid', placeItems: 'center',
              boxShadow: '0 10px 26px rgba(108,71,240,.4)',
              border: 'none', cursor: 'pointer',
            }}
          >
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="19" r="2.4" /><circle cx="18" cy="5" r="2.4" />
              <path d="M8.4 19H14a4 4 0 0 0 0-8H9a4 4 0 0 1 0-8h6.6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
