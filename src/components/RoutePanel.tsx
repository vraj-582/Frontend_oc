import { useState, useRef, useEffect } from 'react'
import type { RouteRun, RouteName } from '../types'

// ── Route metadata ──────────────────────────────────────────
const ROUTE_META: Record<string, { tag: string; desc: string; color: string; bg: string }> = {
  INTERNAL: { tag: 'ROUTE: INTERNAL', desc: 'Internal knowledge only',   color: '#5566F2', bg: '#E9ECFE' },
  WEB:      { tag: 'ROUTE: WEB',      desc: 'Live web search only',      color: '#0E96AE', bg: '#DEF3F6' },
  BOTH:     { tag: 'ROUTE: BOTH',     desc: 'Knowledge + web, merged',   color: '#7C5CFF', bg: '#EEEAFF' },
  NONE:     { tag: 'ROUTE: NONE',     desc: 'Direct reply, no agents',   color: '#7E7A95', bg: '#EFEEF4' },
  DOCUMENT: { tag: 'ROUTE: DOCUMENT', desc: 'Cloud document reader',     color: '#00A1E0', bg: '#E0F5FF' },
}

const STEP_META: Record<string, { label: string; color: string; soft: string }> = {
  manager:           { label: 'Manager agent',   color: '#7C5CFF', soft: '#EEEAFF' },
  knowledge:         { label: 'Knowledge agent', color: '#5566F2', soft: '#E9ECFE' },
  web:               { label: 'Web agent',       color: '#0EA5BE', soft: '#DFF4F7' },
  synthesis:         { label: 'Synthesis',       color: '#8B5CF6', soft: '#F0EAFE' },
  'document-reader': { label: 'Document Reader', color: '#00A1E0', soft: '#E0F5FF' },
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
function IconFile({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}

const STEP_ICONS: Record<string, (p: { size?: number }) => JSX.Element> = {
  manager:           IconBranch,
  knowledge:         IconDatabase,
  web:               IconGlobe,
  synthesis:         IconLayers,
  'document-reader': IconFile,
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

// ── Flow graph view ─────────────────────────────────────────
const GRAPH_NODES: Record<string, { x: number; y: number; w: number; kind: string; label: string }> = {
  start:             { x: 109, y: 6,   w: 92,  kind: 'start',           label: 'Start'       },
  manager:           { x: 97,  y: 78,  w: 116, kind: 'manager',         label: 'Manager'     },
  router:            { x: 97,  y: 150, w: 116, kind: 'route',           label: 'Router'      },
  knowledge:         { x: 4,   y: 232, w: 118, kind: 'knowledge',       label: 'Knowledge'   },
  web:               { x: 188, y: 232, w: 96,  kind: 'web',             label: 'Web'         },
  'document-reader': { x: 97,  y: 232, w: 116, kind: 'document-reader', label: 'Doc Reader'  },
  synthesis:         { x: 97,  y: 314, w: 116, kind: 'synthesis',       label: 'Synthesis'   },
  response:          { x: 97,  y: 392, w: 116, kind: 'respond',         label: 'Response'    },
}
const NODE_H = 44
const CANVAS_W = 310
const CANVAS_H = 446

const TAKEN: Record<string, string[]> = {
  INTERNAL: ['start', 'manager', 'router', 'knowledge',         'synthesis', 'response'],
  WEB:      ['start', 'manager', 'router', 'web',               'synthesis', 'response'],
  BOTH:     ['start', 'manager', 'router', 'knowledge', 'web',  'synthesis', 'response'],
  NONE:     ['start', 'manager', 'router', 'response'],
  DOCUMENT: ['start', 'manager', 'router', 'document-reader',   'response'],
}

const NODE_ICONS: Record<string, (p: { size?: number }) => JSX.Element> = {
  start:             IconRoute,
  manager:           IconBranch,
  route:             IconRoute,
  knowledge:         IconDatabase,
  web:               IconGlobe,
  'document-reader': IconFile,
  synthesis:         IconLayers,
  respond:           IconTerminal,
}

function FlowView({ run }: { run: RouteRun }) {
  const route = run.route
  const taken = new Set(route ? TAKEN[route] : ['start', 'manager', 'router'])

  const nodeStatus = (key: string): 'pending' | 'active' | 'done' => {
    // Start is always done once any query has been sent
    if (key === 'start') return run.status === 'idle' ? 'pending' : 'done'
    // Response node is done when the whole run is done
    if (key === 'response') return run.status === 'done' ? 'done' : run.status === 'running' ? 'active' : 'pending'
    // Router is done as soon as route is known
    if (key === 'router') return route ? 'done' : run.steps.find(s => s.name === 'manager')?.status === 'done' ? 'done' : 'pending'
    const n = GRAPH_NODES[key]
    if (!n) return 'pending'
    const step = run.steps.find(s => s.name === n.kind)
    // If run is done and node is on the taken path, mark it done even if no explicit step event
    if (!step && run.status === 'done' && taken.has(key)) return 'done'
    return step ? (step.status as 'pending' | 'active' | 'done') : 'pending'
  }

  const anchorB = (n: typeof GRAPH_NODES[string]) => ({ x: n.x + n.w / 2, y: n.y + NODE_H })
  const anchorT = (n: typeof GRAPH_NODES[string]) => ({ x: n.x + n.w / 2, y: n.y })

  const edges: [string, string, string?][] = [
    ['start', 'manager'],
    ['manager', 'router'],
  ]
  if (route === 'NONE') {
    edges.push(['router', 'response', 'skip'])
  } else {
    if (!route || taken.has('knowledge')) edges.push(['router', 'knowledge'])
    if (!route || taken.has('web'))       edges.push(['router', 'web'])
    if (!route || taken.has('knowledge')) edges.push(['knowledge', 'synthesis'])
    if (!route || taken.has('web'))       edges.push(['web', 'synthesis'])
    edges.push(['synthesis', 'response'])
  }

  const edgeState = (a: string, b: string): 'dim' | 'done' | 'active' | 'ready' | 'pending' => {
    const onPath = taken.has(a) && taken.has(b)
    if (!onPath && route) return 'dim'
    const sa = nodeStatus(a), sb = nodeStatus(b)
    if (sa === 'done' && sb === 'done') return 'done'
    if (sa === 'done' && sb === 'active') return 'active'
    if (sa === 'done' && sb === 'pending') return 'ready'
    return 'pending'
  }

  return (
    <div style={{ padding: '14px 16px 22px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: CANVAS_W, height: CANVAS_H }}>
        {/* SVG edges */}
        <svg width={CANVAS_W} height={CANVAS_H} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          {edges.map(([a, b], i) => {
            const na = GRAPH_NODES[a], nb = GRAPH_NODES[b]
            if (!na || !nb) return null
            const p1 = anchorB(na), p2 = anchorT(nb)
            const my = (p1.y + p2.y) / 2
            const d = `M${p1.x},${p1.y} C${p1.x},${my} ${p2.x},${my} ${p2.x},${p2.y}`
            const st = edgeState(a, b)
            const dim = st === 'dim'
            const stroke = dim ? '#E7E4F0'
              : st === 'done' ? '#16B981'
              : (st === 'active' || st === 'ready') ? '#7C5CFF'
              : '#D7D3E8'
            return (
              <g key={i}>
                <path d={d} fill="none" stroke={stroke} strokeWidth={dim ? 1.5 : 2.2}
                  strokeDasharray={st === 'ready' || dim ? '5 6' : 'none'}
                  strokeLinecap="round" opacity={dim ? 0.7 : 1} />
                {st === 'active' && (
                  <path d={d} fill="none" stroke="#fff" strokeWidth={2.4}
                    strokeDasharray="6 18" strokeLinecap="round"
                    style={{ animation: 'flowDash .7s linear infinite' }} opacity={0.95} />
                )}
              </g>
            )
          })}
        </svg>

        {/* Nodes */}
        {Object.entries(GRAPH_NODES).map(([key, n]) => {
          const m = STEP_META[n.kind] || STEP_META.manager
          const st = nodeStatus(key)
          const onPath = taken.has(key)
          const dim = !!(route && !onPath)
          const active = st === 'active'
          const done = st === 'done'
          const Icon = NODE_ICONS[n.kind] || IconBranch
          return (
            <div key={key} style={{
              position: 'absolute', left: n.x, top: n.y, width: n.w, height: NODE_H,
              display: 'flex', alignItems: 'center', gap: 7, padding: '0 9px',
              borderRadius: 11, background: '#fff',
              border: `1.5px solid ${active ? m.color : done ? '#9be4c9' : '#E7E4F0'}`,
              boxShadow: active ? `0 6px 18px ${m.color}33` : '0 1px 3px rgba(36,24,80,.05)',
              opacity: dim ? 0.2 : 1,
              filter: dim ? 'grayscale(1)' : 'none',
              transition: 'all .35s',
            }}>
              <span style={{ width: 26, height: 26, borderRadius: 8, display: 'grid', placeItems: 'center',
                flexShrink: 0, color: '#fff',
                background: done ? '#16B981' : m.color }}>
                {done && key !== 'router' ? <IconCheck size={15} /> : <Icon size={14} />}
              </span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700,
                  color: dim ? '#928FAA' : '#211D38',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'clip' }}>{n.label}</div>
              </div>
              {active && (
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
                  style={{ animation: 'spin .85s linear infinite', flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="9" stroke={m.color} strokeOpacity="0.18" strokeWidth={2.4} />
                  <path d="M21 12a9 9 0 0 0-9-9" stroke={m.color} strokeWidth={2.4} strokeLinecap="round" />
                </svg>
              )}
              {done && key === 'router' && route && (
                <span style={{ width: 7, height: 7, borderRadius: 99,
                  background: ROUTE_META[route]?.color || '#16B981', flexShrink: 0 }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
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
      <div ref={ref} style={{ maxHeight: 220, overflowY: 'auto', padding: '10px 12px',
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
    { k: 'WEB',      agent: 'web-agent'        },
    { k: 'BOTH',     agent: 'knowledge + web'  },
    { k: 'NONE',     agent: 'direct reply'     },
    { k: 'DOCUMENT', agent: 'document-reader'  },
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
function IconGrid({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

type PanelView = 'timeline' | 'flow' | 'console'

const VIEWS: { id: PanelView; label: string; Icon: (p: { size?: number }) => JSX.Element }[] = [
  { id: 'timeline', label: 'Timeline', Icon: IconRoute },
  { id: 'flow',     label: 'Flow',     Icon: IconGrid },
  { id: 'console',  label: 'Console',  Icon: IconTerminal },
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
  const PanelBody = view === 'timeline' ? TimelineView : view === 'flow' ? FlowView : ConsoleView

  return (
    <aside style={{
      width: 380, flexShrink: 0, background: '#FAFAFE', borderLeft: '1px solid #ECEAF5',
      display: 'flex', flexDirection: 'column', height: '100%',
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

      {/* Body — scrollable so Flow canvas and Console log never clip */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
        {idle ? <IdleState /> : <PanelBody run={run} />}
      </div>
    </aside>
  )
}
