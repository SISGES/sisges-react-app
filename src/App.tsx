import { Routes, Route, Navigate } from 'react-router-dom'
import { Login } from './components/Login/Login'
import { Home } from './pages/Home/Home'
import { RegisterUser } from './pages/RegisterUser/RegisterUser'
import { Classes } from './pages/Classes/Classes'
import { EditClass } from './pages/EditClass/EditClass'
import { Students } from './pages/Students/Students'
import { Disciplines } from './pages/Disciplines/Disciplines'
import { Materials } from './pages/Materials/Materials'
import { Aulas } from './pages/Aulas/Aulas'
import { AulaDetail } from './pages/AulaDetail/AulaDetail'
import { CreateAula } from './pages/CreateAula/CreateAula'
import { EditAula } from './pages/EditAula/EditAula'
import { UserDetail } from './pages/UserDetail/UserDetail'
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute/AdminRoute'
import { TeacherRoute } from './components/TeacherRoute/TeacherRoute'
import { StudentRoute } from './components/StudentRoute/StudentRoute'
import { AppShell } from './components/AppShell/AppShell'
import { StudentMyClass } from './pages/StudentMyClass/StudentMyClass'
import { StudentFaltas } from './pages/StudentFaltas/StudentFaltas'
import { GradingConfig } from './pages/GradingConfig/GradingConfig'
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
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Home />} />
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
          path="/admin/students"
          element={
            <AdminRoute>
              <Students />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/disciplines"
          element={
            <AdminRoute>
              <Disciplines />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/notas"
          element={
            <AdminRoute>
              <GradingConfig />
            </AdminRoute>
          }
        />
        <Route path="/admin/announcements" element={<Navigate to="/" replace />} />
        <Route
          path="/admin/users/:id"
          element={
            <AdminRoute>
              <UserDetail />
            </AdminRoute>
          }
        />
        <Route
          path="/aulas"
          element={
            <TeacherRoute>
              <Aulas />
            </TeacherRoute>
          }
        />
        <Route
          path="/materiais"
          element={
            <TeacherRoute>
              <Materials />
            </TeacherRoute>
          }
        />
        <Route
          path="/aulas/new"
          element={
            <TeacherRoute>
              <CreateAula />
            </TeacherRoute>
          }
        />
        <Route
          path="/aulas/:id"
          element={
            <TeacherRoute>
              <AulaDetail />
            </TeacherRoute>
          }
        />
        <Route
          path="/aulas/:id/edit"
          element={
            <TeacherRoute>
              <EditAula />
            </TeacherRoute>
          }
        />
        <Route
          path="/users/:id"
          element={
            <TeacherRoute>
              <UserDetail />
            </TeacherRoute>
          }
        />
        <Route
          path="/minha-turma"
          element={
            <StudentRoute>
              <StudentMyClass />
            </StudentRoute>
          }
        />
        <Route
          path="/faltas"
          element={
            <StudentRoute>
              <StudentFaltas />
            </StudentRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
