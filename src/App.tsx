import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./contexts/ToastContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SignIn } from "./components/SignIn/SignIn";
import { HomePage } from "./components/HomePage/HomePage";
import { storage } from "./utils/localStorage";
import "./App.css";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = storage.getToken();
  return token ? <>{children}</> : <Navigate to="/" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const token = storage.getToken();
  return !token ? <>{children}</> : <Navigate to="/home" replace />;
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
