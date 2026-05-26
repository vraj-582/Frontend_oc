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
