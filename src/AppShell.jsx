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
          className: "app-toast",
          success: {
            iconTheme: { primary: "#6366f1", secondary: "#ffffff" },
          },
          error: {
            iconTheme: { primary: "#f43f5e", secondary: "#ffffff" },
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
