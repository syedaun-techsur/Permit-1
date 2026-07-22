import { create } from 'zustand';
import type { ToastType } from '../components/ui/Toast';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface UiStore {
  toasts: ToastItem[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  dismissToast: (id: string) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  toasts: [],

  addToast: (type, message, duration) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { id: crypto.randomUUID(), type, message, duration },
      ],
    })),

  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
