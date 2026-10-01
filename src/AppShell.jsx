import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import AuthProvider from "./contexts/AuthProvider.jsx";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";

export default function AppShell() {
  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        containerClassName="app-toaster"
        toastOptions={{
          duration: 3500,
          style: {
            background: "var(--accent-primary)",
            color: "#ffffff",
            border: "1px solid var(--accent-hover)",
            borderRadius: "9999px",
            padding: "12px 18px",
            boxShadow: "0 8px 24px var(--accent-glow)",
          },
        }}
      />
      <AuthProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
