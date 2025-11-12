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
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";
import { storage } from "./utils/localStorage";
import UserRoleEnum from "./enums/UserRoleEnum";
import "./App.css";

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const token = storage.getToken();

    if (!token) {
        return <Navigate to="/" replace />;
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
        if (role === UserRoleEnum.TEACHER || role === UserRoleEnum.STUDENT) {
            return <Navigate to="/turmas" replace />;
        }
        return <Navigate to="/" replace />;
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
        return <Navigate to="/turmas" replace />;
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
        return <Navigate to="/turmas" replace />;
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
        return <Navigate to="/dashboard" replace />;
    }

    if (role === UserRoleEnum.TEACHER) {
        return <Navigate to="/turmas" replace />;
    }

    if (role === UserRoleEnum.STUDENT) {
        return <Navigate to="/turmas" replace />;
    }

    return <Navigate to="/dashboard" replace />;
}

function App() {
    return (
        <ErrorBoundary>
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
                                    <PrivateRoute>
                                        <ClassesPage />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/dashboard"
                                element={
                                    <AdminRoute>
                                        <Dashboard />
                                    </AdminRoute>
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
        </ErrorBoundary>
    );
}

export default App;
