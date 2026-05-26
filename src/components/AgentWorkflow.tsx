import { useEffect, useId, useRef } from 'react'

const CYCLE = 5800
const SEG_DUR = 560

const SEGS = [
  { t: 't1', d: 'd1', delay: 0 },
  { t: 't2a', d: 'd2a', delay: 560 },
  { t: 't2b', d: 'd2b', delay: 560 },
  { t: 't3a', d: 'd3a', delay: 1120 },
  { t: 't3b', d: 'd3b', delay: 1120 },
  { t: 't4', d: 'd4', delay: 1680 },
]

const RINGS = [
  { id: 'r-uq', t: 0 },
  { id: 'r-or', t: 560 },
  { id: 'r-kn', t: 1140 },
  { id: 'r-wb', t: 1140 },
  { id: 'r-sy', t: 1720 },
  { id: 'r-an', t: 2300 },
]

const pct = (v: number) => (v * 100).toFixed(3) + '%'
const f4 = (v: number) => v.toFixed(4)
const svgEl = (tag: string) =>
  document.createElementNS('http://www.w3.org/2000/svg', tag)

// Each node is a 100 × 80 rounded square.
const BOX_W = 100
const BOX_H = 80
const BOX_RX = 14

type Node = {
  key: 'uq' | 'or' | 'kn' | 'wb' | 'sy' | 'an'
  cx: number
  cy: number
  color: string
  label: string
}

// Horizontal flow: left → right, with the Knowledge / Web branch above & below.
const NODES: Node[] = [
  { key: 'uq', cx: 70,  cy: 180, color: '#A856F7', label: 'User Query' },
  { key: 'or', cx: 210, cy: 180, color: '#6A5ACD', label: 'Orchestrator' },
  { key: 'kn', cx: 370, cy: 90,  color: '#8B5CF6', label: 'Knowledge' },
  { key: 'wb', cx: 370, cy: 270, color: '#00A1E0', label: 'Web Agent' },
  { key: 'sy', cx: 530, cy: 180, color: '#5B68E8', label: 'Synthesis' },
  { key: 'an', cx: 670, cy: 180, color: '#00A1E0', label: 'Answer' },
]

function Icon({ which, color }: { which: Node['key']; color: string }) {
  switch (which) {
    case 'uq':
      return (
        <g stroke={color} strokeWidth="1.4" fill="none" strokeLinejoin="round">
          <path d="M-9,-6 h18 a2,2 0 0 1 2,2 v10 a2,2 0 0 1-2,2 h-7 l-5,5 v-5 h-4 a2,2 0 0 1-2-2 v-10 a2,2 0 0 1 2-2 z" />
          <circle cx="-4" cy="1" r="1.2" fill={color} stroke="none" />
          <circle cx="0" cy="1" r="1.2" fill={color} stroke="none" />
          <circle cx="4" cy="1" r="1.2" fill={color} stroke="none" />
        </g>
      )
    case 'or':
      return (
        <g stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round">
          <rect x="-11" y="-8" width="22" height="16" rx="2.5" />
          {[-8, -4, 0, 4, 8].map(x => (
            <line key={`pt-${x}`} x1={x} y1={-8} x2={x} y2={-12} />
          ))}
          {[-8, -4, 0, 4, 8].map(x => (
            <line key={`pb-${x}`} x1={x} y1={8} x2={x} y2={12} />
          ))}
          <rect x="-8" y="-5" width="16" height="10" rx="1.5" strokeOpacity="0.45" strokeWidth="1" />
          <circle cx="-4" cy="0" r="1.5" fill={color} stroke="none" fillOpacity="0.7" />
          <circle cx="0" cy="0" r="1.5" fill={color} stroke="none" fillOpacity="0.7" />
          <circle cx="4" cy="0" r="1.5" fill={color} stroke="none" fillOpacity="0.7" />
        </g>
      )
    case 'kn':
      return (
        <g stroke={color} strokeWidth="1.4" fill="none">
          <ellipse cx="0" cy="-7" rx="8" ry="3" />
          <path d="M-8,-7 v13" />
          <path d="M8,-7 v13" />
          <ellipse cx="0" cy="6" rx="8" ry="3" />
          <path d="M-8,-1 a8,3 0 0 0 16,0" strokeOpacity="0.4" strokeWidth="1" />
        </g>
      )
    case 'wb':
      return (
        <g stroke={color} strokeWidth="1.4" fill="none">
          <circle cx="0" cy="0" r="8.5" />
          <ellipse cx="0" cy="0" rx="4" ry="8.5" />
          <line x1="-8.5" y1="0" x2="8.5" y2="0" />
          <path d="M-7,-6 a14,3 0 0 1 14,0" strokeOpacity="0.4" strokeWidth="1" />
          <path d="M-7,6 a14,3 0 0 0 14,0" strokeOpacity="0.4" strokeWidth="1" />
        </g>
      )
    case 'sy':
      return (
        <g stroke={color} strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-10,-7 L0,0 L10,-7" />
          <line x1="0" y1="0" x2="0" y2="8" />
          <path d="M-7,-14 L-10,-7" strokeOpacity="0.5" strokeWidth="1.3" />
          <path d="M7,-14 L10,-7" strokeOpacity="0.5" strokeWidth="1.3" />
        </g>
      )
    case 'an':
      return (
        <path
          d="M-9,0 L-3,7 L10,-8"
          fill="none"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )
  }
}

