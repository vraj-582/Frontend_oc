export interface User {
  id: string
  name: string
  email: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  agent_used?: 'knowledge' | 'web' | 'both' | 'none'
  created_at: string
}

export interface Session {
  id: string
  title: string
  created_at: string
  updated_at: string
  message_count: number
}

export interface ChatResponse {
  response: string
  agent_used: 'knowledge' | 'web' | 'both' | 'none'
  session_id: string
  message_id: string
}

// ── SSE Route Panel types ────────────────────────────────────

export type StepName = 'manager' | 'knowledge' | 'web' | 'synthesis'
export type StepStatus = 'pending' | 'active' | 'done' | 'error'
export type RouteName = 'INTERNAL' | 'WEB' | 'BOTH' | 'NONE'

export interface RouteStep {
  name: StepName
  status: StepStatus
  label: string
  detail: string
}

export interface LogEntry {
  ts: string
  text: string
  color?: string
}

export interface RouteRun {
  status: 'idle' | 'running' | 'done' | 'error'
  route: RouteName | null
  steps: RouteStep[]
  elapsed: number
  log: LogEntry[]
}
