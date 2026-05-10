import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";

/**
 * SmoothScrollProvider
 * Initialises Lenis at the root level so it covers the entire app.
 * Kept outside App to avoid re-initialising on context changes.
 */
function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useSmoothScroll();
  return <>{children}</>;
}

createRoot(document.getElementById("root")!).render(
  <SmoothScrollProvider>
    <App />
  </SmoothScrollProvider>
);
