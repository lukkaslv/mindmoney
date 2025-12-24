
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  const errorMsg = "Не удалось найти элемент root. Проверьте index.html.";
  console.error(errorMsg);
  document.body.innerHTML = `<div style="padding:20px;color:red;">${errorMsg}</div>`;
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err: any) {
    console.error("React Render Error:", err);
    rootElement.innerHTML = `<div style="padding:20px;color:red;"><b>Ошибка запуска:</b> ${err?.message || 'Неизвестная ошибка'}</div>`;
  }
}
