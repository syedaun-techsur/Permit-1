import { AppRouter } from './router';
import { useUiStore } from './store/ui.store';
import { Toast } from './components/ui/Toast';

function App() {
  const { toasts, dismissToast } = useUiStore();

  return (
    <>
      <AppRouter />

      {/* Global toast container */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
            duration={toast.duration}
            onDismiss={dismissToast}
          />
        ))}
      </div>
    </>
  );
}

export default App;
