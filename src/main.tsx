import { createRoot } from "react-dom/client";
import { SWRConfig } from "swr";
import App from "./App.tsx";
import "./index.css";
import { swrConfig } from "./lib/swr";

createRoot(document.getElementById("root")!).render(
  <SWRConfig value={swrConfig}>
    <App />
  </SWRConfig>
);
  