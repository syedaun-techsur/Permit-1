import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { permitsApi } from '../../api/permits.api';
import type { PermitApplication } from '../../types/permit.types';
import { useUiStore } from '../../store/ui.store';

interface RequestInfoModalProps {
  applicationId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: PermitApplication) => void;
}

const MAX_CHARS = 2000;

export const RequestInfoModal: React.FC<RequestInfoModalProps> = ({
  applicationId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addToast } = useUiStore();
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleClose = () => {
    if (!isSubmitting) {
      setNote('');
      setValidationError(null);
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = note.trim();
    if (!trimmed) {
      setValidationError('Please enter a note describing what information is needed.');
      return;
    }
    if (trimmed.length > MAX_CHARS) {
      setValidationError(`Note must be ${MAX_CHARS} characters or fewer.`);
      return;
    }
    setValidationError(null);
    setIsSubmitting(true);
    try {
      const updated = await permitsApi.requestInfo(applicationId, trimmed);
      onSuccess(updated);
      setNote('');
      onClose();
      addToast('success', 'Information request sent to applicant.');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Failed to send information request. Please try again.';
      addToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title="Request Additional Information"
      size="md"
    >
      <div data-testid="request-info-modal">
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label
              htmlFor="info-request-note"
              className="block text-sm font-medium text-text-primary mb-1"
            >
              Information Request Note{' '}
              <span className="text-feedback-error" aria-hidden="true">
                *
              </span>
            </label>
            <p className="text-xs text-text-secondary mb-2">
              Describe clearly what additional information or documents you need from the applicant.
            </p>
            <textarea
              id="info-request-note"
              data-testid="info-request-textarea"
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                if (validationError) setValidationError(null);
              }}
              rows={5}
              maxLength={MAX_CHARS}
              placeholder="e.g. Please provide an updated site plan showing all property boundaries and setbacks."
              className={`w-full border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-primary resize-y ${
                validationError ? 'border-feedback-error' : 'border-border-default'
              }`}
            />
            <div className="flex justify-between items-center mt-1">
              {validationError ? (
                <p className="text-xs text-feedback-error" role="alert">
                  {validationError}
                </p>
              ) : (
                <span />
              )}
              <p className="text-xs text-text-secondary ml-auto">
                {note.length}/{MAX_CHARS}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting || !note.trim()}
            >
              Send Request
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
