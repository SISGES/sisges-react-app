import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./contexts/ToastContext";
import { SignIn } from "./components/SignIn/SignIn";
import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <SignIn />
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
