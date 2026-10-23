import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

const container = document.getElementById("root");

if (container) {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", function register() {
    navigator.serviceWorker.register("/sw.js").catch(function keep() {});
  });
}
