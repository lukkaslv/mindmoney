
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log("🚀 App initialization started...");

// Глобальный перехватчик ошибок для отладки "белого экрана"
window.onerror = function(message, source, lineno, colno, error) {
  console.error("Critical error caught:", message, error);
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; color: #ef4444; font-family: sans-serif; background: #fef2f2; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
        <h1 style="font-size: 18px; font-weight: bold;">⚠️ Ошибка в коде</h1>
        <p style="font-size: 14px; color: #7f1d1d; margin: 10px 0;">${message}</p>
        <button onclick="localStorage.clear(); location.reload();" style="margin-top: 20px; padding: 12px 24px; background: #ef4444; color: white; border: none; border-radius: 12px; font-weight: bold; cursor: pointer;">Очистить кэш и перезагрузить</button>
      </div>
    `;
  }
  return false;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Root element not found");
  throw new Error("Не удалось найти элемент root");
}

try {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("✅ React render triggered");
} catch (e) {
  console.error("Render error:", e);
}
