import { useState, useEffect } from 'react';

let toastId = 0;
const listeners = new Set();

export const toast = {
  success: (msg) => emit('success', msg),
  error: (msg) => emit('error', msg),
  info: (msg) => emit('info', msg),
};

const emit = (type, message) => {
  const id = ++toastId;
  listeners.forEach((l) => l({ id, type, message }));
};

const Toast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4000);
    };
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span className="toast-icon">
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✗' : 'ℹ'}
          </span>
          <span className="toast-msg">{t.message}</span>
        </div>
      ))}
    </div>
  );
};

export default Toast;
