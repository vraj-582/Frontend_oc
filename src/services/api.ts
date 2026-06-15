import axios from 'axios'
import type { AuthResponse, ChatResponse, Session, Message } from '../types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
})

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────

export const register = async (name: string, email: string, password: string, role = 'employee'): Promise<AuthResponse> => {
  const res = await api.post('/api/auth/register', { name, email, password, role })
  return res.data
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await api.post('/api/auth/login', { email, password })
  return res.data
}

// ── Chat ──────────────────────────────────────────────────────────────

export const sendMessage = async (
  message: string,
  session_id?: string,
  signal?: AbortSignal,
): Promise<ChatResponse> => {
  const res = await api.post('/api/chat', { message, session_id }, { signal })
  return res.data
}

export const getSessions = async (): Promise<Session[]> => {
  const res = await api.get('/api/sessions')
  return res.data
}

export const getSession = async (id: string): Promise<Session & { messages: Message[] }> => {
  const res = await api.get(`/api/sessions/${id}`)
  return res.data
}

export const deleteSession = async (id: string): Promise<void> => {
  await api.delete(`/api/sessions/${id}`)
}

// ── Documents ────────────────────────────────────────────────────────

export const listDocuments = async (): Promise<{ documents: string[] }> => {
  const res = await api.get('/api/documents')
  return res.data
}

export const uploadDocument = async (
  file: File,
  onProgress?: (pct: number) => void,
): Promise<{ filename: string; size: number; folder: string }> => {
  const form = new FormData()
  form.append('file', file)
  const res = await api.post('/api/documents/upload', form, {
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100))
    },
  })
  return res.data
}

export const deleteDocument = async (filename: string): Promise<void> => {
  await api.delete(`/api/documents/${filename}`)
}
