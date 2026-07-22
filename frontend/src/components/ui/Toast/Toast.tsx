import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  onDismiss: (id: string) => void;
}

const toastConfig: Record<ToastType, { icon: React.ReactNode; classes: string }> = {
  success: { icon: <CheckCircle className="w-5 h-5 text-status-approved" />, classes: 'border-status-approved' },
  error:   { icon: <AlertCircle className="w-5 h-5 text-feedback-error" />, classes: 'border-feedback-error' },
  warning: { icon: <AlertTriangle className="w-5 h-5 text-feedback-warning" />, classes: 'border-feedback-warning' },
  info:    { icon: <Info className="w-5 h-5 text-brand-primary" />, classes: 'border-brand-primary' },
};

export const Toast: React.FC<ToastProps> = ({ id, type, message, duration = 5000, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  const { icon, classes } = toastConfig[type];

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex items-start gap-3 bg-surface-card border-l-4 rounded-md shadow-md p-4 min-w-[300px] max-w-sm ${classes}`}
    >
      {icon}
      <p className="flex-1 text-body-sm text-text-primary">{message}</p>
      <button
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
        className="text-text-secondary hover:text-text-primary transition-colors duration-150"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