export function AgentWorkflow() {
  const rootId = useId().replace(/:/g, '')
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const root = svgRef.current
    if (!root) return

    const prefix = `wf-${rootId}-`
    let css = ''

    SEGS.forEach(({ t, delay }) => {
      const el = root.querySelector<SVGPathElement>(`#${prefix}${t}`)
      if (!el) return
      const len = Math.ceil(el.getTotalLength()) + 1

      const s = delay / CYCLE
      const e = (delay + SEG_DUR) / CYCLE
      const hold = 0.78
      const fade = 0.88
      const kname = `${prefix}trf-${t}`

      css += `
@keyframes ${kname} {
  0%             { stroke-dasharray:${len} ${len * 2}; stroke-dashoffset:${len}; opacity:0; }
  ${pct(s)}      { stroke-dasharray:${len} ${len * 2}; stroke-dashoffset:${len}; opacity:1; }
  ${pct(e)}      { stroke-dasharray:${len} ${len * 2}; stroke-dashoffset:0;      opacity:1; }
  ${pct(hold)}   { stroke-dasharray:${len} ${len * 2}; stroke-dashoffset:0;      opacity:0.95; }
  ${pct(fade)}   { stroke-dasharray:${len} ${len * 2}; stroke-dashoffset:0;      opacity:0; }
  99.9%          { stroke-dasharray:${len} ${len * 2}; stroke-dashoffset:${len}; opacity:0; }
  100%           { stroke-dasharray:${len} ${len * 2}; stroke-dashoffset:${len}; opacity:0; }
}
#${prefix}${t} {
  stroke-dasharray:${len} ${len * 2};
  stroke-dashoffset:${len};
  opacity:0;
  animation:${kname} ${CYCLE}ms linear infinite;
}
`
    })

    RINGS.forEach(({ id, t: ms }) => {
      const el = root.querySelector<SVGRectElement>(`#${prefix}${id}`)
      if (!el) return
      const s = ms / CYCLE
      const peak = Math.min(s + 0.028, 0.98)
      const end = Math.min(s + 0.095, 0.99)
      const kname = `${prefix}rng-${id.replace('-', '')}`
      css += `
@keyframes ${kname} {
  0%            { transform:scale(1);    opacity:0; }
  ${pct(s)}     { transform:scale(1);    opacity:0.75; }
  ${pct(peak)}  { transform:scale(1.07); opacity:0.4; }
  ${pct(end)}   { transform:scale(1.18); opacity:0; }
  100%          { transform:scale(1);    opacity:0; }
}
#${prefix}${id} {
  transform-box: fill-box;
  transform-origin: center;
  animation:${kname} ${CYCLE}ms ease-out infinite;
}
`
    })

    const styleNode = document.createElement('style')
    styleNode.textContent = css
    document.head.appendChild(styleNode)

    const cleanupNodes: SVGElement[] = []
    SEGS.forEach(({ t, d, delay }) => {
      const dotEl = root.querySelector<SVGCircleElement>(`#${prefix}${d}`)
      const pathEl = root.querySelector<SVGPathElement>(`#${prefix}${t}`)
      if (!dotEl || !pathEl) return

      const s = delay / CYCLE
      const e = (delay + SEG_DUR) / CYCLE
      const eps = 0.002

      const am = svgEl('animateMotion')
      am.setAttribute('dur', CYCLE + 'ms')
      am.setAttribute('repeatCount', 'indefinite')
      am.setAttribute('calcMode', 'linear')
      am.setAttribute('keyTimes', `0;${f4(s)};${f4(e)};1`)
      am.setAttribute('keyPoints', `0;0;1;1`)
      const mp = svgEl('mpath')
      mp.setAttribute('href', `#${prefix}${t}`)
      am.appendChild(mp)
      dotEl.appendChild(am)
      cleanupNodes.push(am)

      const ao = svgEl('animate')
      ao.setAttribute('attributeName', 'opacity')
      ao.setAttribute('dur', CYCLE + 'ms')
      ao.setAttribute('repeatCount', 'indefinite')
      ao.setAttribute('calcMode', 'linear')
      ao.setAttribute(
        'keyTimes',
        `0;${f4(Math.max(0, s - eps))};${f4(s)};${f4(e)};${f4(Math.min(1, e + eps))};1`
      )
      ao.setAttribute('values', '0;0;1;1;0;0')
      dotEl.appendChild(ao)
      cleanupNodes.push(ao)
    })

    return () => {
      styleNode.remove()
      cleanupNodes.forEach(n => n.parentNode?.removeChild(n))
    }
  }, [rootId])

  const p = `wf-${rootId}-`

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 740 360"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: 720, maxWidth: '100%', height: 'auto', overflow: 'visible' }}
      aria-hidden="true"
    >
      <defs>
        <filter id={`${p}fNode`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="#7B5CF0" floodOpacity="0.14" />
        </filter>
        <filter id={`${p}fGlow`} x="-40%" y="-120%" width="180%" height="340%">
          <feGaussianBlur stdDeviation="2.8" result="b" />
          <feComposite in="SourceGraphic" in2="b" operator="over" />
        </filter>
        <filter id={`${p}fDot`} x="-300%" y="-300%" width="700%" height="700%">
          <feGaussianBlur stdDeviation="4.5" result="b" />
          <feComposite in="SourceGraphic" in2="b" operator="over" />
        </filter>

        {/* Horizontal-flow gradients (left → right, plus diagonals) */}
        <linearGradient id={`${p}g1`} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#A856F7" />
          <stop offset="100%" stopColor="#8A52F4" />
        </linearGradient>
        <linearGradient id={`${p}g2a`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8A52F4" />
          <stop offset="100%" stopColor="#6A5ACD" />
        </linearGradient>
        <linearGradient id={`${p}g2b`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8A52F4" />
          <stop offset="100%" stopColor="#4A80E8" />
        </linearGradient>
        <linearGradient id={`${p}g3a`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6A5ACD" />
          <stop offset="100%" stopColor="#4870E0" />
        </linearGradient>
        <linearGradient id={`${p}g3b`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4A80E8" />
          <stop offset="100%" stopColor="#4870E0" />
        </linearGradient>
        <linearGradient id={`${p}g4`} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#4870E0" />
          <stop offset="100%" stopColor="#00A1E0" />
        </linearGradient>
      </defs>

      {/* Skeleton paths */}
      <path d="M120,180 L160,180" fill="none" stroke="#CFC6E8" strokeWidth="1.5" strokeDasharray="3,5" />
      <path d="M260,160 L320,110" fill="none" stroke="#CFC6E8" strokeWidth="1.5" strokeDasharray="3,5" />
      <path d="M260,200 L320,250" fill="none" stroke="#CFC6E8" strokeWidth="1.5" strokeDasharray="3,5" />
      <path d="M420,110 L480,160" fill="none" stroke="#CFC6E8" strokeWidth="1.5" strokeDasharray="3,5" />
      <path d="M420,250 L480,200" fill="none" stroke="#CFC6E8" strokeWidth="1.5" strokeDasharray="3,5" />
      <path d="M580,180 L620,180" fill="none" stroke="#CFC6E8" strokeWidth="1.5" strokeDasharray="3,5" />

      {/* Animated trail paths */}
      <path id={`${p}t1`}  d="M120,180 L160,180" fill="none" stroke={`url(#${p}g1)`}  strokeWidth="3" strokeLinecap="round" filter={`url(#${p}fGlow)`} />
      <path id={`${p}t2a`} d="M260,160 L320,110" fill="none" stroke={`url(#${p}g2a)`} strokeWidth="3" strokeLinecap="round" filter={`url(#${p}fGlow)`} />
      <path id={`${p}t2b`} d="M260,200 L320,250" fill="none" stroke={`url(#${p}g2b)`} strokeWidth="3" strokeLinecap="round" filter={`url(#${p}fGlow)`} />
      <path id={`${p}t3a`} d="M420,110 L480,160" fill="none" stroke={`url(#${p}g3a)`} strokeWidth="3" strokeLinecap="round" filter={`url(#${p}fGlow)`} />
      <path id={`${p}t3b`} d="M420,250 L480,200" fill="none" stroke={`url(#${p}g3b)`} strokeWidth="3" strokeLinecap="round" filter={`url(#${p}fGlow)`} />
      <path id={`${p}t4`}  d="M580,180 L620,180" fill="none" stroke={`url(#${p}g4)`}  strokeWidth="3" strokeLinecap="round" filter={`url(#${p}fGlow)`} />

      {/* Head dots */}
      <circle id={`${p}d1`}  r="5.5" fill="#A856F7" filter={`url(#${p}fDot)`} opacity="0" />
      <circle id={`${p}d2a`} r="5"   fill="#7A53F0" filter={`url(#${p}fDot)`} opacity="0" />
      <circle id={`${p}d2b`} r="5"   fill="#5B7FE0" filter={`url(#${p}fDot)`} opacity="0" />
      <circle id={`${p}d3a`} r="5"   fill="#4870E0" filter={`url(#${p}fDot)`} opacity="0" />
      <circle id={`${p}d3b`} r="5"   fill="#3A8AE0" filter={`url(#${p}fDot)`} opacity="0" />
      <circle id={`${p}d4`}  r="5.5" fill="#00A1E0" filter={`url(#${p}fDot)`} opacity="0" />

      {NODES.map(n => (
        <g key={n.key} transform={`translate(${n.cx} ${n.cy})`}>
          <rect
            x={-BOX_W / 2}
            y={-BOX_H / 2}
            width={BOX_W}
            height={BOX_H}
            rx={BOX_RX}
            fill="#ffffff"
            filter={`url(#${p}fNode)`}
          />
          <rect
            x={-BOX_W / 2}
            y={-BOX_H / 2}
            width={BOX_W}
            height={BOX_H}
            rx={BOX_RX}
            fill="none"
            stroke={n.color}
            strokeWidth="1.5"
            strokeOpacity="0.28"
          />
          <rect
            id={`${p}r-${n.key}`}
            x={-BOX_W / 2}
            y={-BOX_H / 2}
            width={BOX_W}
            height={BOX_H}
            rx={BOX_RX}
            fill="none"
            stroke={n.color}
            strokeWidth="2"
            opacity="0"
          />
          <g transform="translate(0 -12) scale(1.2)">
            <Icon which={n.key} color={n.color} />
          </g>
          <text
            x="0"
            y="22"
            fontFamily="Poppins, sans-serif"
            fontSize="11"
            fontWeight="600"
            textAnchor="middle"
            fill={n.color}
            fillOpacity="0.9"
            letterSpacing="0.02em"
          >
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  )
}
