import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useUpdateUser } from '../../hooks/useAdmin';
import { useUiStore } from '../../store/ui.store';
import type { AdminUser } from '../../types/admin.types';

interface DeactivateConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser;
  onSuccess: () => void;
}

export const DeactivateConfirmDialog: React.FC<DeactivateConfirmDialogProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}) => {
  const { update, loading } = useUpdateUser();
  const addToast = useUiStore((s) => s.addToast);

  const handleDeactivate = async () => {
    try {
      await update(user.id, { isActive: false });
      addToast('success', 'User deactivated');
      onSuccess();
      onClose();
    } catch {
      addToast('error', 'Failed to deactivate user');
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={`Deactivate ${user.fullName}?`}
      size="sm"
      role="alertdialog"
      id="deactivate-dialog"
      aria-describedby="deactivate-dialog-desc"
    >
      <p
        id="deactivate-dialog-desc"
        className="text-body-md text-text-secondary mb-6"
      >
        This will immediately end all active sessions for{' '}
        <strong>{user.fullName}</strong> and prevent them from logging in.
      </p>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={() => void handleDeactivate()}
          loading={loading}
          disabled={loading}
        >
          Deactivate
        </Button>
      </div>
    </Modal>
  );
};
