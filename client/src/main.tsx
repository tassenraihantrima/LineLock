import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import App from "./App";
import { AuthProvider } from "./auth/AuthContext";

import "./index.css";

// Find the HTML element where React will render the application.
const rootElement = document.getElementById("root");

// Stop immediately if the required root element is missing.
if (!rootElement) {
  throw new Error(
    "The LineLock root element could not be found.",
  );
}

// BrowserRouter keeps the current page synchronized with the browser URL.
//
// AuthProvider keeps the logged-in account available throughout
// the entire application, including routed pages and shared layout components.
createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);