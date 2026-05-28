import { useState } from 'react'

export function InputBar({
  onSend,
  onStop,
  disabled,
}: {
  onSend: (text: string) => void
  onStop?: () => void
  disabled: boolean
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

  return (
    <div
      style={{
        padding: '12px 20px 16px',
        background: 'var(--bg)',
        borderTop: '1px solid var(--border)',
        flexShrink: 0,
      }}
    >
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
          placeholder={disabled ? 'Thinking…' : 'Ask Orchestrix anything…'}
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

        {/* ── Stop button — visible while a query is running ── */}
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
              background: stopHovered
                ? '#DC2626'
                : 'rgba(220, 38, 38, 0.10)',
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
            {/* Square stop icon */}
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
