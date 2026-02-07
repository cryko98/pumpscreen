
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');

if (container) {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Critical Render Error:", error);
    container.innerHTML = `<div style="padding: 20px; color: red; font-family: monospace;">
      <h1>Critical Launch Error</h1>
      <pre>${error instanceof Error ? error.message : String(error)}</pre>
    </div>`;
  }
}
