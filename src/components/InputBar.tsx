import { useState } from 'react'

export function InputBar({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void
  disabled: boolean
}) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)

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
          placeholder="Ask Orchestrix anything…"
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: 'inherit',
            fontSize: 14,
            fontWeight: 400,
            color: 'var(--text-primary)',
            padding: '8px 0',
            minWidth: 0,
          }}
        />

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
      </div>
    </div>
  )
}
