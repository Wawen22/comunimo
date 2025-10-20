'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
  onClose?: () => void;
}

export function Toast({
  title,
  description,
  variant = 'default',
  duration = 5000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'pointer-events-auto fixed bottom-4 right-4 z-50 w-full max-w-sm rounded-lg border p-4 shadow-lg',
        {
          'border-gray-200 bg-white': variant === 'default',
          'border-red-200 bg-red-50': variant === 'destructive',
          'border-green-200 bg-green-50': variant === 'success',
        }
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          {title && (
            <div
              className={cn('font-semibold', {
                'text-gray-900': variant === 'default',
                'text-red-900': variant === 'destructive',
                'text-green-900': variant === 'success',
              })}
            >
              {title}
            </div>
          )}
          {description && (
            <div
              className={cn('mt-1 text-sm', {
                'text-gray-600': variant === 'default',
                'text-red-700': variant === 'destructive',
                'text-green-700': variant === 'success',
              })}
            >
              {description}
            </div>
          )}
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          className={cn('text-sm font-medium', {
            'text-gray-500 hover:text-gray-700': variant === 'default',
            'text-red-500 hover:text-red-700': variant === 'destructive',
            'text-green-500 hover:text-green-700': variant === 'success',
          })}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// Toast context and provider
interface ToastContextType {
  toast: (props: ToastProps) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(
  undefined
);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<(ToastProps & { id: string })[]>(
    []
  );

  const toast = React.useCallback((props: ToastProps) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { ...props, id }]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed inset-0 z-50 flex flex-col items-end justify-end gap-2 p-4">
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

