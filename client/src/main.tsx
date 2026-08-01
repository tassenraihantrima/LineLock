import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App";

// Find the HTML element where React will render the application.
const rootElement = document.getElementById("root");

// Stop immediately if the required root element is missing.
if (!rootElement) {
  throw new Error("The LineLock root element could not be found.");
}

// BrowserRouter keeps the current page synchronized with the browser URL.
createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);