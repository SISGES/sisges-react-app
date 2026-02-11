import { Routes, Route, Navigate } from 'react-router-dom'
import { Login } from './components/Login/Login'
import { Home } from './pages/Home/Home'
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute'
import { useAuth } from './contexts/AuthContext'
import './themes/theme.css'
import './App.css'

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login />
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
