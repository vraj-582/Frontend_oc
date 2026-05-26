import { useState, useCallback } from 'react'
import { sendMessage, getSession } from '../services/api'
import type { Message } from '../types'
import toast from 'react-hot-toast'

export function useChat() {
  const [messages, setMessages]   = useState<Message[]>([])
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(false)

  const send = useCallback(async (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    try {
      const res = await sendMessage(text, sessionId)
      if (res.session_id) {
        setSessionId(res.session_id)
      }
      const assistantMsg: Message = {
        id: res.message_id,
        role: 'assistant',
        content: res.response,
        agent_used: res.agent_used,
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(detail || 'Something went wrong. Please try again.')
      // Remove the optimistic user message on failure
      setMessages(prev => prev.filter(m => m.id !== userMsg.id))
    } finally {
      setIsLoading(false)
    }
  }, [sessionId])

  const loadSession = useCallback(async (id: string) => {
    try {
      const data = await getSession(id)
      setSessionId(data.id)
      setMessages(data.messages)
    } catch {
      toast.error('Failed to load session.')
    }
  }, [])

  const clearChat = useCallback(() => {
    setMessages([])
    setSessionId(undefined)
  }, [])

  return { messages, sessionId, isLoading, send, loadSession, clearChat }
}
