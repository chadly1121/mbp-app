import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./hooks/useAuth";

console.log('main.tsx starting');

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

console.log('About to render React app');
createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
console.log('React app rendered');
