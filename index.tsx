
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// Глобальный перехватчик ошибок для отладки "белого экрана"
window.onerror = function(message, source, lineno, colno, error) {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; color: #ef4444; font-family: sans-serif; background: #fef2f2; height: 100vh;">
        <h1 style="font-size: 18px; font-weight: bold;">⚠️ Ошибка загрузки</h1>
        <p style="font-size: 14px; color: #7f1d1d;">${message}</p>
        <pre style="font-size: 10px; background: #fee2e2; padding: 10px; overflow: auto;">${error?.stack || 'No stack trace'}</pre>
        <button onclick="localStorage.clear(); location.reload();" style="margin-top: 20px; padding: 10px 20px; background: #ef4444; color: white; border: none; border-radius: 8px;">Очистить данные и перезагрузить</button>
      </div>
    `;
  }
  return false;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Не удалось найти элемент root");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
