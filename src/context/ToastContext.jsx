import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
  }, []);

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          icon: <CheckCircle className="text-emerald-500 shrink-0" size={20} />,
          progress: 'bg-emerald-500'
        };
      case 'error':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-800',
          icon: <AlertCircle className="text-rose-500 shrink-0" size={20} />,
          progress: 'bg-rose-500'
        };
      case 'info':
      default:
        return {
          bg: 'bg-sky-50 border-sky-200 text-sky-800',
          icon: <Info className="text-sky-500 shrink-0" size={20} />,
          progress: 'bg-sky-500'
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast: addToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full sm:w-96 pointer-events-none">
        {toasts.map((toast) => {
          const styles = getToastStyles(toast.type);
          return (
            <div
              key={toast.id}
              className={`flex items-start gap-3 p-4 border rounded-xl shadow-lg transition-all duration-300 transform translate-y-0 opacity-100 pointer-events-auto animate-toast-slide-in relative overflow-hidden ${styles.bg}`}
              style={{
                animation: 'slideIn 0.3s ease forwards'
              }}
            >
              {styles.icon}
              <div className="flex-1 text-sm font-medium pr-4 break-words">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 transition-colors pointer-events-auto"
              >
                <X size={16} />
              </button>
              
              {/* Progress Bar Animation */}
              <div
                className={`absolute bottom-0 left-0 h-1 transition-all duration-[4000ms] ease-linear w-full ${styles.progress}`}
                style={{
                  animation: 'shrinkProgress 4s linear forwards'
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Embedded CSS for Toast Animations */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateY(1.5rem);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes shrinkProgress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
