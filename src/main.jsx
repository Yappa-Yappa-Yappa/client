import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppShell from "./AppShell.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { registerSW } from "virtual:pwa-register";

registerSW({ immediate: true });

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  </StrictMode>,
);
