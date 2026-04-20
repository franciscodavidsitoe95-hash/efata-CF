import React, { createContext, useContext, useState, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center px-5 py-4 rounded-2xl shadow-2xl transition-all transform animate-in slide-in-from-right min-w-[320px] border-2 ${
              toast.type === 'success' ? 'bg-white border-green-100 text-green-800' :
              toast.type === 'error' ? 'bg-white border-brand-red/20 text-brand-red' :
              'bg-brand-cream border-brand-red/10 text-brand-red'
            }`}
          >
            <div className="mr-4">
              {toast.type === 'success' && <CheckCircle className="h-6 w-6 text-green-500" />}
              {toast.type === 'error' && <AlertCircle className="h-6 w-6 text-brand-red font-black" />}
              {toast.type === 'info' && <Info className="h-6 w-6 text-brand-red" />}
            </div>
            <p className="flex-1 text-[11px] font-black uppercase tracking-widest leading-tight">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="ml-4 text-gray-300 hover:text-brand-red transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
