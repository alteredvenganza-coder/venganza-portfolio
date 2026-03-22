import { useState, useCallback, createContext, useContext } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id}
            className={`px-4 py-3 rounded-lg text-xs font-mono uppercase tracking-widest shadow-lg animate-[fadeIn_0.3s_ease] ${
              t.type === 'success' ? 'bg-green-900 text-green-100' :
              t.type === 'error' ? 'bg-red-900 text-red-100' :
              'bg-neutral-800 text-neutral-100'
            }`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
