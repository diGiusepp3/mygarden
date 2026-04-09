import React from "react";
import { createRoot } from "react-dom/client";
import GardenGridApp from "../GardenGrid.jsx";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root not found.");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <GardenGridApp />
  </React.StrictMode>
);
