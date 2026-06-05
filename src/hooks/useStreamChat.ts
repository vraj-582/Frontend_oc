import { useState, useCallback, useRef } from 'react'
import { getSession } from '../services/api'
import { streamChat } from '../services/sse'
import type { Message, RouteRun, RouteStep, LogEntry, StepName, RouteName } from '../types'
import toast from 'react-hot-toast'

const IDLE_RUN: RouteRun = {
  status: 'idle',
  route: null,
  steps: [],
  elapsed: 0,
  log: [],
}

function stamp(t0: number): string {
  return '+' + ((performance.now() - t0) / 1000).toFixed(1) + 's'
}

export function useStreamChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [run, setRun] = useState<RouteRun>(IDLE_RUN)

  const abortRef = useRef<AbortController | null>(null)
  const timerRef = useRef<number>(0)
  const t0Ref = useRef<number>(0)

  const stop = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = 0
    }
    setIsLoading(false)
    setRun(prev => ({
      ...prev,
      status: 'done',
      steps: prev.steps.map(s =>
        s.status === 'active' ? { ...s, status: 'done' } : s
      ),
    }))
  }, [])

  const send = useCallback(async (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    // Initialize run state
    const t0 = performance.now()
    t0Ref.current = t0
    const initialSteps: RouteStep[] = [
      { name: 'manager', status: 'pending', label: 'Manager agent', detail: 'Analyzing intent & routing' },
    ]
    const initialLog: LogEntry[] = []
    setRun({
      status: 'running',
      route: null,
      steps: initialSteps,
      elapsed: 0,
      log: initialLog,
    })

    // Elapsed timer
    timerRef.current = window.setInterval(() => {
      setRun(prev => prev.status === 'running'
        ? { ...prev, elapsed: performance.now() - t0 }
        : prev
      )
    }, 100)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      await streamChat(text, sessionId, controller.signal, (eventType, data) => {
        const d = data as Record<string, string>

        if (eventType === 'step') {
          const stepName = d.step as StepName
          const status = d.status as 'active' | 'done'

          setRun(prev => {
            const existing = prev.steps.find(s => s.name === stepName)
            let newSteps: RouteStep[]

            if (existing) {
              // Update existing step status
              newSteps = prev.steps.map(s =>
                s.name === stepName ? { ...s, status } : s
              )
            } else {
              // Add new step
              newSteps = [...prev.steps, {
                name: stepName,
                status,
                label: d.label || stepName,
                detail: d.detail || '',
              }]
            }

            const logText = status === 'active'
              ? `${d.label || stepName} started`
              : `${d.label || stepName} completed`
            const logColor = status === 'done' ? '#A6F0CE' : '#C9B8FF'

            return {
              ...prev,
              steps: newSteps,
              log: [...prev.log, { ts: stamp(t0), text: logText, color: logColor }],
            }
          })
        } else if (eventType === 'route') {
          const route = d.route as RouteName
          setRun(prev => ({
            ...prev,
            route,
            log: [...prev.log, {
              ts: stamp(t0),
              text: `Route decided: ${route}`,
              color: '#C9B8FF',
            }],
          }))
        } else if (eventType === 'response') {
          // Clear timer
          if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = 0
          }

          const sid = d.session_id as string
          if (sid) setSessionId(sid)

          const assistantMsg: Message = {
            id: d.message_id as string,
            role: 'assistant',
            content: d.response as string,
            agent_used: d.agent_used as Message['agent_used'],
            created_at: new Date().toISOString(),
          }
          setMessages(prev => [...prev, assistantMsg])

          setRun(prev => ({
            ...prev,
            status: 'done',
            elapsed: performance.now() - t0,
            steps: prev.steps.map(s =>
              s.status === 'active' ? { ...s, status: 'done' } : s
            ),
            log: [...prev.log, {
              ts: stamp(t0),
              text: 'Response delivered',
              color: '#A6F0CE',
            }],
          }))

          setIsLoading(false)
        } else if (eventType === 'error') {
          setRun(prev => ({
            ...prev,
            log: [...prev.log, {
              ts: stamp(t0),
              text: `Error: ${d.message || 'Unknown error'}`,
              color: '#FF8A80',
            }],
          }))
        } else if (eventType === 'retry') {
          // Auto-recovery: reset steps for retry
          setRun(prev => ({
            ...prev,
            route: null,
            steps: [{ name: 'manager', status: 'active', label: 'Manager agent', detail: 'Retrying with fresh session...' }],
            log: [...prev.log, {
              ts: stamp(t0),
              text: 'Auto-recovery: retrying with fresh session',
              color: '#FFD700',
            }],
          }))
        }
      })
    } catch (e: unknown) {
      const name = (e as { name?: string })?.name
      if (name === 'AbortError') return

      toast.error('Something went wrong. Please try again.')
      setMessages(prev => prev.filter(m => m.id !== userMsg.id))
    } finally {
      abortRef.current = null
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = 0
      }
      setIsLoading(false)
    }
  }, [sessionId])

  const loadSession = useCallback(async (id: string) => {
    try {
      const data = await getSession(id)
      setSessionId(data.id)
      setMessages(data.messages)
      setRun(IDLE_RUN)
    } catch {
      toast.error('Failed to load session.')
    }
  }, [])

  const clearChat = useCallback(() => {
    stop()
    setMessages([])
    setSessionId(undefined)
    setRun(IDLE_RUN)
  }, [stop])

  return { messages, sessionId, isLoading, run, send, stop, loadSession, clearChat }
}
