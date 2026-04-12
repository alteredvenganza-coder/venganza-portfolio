import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global error catchers — display any JS error visibly so blank screen is diagnosable
window.onerror = (msg, src, line) => {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="padding:24px;font-family:sans-serif;color:#7b1f24;font-size:14px;background:#faf8f5;min-height:100vh"><b>JS Error:</b> ${msg}<br/><span style="color:#666">${src}:${line}</span></div>`;
  }
};
window.addEventListener('unhandledrejection', e => {
  console.error('Unhandled promise rejection:', e.reason);
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
