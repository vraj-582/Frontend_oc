import { useState } from 'react'
import type { ChatMode } from '../types'

function IconSearch({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  )
}

function IconFile({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}

export function InputBar({
  onSend,
  onStop,
  disabled,
  mode = 'research',
  onModeChange,
}: {
  onSend: (text: string) => void
  onStop?: () => void
  disabled: boolean
  mode?: ChatMode
  onModeChange?: (mode: ChatMode) => void
}) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const [stopHovered, setStopHovered] = useState(false)

  const send = () => {
    const text = value.trim()
    if (!text || disabled) return
    onSend(text)
    setValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const canSend = value.trim().length > 0 && !disabled

  const MODES: { id: ChatMode; label: string; Icon: (p: { size?: number }) => JSX.Element }[] = [
    { id: 'research',  label: 'Research',  Icon: IconSearch },
    { id: 'document',  label: 'Documents', Icon: IconFile   },
  ]

  return (
    <div
      style={{
        padding: '10px 20px 16px',
        background: 'var(--bg)',
        borderTop: '1px solid var(--border)',
        flexShrink: 0,
      }}
    >
      {/* ── Mode toggle ── */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
        <div
          style={{
            display: 'inline-flex',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 999,
            padding: 3,
            gap: 2,
          }}
        >
          {MODES.map(({ id, label, Icon }) => {
            const active = mode === id
            return (
              <button
                key={id}
                type="button"
                disabled={disabled}
                onClick={() => !disabled && onModeChange?.(id)}
                title={disabled ? 'Wait for the current query to finish' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 14px',
                  borderRadius: 999,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  background: active ? 'var(--gradient)' : 'transparent',
                  color: active ? '#fff' : 'var(--text-secondary)',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled && !active ? 0.4 : 1,
                  transition: 'background 200ms ease, color 200ms ease, opacity 200ms ease',
                  letterSpacing: '0.01em',
                }}
              >
                <Icon size={13} />
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Input pill ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '6px 6px 6px 20px',
          borderRadius: 'var(--radius-pill)',
          border: focused
            ? '1.5px solid var(--grad-start)'
            : '1.5px solid var(--border)',
          background: 'var(--bg)',
          boxShadow: focused ? '0 0 0 3px rgba(168,86,247,0.08)' : 'none',
          transition: 'border-color 200ms ease, box-shadow 200ms ease',
          maxWidth: 880,
          margin: '0 auto',
        }}
      >
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          placeholder={
            disabled
              ? 'Thinking…'
              : mode === 'document'
              ? 'Ask about your documents…'
              : 'Ask Orchestrix anything…'
          }
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: 'inherit',
            fontSize: 14,
            fontWeight: 400,
            color: disabled ? 'var(--text-muted)' : 'var(--text-primary)',
            padding: '8px 0',
            minWidth: 0,
          }}
        />

        {/* ── Stop button ── */}
        {disabled && onStop ? (
          <button
            onClick={onStop}
            aria-label="Stop"
            onMouseEnter={() => setStopHovered(true)}
            onMouseLeave={() => setStopHovered(false)}
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: stopHovered ? '#DC2626' : 'rgba(220, 38, 38, 0.10)',
              border: '1.5px solid rgba(220,38,38,0.30)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: stopHovered ? '#fff' : '#DC2626',
              cursor: 'pointer',
              transition: 'background 150ms ease, color 150ms ease, transform 150ms ease',
              flexShrink: 0,
              transform: stopHovered ? 'scale(1.07)' : 'scale(1)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <rect x="1" y="1" width="10" height="10" rx="2" />
            </svg>
          </button>
        ) : (
          /* ── Send button ── */
          <button
            onClick={send}
            disabled={!canSend}
            aria-label="Send"
            onMouseEnter={e => {
              if (canSend) e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={e => {
              if (canSend) e.currentTarget.style.transform = 'scale(1)'
            }}
            onMouseDown={e => {
              if (canSend) e.currentTarget.style.transform = 'scale(0.93)'
            }}
            onMouseUp={e => {
              if (canSend) e.currentTarget.style.transform = 'scale(1.05)'
            }}
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: canSend ? 'var(--gradient)' : 'var(--border)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              cursor: canSend ? 'pointer' : 'default',
              transition: 'transform 150ms ease, background 200ms ease',
              flexShrink: 0,
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
