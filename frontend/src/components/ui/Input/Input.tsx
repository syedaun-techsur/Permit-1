import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, id, className = '', disabled, ...props }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-label text-text-primary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={[
            'w-full px-3 py-2 rounded-sm border bg-surface-card text-text-primary text-body-md',
            'transition-colors duration-150',
            'placeholder:text-text-disabled',
            error
              ? 'border-feedback-error focus:ring-feedback-error'
              : 'border-border-default focus:border-border-focus',
            'focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-1',
            disabled ? 'opacity-50 cursor-not-allowed bg-surface-sidebar' : '',
            className,
          ].join(' ')}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} role="alert" className="text-caption text-feedback-error">
            {error}
          </p>
        )}
        {!error && helpText && (
          <p id={`${inputId}-help`} className="text-caption text-text-secondary">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
