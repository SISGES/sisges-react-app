import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./contexts/ToastContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SignIn } from "./components/SignIn/SignIn";
import { HomePage } from "./components/HomePage/HomePage";
import { ClassesPage } from "./components/ClassesPage/ClassesPage";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { UsersControlPanel } from "./components/UsersControlPanel/UsersControlPanel";
import { ClassesManagementPanel } from "./components/ClassesManagementPanel/ClassesManagementPanel";
import { NotasPage } from "./components/NotasPage/NotasPage";
import { FaltasPage } from "./components/FaltasPage/FaltasPage";
import { storage } from "./utils/localStorage";
import UserRoleEnum from "./enums/UserRoleEnum";
import "./App.css";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = storage.getToken();
  const role = storage.getRole();
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  if (role === UserRoleEnum.DEV_ADMIN || role === UserRoleEnum.ADMIN) {
    return <Navigate to="/admin/users" replace />;
  }
  
  if (role === UserRoleEnum.TEACHER) {
    return <Navigate to="/turmas" replace />;
  }
  
  if (role === UserRoleEnum.STUDENT) {
    return <Navigate to="/notas" replace />;
  }
  
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const token = storage.getToken();
  const role = storage.getRole();
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  if (role !== UserRoleEnum.DEV_ADMIN && role !== UserRoleEnum.ADMIN) {
    if (role === UserRoleEnum.TEACHER) {
      return <Navigate to="/turmas" replace />;
    }
    return <Navigate to="/home" replace />;
  }
  
  return <>{children}</>;
}

function TeacherRoute({ children }: { children: React.ReactNode }) {
  const token = storage.getToken();
  const role = storage.getRole();
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  if (role !== UserRoleEnum.TEACHER) {
    if (role === UserRoleEnum.DEV_ADMIN || role === UserRoleEnum.ADMIN) {
      return <Navigate to="/admin/users" replace />;
    }
    return <Navigate to="/home" replace />;
  }
  
  return <>{children}</>;
}

function StudentRoute({ children }: { children: React.ReactNode }) {
  const token = storage.getToken();
  const role = storage.getRole();
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  if (role !== UserRoleEnum.STUDENT) {
    if (role === UserRoleEnum.DEV_ADMIN || role === UserRoleEnum.ADMIN) {
      return <Navigate to="/admin/users" replace />;
    }
    if (role === UserRoleEnum.TEACHER) {
      return <Navigate to="/turmas" replace />;
    }
    return <Navigate to="/home" replace />;
  }
  
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const token = storage.getToken();
  const role = storage.getRole();
  
  if (!token) {
    return <>{children}</>;
  }
  
  if (role === UserRoleEnum.DEV_ADMIN || role === UserRoleEnum.ADMIN) {
    return <Navigate to="/admin/users" replace />;
  }
  
  if (role === UserRoleEnum.TEACHER) {
    return <Navigate to="/turmas" replace />;
  }
  
  if (role === UserRoleEnum.STUDENT) {
    return <Navigate to="/notas" replace />;
  }
  
  return <Navigate to="/home" replace />;
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <PublicRoute>
                  <SignIn />
                </PublicRoute>
              }
            />
            <Route
              path="/home"
              element={
                <PrivateRoute>
                  <HomePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/turmas"
              element={
                <TeacherRoute>
                  <ClassesPage />
                </TeacherRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <UsersControlPanel />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/classes"
              element={
                <AdminRoute>
                  <ClassesManagementPanel />
                </AdminRoute>
              }
            />
            <Route
              path="/notas"
              element={
                <StudentRoute>
                  <NotasPage />
                </StudentRoute>
              }
            />
            <Route
              path="/faltas"
              element={
                <StudentRoute>
                  <FaltasPage />
                </StudentRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
