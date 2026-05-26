import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { ChatPage } from './pages/ChatPage'
import { useAuth } from './hooks/useAuth'

export default function App() {
  const { user, isLoading, login, register, logout } = useAuth()

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#FFFFFF',
            color: '#1A1A2E',
            border: '1px solid #EBEBF5',
            boxShadow: '0 4px 20px rgba(106,90,205,0.15)',
            fontFamily: 'Poppins, sans-serif',
            fontSize: 13,
          },
        }}
      />
      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/home" replace />
            ) : (
              <LoginPage onLogin={login} onRegister={register} isLoading={isLoading} />
            )
          }
        />
        <Route
          path="/home"
          element={user ? <HomePage user={user} onLogout={logout} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/chat"
          element={user ? <ChatPage user={user} onLogout={logout} /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to={user ? '/home' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
