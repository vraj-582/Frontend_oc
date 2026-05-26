import { useEffect, useRef } from 'react'

// Small floating particles in the background. The cursor pushes them away
// when it comes close. Layer lives underneath the AgentWorkflow SVG and is
// fully decorative (pointer-events disabled so it never intercepts events).

const BUBBLE_COUNT = 80
const REPEL_RADIUS = 90
const REPEL_STRENGTH = 0.22
const DAMPING = 0.96
const JITTER = 0.10
const MIN_SPEED = 0.35
const MAX_SPEED = 1.5

// Hue palette aligned to the Orchestrix gradient: violet → indigo → blue → cyan.
const HUES = [276, 268, 252, 232, 212, 192]

type Bubble = {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  hue: number
  alpha: number
}

export function FloatingBubbles() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
    let width = 0
    let height = 0
    let bubbles: Bubble[] = []
    let mouseX = -10000
    let mouseY = -10000
    let mouseActive = false
    let rafId = 0
    let running = true

    const spawn = (): Bubble => {
      const r = 1.6 + Math.random() * 3.4
      const angle = Math.random() * Math.PI * 2
      const speed = 0.45 + Math.random() * 0.7
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        hue: HUES[Math.floor(Math.random() * HUES.length)],
        alpha: 0.55 + Math.random() * 0.35,
      }
    }

    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (bubbles.length === 0) {
        bubbles = Array.from({ length: BUBBLE_COUNT }, spawn)
      }
    }

    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    const handleMove = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect()
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      if (inside) {
        mouseX = e.clientX - rect.left
        mouseY = e.clientY - rect.top
        mouseActive = true
      } else {
        mouseActive = false
      }
    }
    const handleLeave = () => {
      mouseActive = false
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseleave', handleLeave)

    const tick = () => {
      if (!running) return

      ctx.clearRect(0, 0, width, height)

      for (const b of bubbles) {
        // Cursor repulsion — push particle away when the cursor gets close.
        if (mouseActive) {
          const dx = b.x - mouseX
          const dy = b.y - mouseY
          const dist = Math.hypot(dx, dy)
          if (dist > 0 && dist < REPEL_RADIUS) {
            const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * REPEL_STRENGTH
            b.vx += (dx / dist) * force
            b.vy += (dy / dist) * force
          }
        }

        // Light random nudge so they keep wandering.
        b.vx += (Math.random() - 0.5) * JITTER
        b.vy += (Math.random() - 0.5) * JITTER

        b.x += b.vx
        b.y += b.vy
        b.vx *= DAMPING
        b.vy *= DAMPING

        // Maintain a medium baseline speed so particles always feel alive,
        // but cap it so cursor-driven kicks don't fling them off screen.
        const sp = Math.hypot(b.vx, b.vy)
        if (sp < MIN_SPEED) {
          const a = sp > 0 ? Math.atan2(b.vy, b.vx) : Math.random() * Math.PI * 2
          b.vx = Math.cos(a) * MIN_SPEED
          b.vy = Math.sin(a) * MIN_SPEED
        } else if (sp > MAX_SPEED) {
          b.vx = (b.vx / sp) * MAX_SPEED
          b.vy = (b.vy / sp) * MAX_SPEED
        }

        // Wrap around edges (with bubble radius as margin).
        if (b.x - b.r > width) b.x = -b.r
        if (b.x + b.r < 0) b.x = width + b.r
        if (b.y - b.r > height) b.y = -b.r
        if (b.y + b.r < 0) b.y = height + b.r

        // Soft halo around the particle.
        const halo = b.r * 3.2
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, halo)
        grad.addColorStop(0, `hsla(${b.hue}, 90%, 60%, ${b.alpha})`)
        grad.addColorStop(0.35, `hsla(${b.hue}, 85%, 55%, ${b.alpha * 0.35})`)
        grad.addColorStop(1, `hsla(${b.hue}, 85%, 55%, 0)`)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(b.x, b.y, halo, 0, Math.PI * 2)
        ctx.fill()

        // Crisp particle core.
        ctx.fillStyle = `hsla(${b.hue}, 95%, 58%, ${Math.min(1, b.alpha + 0.15)})`
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.fill()
      }

      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    return () => {
      running = false
      cancelAnimationFrame(rafId)
      ro.disconnect()
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  )
}
