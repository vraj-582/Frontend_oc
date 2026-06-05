import { useState, useRef, useEffect } from 'react'
import type { RouteRun, RouteName } from '../types'

// ── Route metadata ──────────────────────────────────────────
const ROUTE_META: Record<string, { tag: string; desc: string; color: string; bg: string }> = {
  INTERNAL: { tag: 'ROUTE: INTERNAL', desc: 'Internal knowledge only', color: '#5566F2', bg: '#E9ECFE' },
  WEB:     { tag: 'ROUTE: WEB',      desc: 'Live web search only',    color: '#0E96AE', bg: '#DEF3F6' },
  BOTH:    { tag: 'ROUTE: BOTH',     desc: 'Knowledge + web, merged', color: '#7C5CFF', bg: '#EEEAFF' },
  NONE:    { tag: 'ROUTE: NONE',     desc: 'Direct reply, no agents', color: '#7E7A95', bg: '#EFEEF4' },
}

const STEP_META: Record<string, { label: string; color: string; soft: string }> = {
  manager:   { label: 'Manager agent',   color: '#7C5CFF', soft: '#EEEAFF' },
  knowledge: { label: 'Knowledge agent', color: '#5566F2', soft: '#E9ECFE' },
  web:       { label: 'Web agent',       color: '#0EA5BE', soft: '#DFF4F7' },
  synthesis: { label: 'Synthesis',       color: '#8B5CF6', soft: '#F0EAFE' },
}

function fmtTime(ms: number): string {
  return (ms / 1000).toFixed(1) + 's'
}

// ── Icons (inline SVG) ──────────────────────────────────────
function IconRoute({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="19" r="2.4" /><circle cx="18" cy="5" r="2.4" />
      <path d="M8.4 19H14a4 4 0 0 0 0-8H9a4 4 0 0 1 0-8h6.6" />
    </svg>
  )
}
function IconCheck({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 6.5" />
    </svg>
  )
}
function IconBranch({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="2.4" /><circle cx="6" cy="18" r="2.4" /><circle cx="18" cy="8" r="2.4" />
      <path d="M6 8.4v7.2M6 14a8 8 0 0 1 8-8h1.6" />
    </svg>
  )
}
function IconDatabase({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5" /><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
    </svg>
  )
}
function IconGlobe({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z" />
    </svg>
  )
}
function IconLayers({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 13l9 5 9-5M3 17l9 5 9-5" />
    </svg>
  )
}
function IconTerminal({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 9l3 3-3 3M13 15h4" />
    </svg>
  )
}
function IconX({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

const STEP_ICONS: Record<string, (p: { size?: number }) => JSX.Element> = {
  manager: IconBranch,
  knowledge: IconDatabase,
  web: IconGlobe,
  synthesis: IconLayers,
}

// ── Route badge ─────────────────────────────────────────────
function RouteBadge({ route }: { route: RouteName | null }) {
  if (!route) return null
  const m = ROUTE_META[route]
  if (!m) return null
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 11px 5px 9px',
      borderRadius: 999, background: m.bg, color: m.color, fontSize: 11.5, fontWeight: 800,
      letterSpacing: '.04em', fontFamily: "'JetBrains Mono', monospace",
    }}>
      <span style={{ width: 7, height: 7, borderRadius: 99, background: m.color }} />
      {m.tag}
    </span>
  )
}

