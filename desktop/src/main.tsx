import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { initPaths } from "./lib/paths";
import "./styles.css";

await initPaths();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
