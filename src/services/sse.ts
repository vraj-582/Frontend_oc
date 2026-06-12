/**
 * SSE streaming client for the /api/chat/stream endpoint.
 * Uses fetch() + ReadableStream (not EventSource) because we need
 * POST body and Authorization header — EventSource only supports GET.
 */

const BASE_URL = import.meta.env.VITE_API_URL || ''

export async function streamChat(
  message: string,
  sessionId: string | undefined,
  signal: AbortSignal,
  onEvent: (eventType: string, data: Record<string, unknown>) => void,
  mode: 'research' | 'document' = 'research',
): Promise<void> {
  const token = localStorage.getItem('token')
  const res = await fetch(`${BASE_URL}/api/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message, session_id: sessionId, mode }),
    signal,
  })

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return
    }
    const body = await res.text()
    throw new Error(body || `HTTP ${res.status}`)
  }

  const reader = res.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    // SSE format: events separated by \n\n
    const parts = buffer.split('\n\n')
    // Last part may be incomplete — keep it in the buffer
    buffer = parts.pop() || ''

    for (const part of parts) {
      if (!part.trim()) continue

      let eventType = 'message'
      let dataStr = ''

      for (const line of part.split('\n')) {
        if (line.startsWith('event: ')) {
          eventType = line.slice(7).trim()
        } else if (line.startsWith('data: ')) {
          dataStr = line.slice(6)
        } else if (line.startsWith(':')) {
          // SSE comment (heartbeat) — ignore
          continue
        }
      }

      if (dataStr) {
        try {
          const data = JSON.parse(dataStr)
          onEvent(eventType, data)
        } catch {
          console.warn('[SSE] Failed to parse:', dataStr)
        }
      }
    }
  }
}
