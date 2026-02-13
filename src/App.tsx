import { Routes, Route, Navigate } from 'react-router-dom'
import { Login } from './components/Login/Login'
import { Home } from './pages/Home/Home'
import { RegisterUser } from './pages/RegisterUser/RegisterUser'
import { Classes } from './pages/Classes/Classes'
import { EditClass } from './pages/EditClass/EditClass'
import { UserDetail } from './pages/UserDetail/UserDetail'
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute/AdminRoute'
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
      <Route
        path="/admin/register"
        element={
          <AdminRoute>
            <RegisterUser />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/classes"
        element={
          <AdminRoute>
            <Classes />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/classes/:id/edit"
        element={
          <AdminRoute>
            <EditClass />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users/:id"
        element={
          <AdminRoute>
            <UserDetail />
          </AdminRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
