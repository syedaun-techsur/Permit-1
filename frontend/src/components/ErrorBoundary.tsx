import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message?: string;
}

/**
 * Top-level error boundary. Without one, any uncaught render error (e.g. an
 * unexpected data shape) unmounts the whole React tree and leaves a blank white
 * screen. This renders a friendly fallback with a reload action instead.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const message = error instanceof Error ? error.message : String(error);
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown, info: unknown) {
    // Surface the details in the console for debugging; never swallow silently.
    console.error('Unhandled render error:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <h1 className="text-heading-lg text-text-primary font-bold">Something went wrong</h1>
          <p className="text-body-sm text-text-secondary">
            An unexpected error occurred. Please reload the page and try again.
          </p>
          {this.state.message && (
            <p className="text-body-sm text-feedback-error break-words">{this.state.message}</p>
          )}
          <button
            onClick={this.handleReload}
            className="inline-flex items-center justify-center gap-2 font-medium rounded-md text-body-sm px-4 py-2 h-10 bg-brand-primary text-white hover:bg-blue-700 active:bg-blue-800 border border-transparent transition-all duration-150"
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }
}
