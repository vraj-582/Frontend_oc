import { useState } from 'react'
import toast from 'react-hot-toast'
import { AgentWorkflow } from '../components/AgentWorkflow'
import { FloatingBubbles } from '../components/FloatingBubbles'

export function LoginPage({
  onLogin,
  onRegister,
  isLoading,
}: {
  onLogin: (email: string, password: string) => Promise<void>
  onRegister: (name: string, email: string, password: string, role: string) => Promise<void>
  isLoading: boolean
}) {
  const [tab, setTab] = useState<'signin' | 'register'>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('employee')
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({})

  const validateRegister = (n: string, em: string, pw: string) => {
    const errs: { name?: string; email?: string; password?: string } = {}

    if (!n.trim()) {
      errs.name = 'Full name is required'
    }

    if (!em.trim()) {
      errs.email = 'Email is required'
    } else if (!em.includes('@')) {
      errs.email = 'Email must contain an @ sign'
    }

    if (!pw) {
      errs.password = 'Password is required'
    } else if (pw.length < 8) {
      errs.password = 'Password must be at least 8 characters long'
    } else if (!/[A-Z]/.test(pw)) {
      errs.password = 'Password must contain at least one uppercase letter'
    } else if (!/[a-z]/.test(pw)) {
      errs.password = 'Password must contain at least one lowercase letter'
    } else if (!/[0-9]/.test(pw)) {
      errs.password = 'Password must contain at least one number'
    } else if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(pw)) {
      errs.password = 'Password must contain at least one special character'
    }

    return errs
  }

  const validateSignin = (em: string, pw: string) => {
    const errs: { email?: string; password?: string } = {}
    if (!em.trim()) {
      errs.email = 'Email is required'
    } else if (!em.includes('@')) {
      errs.email = 'Email must contain an @ sign'
    }
    if (!pw) {
      errs.password = 'Password is required'
    }
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (tab === 'register') {
        const errs = validateRegister(name, email, password)
        setErrors(errs)
        if (Object.keys(errs).length > 0) {
          const firstErr = errs.name || errs.email || errs.password
          if (firstErr) toast.error(firstErr)
          return
        }
        await onRegister(name.trim(), email.trim(), password, role)
      } else {
        const errs = validateSignin(email, password)
        setErrors(errs)
        if (Object.keys(errs).length > 0) {
          const firstErr = errs.email || errs.password
          if (firstErr) toast.error(firstErr)
          return
        }
        await onLogin(email.trim(), password)
      }
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(detail || 'Authentication failed')
    }
  }

  const switchTab = (t: 'signin' | 'register') => {
    setTab(t)
    setErrors({})
  }

  const errorText = (msg?: string) =>
    msg ? (
      <span style={{ fontSize: 11, color: '#DC2626', marginTop: 4, display: 'block' }}>
        {msg}
      </span>
    ) : null

  const fieldBorder = (hasError?: string) =>
    hasError ? '#DC2626' : 'var(--border)'

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    fontFamily: 'inherit',
    fontSize: 14,
    color: 'var(--text-primary)',
    background: 'var(--bg)',
    outline: 'none',
    transition: 'border-color 200ms ease, box-shadow 200ms ease',
  }

  const onFieldFocus = (e: React.FocusEvent<HTMLInputElement>, hasError?: string) => {
    e.target.style.borderColor = hasError ? '#DC2626' : 'var(--grad-start)'
    e.target.style.boxShadow = hasError
      ? '0 0 0 3px rgba(220,38,38,0.08)'
      : '0 0 0 3px rgba(168,86,247,0.08)'
  }
  const onFieldBlur = (e: React.FocusEvent<HTMLInputElement>, hasError?: string) => {
    e.target.style.borderColor = hasError ? '#DC2626' : 'var(--border)'
    e.target.style.boxShadow = 'none'
  }

  return (
    <div className="orx-auth-page">
      {/* ─── Left panel ─── */}
      <aside className="orx-auth-left">
        <div className="orx-auth-grid" aria-hidden="true" />
        <FloatingBubbles />
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            zIndex: 2,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img
              src="/logo.svg"
              alt="Orchestrix logo"
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                objectFit: 'cover',
                flexShrink: 0,
              }}
            />
            <span
              className="gradient-text"
              style={{
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              Orchestrix
            </span>
          </div>
          <div
            style={{
              fontSize: 12,
              color: '#9898B8',
              textAlign: 'center',
              maxWidth: 240,
              lineHeight: 1.6,
              fontWeight: 400,
            }}
          >
            Multi-agent AI that routes, retrieves &amp; synthesizes
          </div>
          <AgentWorkflow />
        </div>
      </aside>

      {/* ─── Right panel / form ─── */}
      <section className="orx-auth-right">
        <div
          className="fade-in-up"
          style={{
            width: '100%',
            maxWidth: 360,
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <img
                src="/logo.svg"
                alt="Orchestrix logo"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  objectFit: 'cover',
                  flexShrink: 0,
                }}
              />
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                Orchestrix<span style={{ color: 'var(--grad-start)' }}>.</span>
              </h1>
            </div>
            <p
              style={{
                fontSize: 13,
                color: 'var(--text-secondary)',
                fontWeight: 400,
                marginTop: 6,
                marginBottom: 0,
              }}
            >
              {tab === 'signin'
                ? 'Sign in to your workspace'
                : 'Create your Orchestrix account'}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-pill)',
              padding: 4,
              marginBottom: 22,
              gap: 4,
            }}
          >
            {(['signin', 'register'] as const).map(t => {
              const active = tab === t
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => switchTab(t)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    border: 'none',
                    borderRadius: 'var(--radius-pill)',
                    background: active ? 'var(--gradient)' : 'transparent',
                    color: active ? '#fff' : 'var(--text-secondary)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 200ms ease, color 200ms ease',
                  }}
                >
                  {t === 'signin' ? 'Sign In' : 'Register'}
                </button>
              )
            })}
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            {tab === 'register' && (
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={e => {
                    const filtered = e.target.value.replace(/[^A-Za-z ]/g, '').slice(0, 50)
                    setName(filtered)
                  }}
                  maxLength={50}
                  placeholder="Full name"
                  style={{ ...inputStyle, borderColor: fieldBorder(errors.name) }}
                  onFocus={e => onFieldFocus(e, errors.name)}
                  onBlur={e => onFieldBlur(e, errors.name)}
                />
                {errorText(errors.name)}
              </div>
            )}

            <div>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value.replace(/\s/g, ''))}
                placeholder="Email address"
                style={{ ...inputStyle, borderColor: fieldBorder(errors.email) }}
                onFocus={e => onFieldFocus(e, errors.email)}
                onBlur={e => onFieldBlur(e, errors.email)}
              />
              {errorText(errors.email)}
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value.replace(/\s/g, ''))}
                placeholder="Password"
                style={{ ...inputStyle, paddingRight: 40, borderColor: fieldBorder(errors.password) }}
                onFocus={e => onFieldFocus(e, errors.password)}
                onBlur={e => onFieldBlur(e, errors.password)}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: 18,
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  {showPw ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  ) : (
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </>
                  )}
                </svg>
              </button>
              {errorText(errors.password)}
            </div>

            {tab === 'register' && (
              <div>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  style={{
                    ...inputStyle,
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239898B8' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 14px center',
                    paddingRight: 36,
                  }}
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="hr">HR Staff</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: 10,
                width: '100%',
                padding: '12px 0',
                borderRadius: 'var(--radius-lg)',
                border: 'none',
                background: 'var(--gradient)',
                color: '#fff',
                fontFamily: 'inherit',
                fontSize: 14,
                fontWeight: 600,
                cursor: isLoading ? 'default' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'filter 150ms ease, transform 150ms ease',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                letterSpacing: '0.01em',
              }}
              onMouseEnter={e => {
                if (!isLoading) {
                  e.currentTarget.style.filter = 'brightness(1.08)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.filter = 'brightness(1)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {isLoading ? (
                <span
                  style={{
                    display: 'inline-block',
                    width: 16,
                    height: 16,
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
              ) : tab === 'signin' ? (
                <>
                  Sign in <span style={{ fontSize: 16, lineHeight: 1 }}>→</span>
                </>
              ) : (
                <>
                  Create account <span style={{ fontSize: 16, lineHeight: 1 }}>→</span>
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      <style>{`
        @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
