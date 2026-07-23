import { AppRouter } from './router';
import { useUiStore } from './store/ui.store';
import { ToastContainer } from './components/ui/Toast';

function App() {
  const { toasts, dismissToast } = useUiStore();

  // Inject onDismiss into each toast for the ToastContainer
  const toastsWithDismiss = toasts.map((t) => ({ ...t, onDismiss: dismissToast }));

  return (
    <>
      <AppRouter />

      {/* Global toast container — proper aria-live regions per toast type */}
      <ToastContainer toasts={toastsWithDismiss} />
    </>
  );
}

export default App;
