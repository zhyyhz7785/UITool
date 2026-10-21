import "@tpl/styles/base.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Designer } from "./designer/Designer";
import "./designer/designer.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Designer />
  </StrictMode>
);
