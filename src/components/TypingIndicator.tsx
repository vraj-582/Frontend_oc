export function TypingIndicator() {
  return (
    <div
      className="message-enter"
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'flex-end',
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'var(--gradient)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 11,
          fontWeight: 600,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        O
      </div>
      <div
        style={{
          padding: '14px 18px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '18px 18px 18px 4px',
          display: 'flex',
          gap: 5,
          alignItems: 'center',
        }}
      >
        {[0, 1, 2].map(i => (
          <span
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--grad-mid)',
              opacity: 0.4,
              animation: `typingBounce 1.2s ease-in-out ${i * 0.15}s infinite`,
              display: 'inline-block',
            }}
          />
        ))}
      </div>
    </div>
  )
}
