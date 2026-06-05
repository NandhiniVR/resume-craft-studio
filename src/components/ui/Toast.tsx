import React from 'react';
import { create } from 'zustand';
import { cn } from '@/utils/cn';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastStore {
  toasts: ToastMessage[];
  addToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, type, message }],
    }));
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

// Export simple toast trigger methods
export const toast = {
  success: (msg: string) => useToastStore.getState().addToast(msg, 'success'),
  error: (msg: string) => useToastStore.getState().addToast(msg, 'error'),
  info: (msg: string) => useToastStore.getState().addToast(msg, 'info'),
};

export function useToast() {
  const addToast = useToastStore((state) => state.addToast);
  return {
    toast: (opts: { title?: string; description?: string; variant?: 'default' | 'destructive' }) => {
      const type = opts.variant === 'destructive' ? 'error' : 'success';
      const msg = opts.title ? `${opts.title} - ${opts.description || ''}` : (opts.description || '');
      addToast(msg, type);
    }
  };
}

export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'flex items-center justify-between p-4 rounded-lg shadow-lg border text-sm font-medium animate-in slide-in-from-bottom-5 duration-200 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md',
            {
              'border-emerald-500/20 text-emerald-800 dark:text-emerald-300': t.type === 'success',
              'border-destructive/20 text-destructive dark:text-red-400': t.type === 'error',
              'border-blue-500/20 text-blue-800 dark:text-blue-300': t.type === 'info',
            }
          )}
        >
          <span>{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            className="ml-4 text-xs font-bold text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};