// ── Timeline view ───────────────────────────────────────────
function TimelineView({ run }: { run: RouteRun }) {
  const steps = run.steps
  return (
    <div style={{ padding: '6px 20px 26px' }}>
      {steps.map((s, i) => {
        const last = i === steps.length - 1
        const m = STEP_META[s.name] || STEP_META.manager
        const active = s.status === 'active'
        const done = s.status === 'done'
        const Icon = STEP_ICONS[s.name] || IconBranch
        return (
          <div key={s.name + i} style={{ display: 'flex', gap: 14, position: 'relative' }}>
            <div style={{ width: 28, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{
                width: 28, height: 28, borderRadius: 99, display: 'grid', placeItems: 'center',
                flexShrink: 0, color: active || done ? '#fff' : m.color,
                background: done ? '#16B981' : active ? `linear-gradient(135deg,${m.color},#6366F1)` : m.soft,
                transition: 'background .3s',
              }}>
                {done ? <IconCheck size={16} /> : <Icon size={15} />}
              </span>
              {!last && <div style={{ flex: 1, width: 2, marginTop: 4, minHeight: 18,
                background: done ? 'linear-gradient(#16B981,#7C5CFF)' : '#ECEAF5', transition: 'background .4s' }} />}
            </div>
            <div style={{ flex: 1, paddingBottom: last ? 0 : 20, paddingTop: 3 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14.5, fontWeight: 700,
                  color: s.status === 'pending' ? '#B7B4CB' : '#211D38' }}>{s.label}</span>
                {active && <span style={{ fontSize: 11, color: m.color, fontWeight: 700 }}>running</span>}
              </div>
              <div style={{ fontSize: 12.5, color: s.status === 'pending' ? '#C4C1D4' : '#56516F', marginTop: 3 }}>{s.detail}</div>
              {active && (
                <div style={{ marginTop: 9, height: 4, borderRadius: 99, overflow: 'hidden', background: '#EEECF6' }}>
                  <div style={{
                    height: '100%', borderRadius: 99,
                    background: `linear-gradient(90deg,${m.color},#8B5CF6,${m.color})`,
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.1s linear infinite',
                    width: '100%',
                  }} />
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Console view ────────────────────────────────────────────
function ConsoleView({ run }: { run: RouteRun }) {
  const steps = run.steps
  return (
    <div style={{ padding: '8px 16px 22px', display: 'flex', flexDirection: 'column', gap: 11 }}>
      {steps.map((s, i) => {
        const m = STEP_META[s.name] || STEP_META.manager
        const active = s.status === 'active'
        const done = s.status === 'done'
        const Icon = STEP_ICONS[s.name] || IconBranch
        return (
          <div key={s.name + i} style={{
            border: `1px solid ${active ? m.color : '#ECEAF5'}`, borderRadius: 14,
            background: active ? m.soft : '#fff', padding: '12px 13px', transition: 'all .3s',
            boxShadow: active ? `0 8px 22px ${m.color}22` : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 32, height: 32, borderRadius: 9, display: 'grid', placeItems: 'center',
                color: '#fff', flexShrink: 0, background: done ? '#16B981' : `linear-gradient(135deg,${m.color},#7C5CFF)` }}>
                {done ? <IconCheck size={17} /> : <Icon size={16} />}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{s.label}</div>
                <div style={{ fontSize: 11.5, color: '#7E7A95' }}>{s.detail || 'Waiting'}</div>
              </div>
              <span style={{
                fontSize: 10.5, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase' as const,
                padding: '3px 8px', borderRadius: 99, fontFamily: "'JetBrains Mono', monospace",
                color: done ? '#0E9266' : active ? m.color : '#A8A4BC',
                background: done ? '#E2F7EF' : active ? '#fff' : '#F3F1FA',
              }}>{done ? 'done' : active ? 'live' : 'queued'}</span>
            </div>
            <div style={{ marginTop: 10, height: 5, borderRadius: 99, background: '#EEECF6', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99,
                background: done ? '#16B981' : `linear-gradient(90deg,${m.color},#8B5CF6)`,
                width: done ? '100%' : active ? '100%' : '0%',
                transition: done ? 'none' : 'width .3s',
                animation: active ? 'barGrow 2s linear' : 'none',
                transformOrigin: 'left',
              }} />
            </div>
          </div>
        )
      })}
      <EventLog run={run} />
    </div>
  )
}

// ── Event log (dark terminal) ───────────────────────────────
function EventLog({ run }: { run: RouteRun }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [run.log.length])

  return (
    <div style={{ marginTop: 4, borderRadius: 14, border: '1px solid #ECEAF5', background: '#16132A', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 12px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <IconTerminal size={14} />
        <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.82)', letterSpacing: '.05em' }}>EVENT LOG</span>
      </div>
      <div ref={ref} style={{ maxHeight: 160, overflowY: 'auto', padding: '10px 12px',
        fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, lineHeight: 1.7, color: 'rgba(255,255,255,.86)' }}>
        {run.log.length === 0 && <span style={{ color: 'rgba(255,255,255,.32)' }}>{'// awaiting query...'}</span>}
        {run.log.map((l, i) => (
          <div key={i} style={{ display: 'flex', gap: 8 }}>
            <span style={{ color: 'rgba(255,255,255,.34)', flexShrink: 0 }}>{l.ts}</span>
            <span style={{ color: l.color || '#A6F0CE' }}>{l.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Idle state ──────────────────────────────────────────────
function IdleState() {
  const routes = [
    { k: 'INTERNAL', agent: 'knowledge-agent' },
    { k: 'WEB', agent: 'web-agent' },
    { k: 'BOTH', agent: 'knowledge + web' },
    { k: 'NONE', agent: 'direct reply' },
  ]
  return (
    <div style={{ padding: '26px 20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ textAlign: 'center', padding: '18px 8px 4px' }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, margin: '0 auto', display: 'grid', placeItems: 'center',
          background: '#fff', border: '1px solid #ECEAF5', color: '#7C5CFF', boxShadow: '0 1px 2px rgba(36,24,80,.04),0 6px 22px rgba(36,24,80,.05)' }}>
          <IconBranch size={30} />
        </div>
        <div style={{ fontSize: 16, fontWeight: 800, marginTop: 16 }}>No active route</div>
        <p style={{ fontSize: 13, color: '#928FAA', lineHeight: 1.55, margin: '8px auto 0', maxWidth: 240 }}>
          Send a query and the Manager agent will route it across agents — you'll see every step light up here.
        </p>
      </div>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', color: '#B7B4CB', margin: '30px 4px 10px' }}>
        ROUTING LOGIC
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {routes.map(r => {
          const rm = ROUTE_META[r.k]
          return (
            <div key={r.k} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px',
              borderRadius: 12, background: '#fff', border: '1px solid #ECEAF5' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 800, color: rm.color,
                background: rm.bg, padding: '4px 9px', borderRadius: 99, whiteSpace: 'nowrap' as const }}>{r.k}</span>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#C4C1D4" strokeWidth={2} strokeLinecap="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#56516F' }}>{r.agent}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main RoutePanel ─────────────────────────────────────────
type PanelView = 'timeline' | 'console'

const VIEWS: { id: PanelView; label: string; Icon: (p: { size?: number }) => JSX.Element }[] = [
  { id: 'timeline', label: 'Timeline', Icon: IconRoute },
  { id: 'console', label: 'Console', Icon: IconTerminal },
]

export function RoutePanel({ run, open, onClose }: {
  run: RouteRun
  open: boolean
  onClose: () => void
}) {
  const [view, setView] = useState<PanelView>('timeline')

  if (!open) return null

  const m = run.route ? ROUTE_META[run.route] : null
  const idle = run.status === 'idle'
  const PanelBody = view === 'timeline' ? TimelineView : ConsoleView

  return (
    <aside style={{
      width: 380, flexShrink: 0, background: '#FAFAFE', borderLeft: '1px solid #ECEAF5',
      display: 'flex', flexDirection: 'column', height: '100vh',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid #ECEAF5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--gradient)', color: '#fff',
            display: 'grid', placeItems: 'center' }}>
            <IconRoute size={17} />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-.01em' }}>Agent Route</div>
            <div style={{ fontSize: 11.5, color: '#928FAA' }}>Live orchestration trace</div>
          </div>
          {run.status === 'running' ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 700,
              color: '#7C5CFF', fontFamily: "'JetBrains Mono', monospace" }}>
              <span style={{ width: 8, height: 8, borderRadius: 99, background: '#16B981',
                animation: 'agentPulse 1s infinite' }} />
              {fmtTime(run.elapsed)}
            </span>
          ) : run.status === 'done' ? (
            <span style={{ fontSize: 12, fontWeight: 700, color: '#16B981',
              fontFamily: "'JetBrains Mono', monospace" }}>
              {'✓ ' + fmtTime(run.elapsed)}
            </span>
          ) : null}
          <button onClick={onClose} title="Hide" style={{ width: 30, height: 30, borderRadius: 8, color: '#928FAA',
            display: 'grid', placeItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
            <IconX size={17} />
          </button>
        </div>

        {/* View toggle */}
        <div style={{ display: 'flex', gap: 4, marginTop: 14, padding: 4, borderRadius: 12, background: '#EEEBF7' }}>
          {VIEWS.map(v => (
            <button key={v.id} onClick={() => setView(v.id)} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              height: 34, borderRadius: 9, fontSize: 12.5, fontWeight: 700, transition: 'all .15s',
              background: view === v.id ? '#fff' : 'transparent',
              color: view === v.id ? '#7C5CFF' : '#56516F',
              boxShadow: view === v.id ? '0 2px 8px rgba(36,24,80,.10)' : 'none',
              border: 'none', cursor: 'pointer',
            }}>
              <v.Icon size={15} /> {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Route status strip */}
      {!idle && (
        <div style={{ padding: '12px 18px', borderBottom: '1px solid #ECEAF5', display: 'flex', alignItems: 'center', gap: 10 }}>
          <RouteBadge route={run.route} />
          {m && <span style={{ fontSize: 12, color: '#56516F' }}>{m.desc}</span>}
        </div>
      )}

      {/* Body */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {idle ? <IdleState /> : <PanelBody run={run} />}
      </div>
    </aside>
  )
}
