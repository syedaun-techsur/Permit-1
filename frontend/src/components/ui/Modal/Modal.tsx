import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '../Button';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** Use 'alertdialog' for destructive/confirmation dialogs (e.g., deactivate, delete) */
  role?: 'dialog' | 'alertdialog';
  id?: string;
  'aria-describedby'?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
};

const FOCUSABLE_SELECTORS =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  size = 'md',
  role = 'dialog',
  id,
  'aria-describedby': ariaDescribedby,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = id ? `${id}-title` : 'modal-title';

  useEffect(() => {
    if (!open) return;

    // Save the element that triggered the modal open
    const triggerEl = document.activeElement as HTMLElement | null;

    const modalEl = dialogRef.current;
    if (!modalEl) return;

    // Focus first focusable element inside modal
    const focusable = Array.from(
      modalEl.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
    );
    if (focusable.length > 0) {
      focusable[0].focus();
    } else {
      modalEl.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key !== 'Tab') return;

      // Re-query focusable elements in case content changed
      const currentFocusable = Array.from(
        modalEl.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
      );
      if (currentFocusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = currentFocusable[0];
      const last = currentFocusable[currentFocusable.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: if focus is on first element, wrap to last
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab: if focus is on last element, wrap to first
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to the trigger element when modal closes
      triggerEl?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role={role}
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={ariaDescribedby}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`relative bg-surface-card rounded-lg shadow-lg w-full ${sizeClasses[size]} outline-none`}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
            <h2 id={titleId} className="text-heading-md text-text-primary">{title}</h2>
            <Button variant="icon" onClick={onClose} aria-label="Close modal">
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
