import React, { useEffect, useRef, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/auth.store';

/**
 * SessionExpiryWarning — monitors JWT expiry and shows a modal warning 60 seconds
 * before the access token expires.
 *
 * Accessibility:
 * - Uses role="alertdialog" (destructive/time-sensitive)
 * - Countdown is announced via aria-live="assertive" for screen readers
 * - "Stay signed in" button receives autoFocus when modal opens
 * - Renders null when there is no active session or warning is not active
 */
export const SessionExpiryWarning: React.FC = () => {
  const { accessTokenExpiresAt, refreshToken, logout } = useAuthStore();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear any previous timers when token changes
    clearTimeout(warningRef.current!);
    clearInterval(countdownRef.current!);
    setShowWarning(false);

    if (!accessTokenExpiresAt) return;

    const msUntilWarning = accessTokenExpiresAt - Date.now() - 60_000;

    // Already within or past the warning window — show immediately if within 60s
    if (msUntilWarning <= 0) {
      const msRemaining = accessTokenExpiresAt - Date.now();
      if (msRemaining > 0) {
        const secs = Math.floor(msRemaining / 1000);
        setSecondsLeft(secs);
        setShowWarning(true);
        countdownRef.current = setInterval(() => {
          setSecondsLeft((s) => {
            if (s <= 1) {
              clearInterval(countdownRef.current!);
              setShowWarning(false);
              logout();
              return 0;
            }
            return s - 1;
          });
        }, 1_000);
      }
      return;
    }

    warningRef.current = setTimeout(() => {
      setShowWarning(true);
      setSecondsLeft(60);
      countdownRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(countdownRef.current!);
            setShowWarning(false);
            logout();
            return 0;
          }
          return s - 1;
        });
      }, 1_000);
    }, msUntilWarning);

    return () => {
      clearTimeout(warningRef.current!);
      clearInterval(countdownRef.current!);
    };
  }, [accessTokenExpiresAt, logout]);

  const handleStaySignedIn = async () => {
    clearInterval(countdownRef.current!);
    setShowWarning(false);
    await refreshToken();
  };

  const handleLogout = () => {
    clearInterval(countdownRef.current!);
    clearTimeout(warningRef.current!);
    setShowWarning(false);
    logout();
  };

  if (!showWarning) return null;

  return (
    <Modal
      open={showWarning}
      onClose={handleLogout}
      title="Session Expiring Soon"
      id="session-expiry-warning"
      role="alertdialog"
      aria-describedby="session-expiry-desc"
    >
      <p id="session-expiry-desc" className="text-body-md text-text-primary">
        Your session will expire in{' '}
        <strong>{secondsLeft}</strong>{' '}
        {secondsLeft === 1 ? 'second' : 'seconds'}. Would you like to stay signed in?
      </p>

      {/* Screen reader countdown announcements — announced assertively each second */}
      <span aria-live="assertive" aria-atomic="true" className="sr-only">
        Session expiring in {secondsLeft} {secondsLeft === 1 ? 'second' : 'seconds'}
      </span>

      <div className="mt-6 flex gap-3 justify-end">
        <Button variant="ghost" onClick={handleLogout}>
          Log out
        </Button>
        <Button variant="primary" onClick={handleStaySignedIn} autoFocus>
          Stay signed in
        </Button>
      </div>
    </Modal>
  );
};
