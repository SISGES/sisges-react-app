import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { ThemeProvider } from "./contexts/ThemeProvider";
import { AuthProvider } from "./contexts/AuthProvider";
import { ToastProvider } from "./contexts/ToastProvider";
import { ToastContainer } from "./components/Toast/Toast";
import { DialogProvider } from "./contexts/DialogProvider";
import { TimetableDraftProvider } from "./contexts/TimetableDraftProvider";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <TimetableDraftProvider>
              <DialogProvider>
                <App />
                <ToastContainer />
              </DialogProvider>
            </TimetableDraftProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
