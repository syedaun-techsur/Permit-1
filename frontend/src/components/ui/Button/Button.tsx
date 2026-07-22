import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:   'bg-brand-primary text-white hover:bg-blue-700 active:bg-blue-800 focus-ring border border-transparent',
  secondary: 'bg-surface-card text-text-primary hover:bg-surface-sidebar active:bg-surface-sidebar border border-border-default focus-ring',
  ghost:     'bg-transparent text-text-primary hover:bg-surface-sidebar active:bg-surface-sidebar border border-transparent focus-ring',
  danger:    'bg-feedback-error text-white hover:bg-red-700 active:bg-red-800 border border-transparent focus-ring',
  icon:      'bg-transparent text-text-secondary hover:bg-surface-sidebar active:bg-surface-sidebar border border-transparent focus-ring p-2',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-body-sm px-3 py-1.5 h-8',
  md: 'text-body-sm px-4 py-2 h-10',
  lg: 'text-body-md px-6 py-2.5 h-12',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, leftIcon, rightIcon, disabled, children, className = '', ...props }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          'inline-flex items-center justify-center gap-2 font-medium rounded-md',
          'transition-all duration-150 ease-in-out',
          'active:scale-[0.98]',
          isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          variant !== 'icon' ? sizeClasses[size] : '',
          variantClasses[variant],
          className,
        ].join(' ')}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        ) : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);
Button.displayName = 'Button';
