import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { applyDebugLogging } from "./lib/debug";

applyDebugLogging();

createRoot(document.getElementById("root")!).render(<App />);
