
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
    console.error("Mounting Error:", error);
    container.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; background:#0c0c0c; color:#ff4444; font-family:monospace; padding:20px; text-align:center;">
        <h1 style="color:#22c55e">PUMPSCREENER CRASHED</h1>
        <p style="margin-top:10px; opacity:0.8;">Initialization Failed</p>
        <pre style="background:rgba(255,0,0,0.1); padding:15px; border-radius:10px; margin-top:20px; font-size:12px; max-width:100%; overflow:auto;">${error instanceof Error ? error.message : String(error)}</pre>
        <button onclick="window.location.reload()" style="margin-top:20px; padding:10px 20px; background:#22c55e; color:black; border:none; border-radius:5px; font-weight:bold; cursor:pointer;">RETRY SYNC</button>
      </div>
    `;
  }
}
