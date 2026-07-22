import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { permitsApi } from '../../api/permits.api';
import type { PermitApplication } from '../../types/permit.types';
import { useUiStore } from '../../store/ui.store';

interface DecisionModalProps {
  applicationId: string;
  outcome: 'approved' | 'rejected';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: PermitApplication) => void;
}

const MIN_REASON_CHARS = 10;
const MAX_REASON_CHARS = 2000;

export const DecisionModal: React.FC<DecisionModalProps> = ({
  applicationId,
  outcome,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addToast } = useUiStore();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isApprove = outcome === 'approved';
  const title = isApprove ? 'Approve Application' : 'Reject Application';

  const handleClose = () => {
    if (!isSubmitting) {
      setReason('');
      setValidationError(null);
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reason.trim();
    if (trimmed.length < MIN_REASON_CHARS) {
      setValidationError(
        `Decision reason must be at least ${MIN_REASON_CHARS} characters.`,
      );
      return;
    }
    if (trimmed.length > MAX_REASON_CHARS) {
      setValidationError(`Reason must be ${MAX_REASON_CHARS} characters or fewer.`);
      return;
    }
    setValidationError(null);
    setIsSubmitting(true);
    try {
      const updated = await permitsApi.decide(applicationId, outcome, trimmed);
      onSuccess(updated);
      setReason('');
      onClose();
      addToast('success', isApprove ? 'Application approved.' : 'Application rejected.');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Failed to submit decision. Please try again.';
      addToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={handleClose} title={title} size="md">
      <div data-testid="decision-modal">
        {/* Rejection warning */}
        {!isApprove && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm font-medium text-amber-800">
              Are you sure? This cannot be undone.
            </p>
            <p className="text-sm text-amber-700 mt-1">
              Rejecting this application will notify the applicant and close the review.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label
              htmlFor="decision-reason"
              className="block text-sm font-medium text-text-primary mb-1"
            >
              Decision Reason{' '}
              <span className="text-feedback-error" aria-hidden="true">
                *
              </span>
            </label>
            <p className="text-xs text-text-secondary mb-2">
              {isApprove
                ? 'Provide a brief note about the approval decision.'
                : 'Explain why this application is being rejected.'}
            </p>
            <textarea
              id="decision-reason"
              data-testid="decision-reason-textarea"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (validationError) setValidationError(null);
              }}
              rows={5}
              maxLength={MAX_REASON_CHARS}
              placeholder={
                isApprove
                  ? 'e.g. Application meets all zoning requirements and is approved as submitted.'
                  : 'e.g. The site plan does not meet setback requirements under section 4.2...'
              }
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
                {reason.length}/{MAX_REASON_CHARS}
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

            {isApprove ? (
              <button
                type="submit"
                disabled={isSubmitting || reason.trim().length < MIN_REASON_CHARS}
                className="inline-flex items-center justify-center gap-2 font-medium rounded-md text-body-sm px-4 py-2 h-10 bg-green-600 hover:bg-green-700 text-white transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500"
                data-testid="confirm-approve-btn"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : null}
                Approve
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || reason.trim().length < MIN_REASON_CHARS}
                className="inline-flex items-center justify-center gap-2 font-medium rounded-md text-body-sm px-4 py-2 h-10 bg-red-600 hover:bg-red-700 text-white transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500"
                data-testid="confirm-reject-btn"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : null}
                Reject Application
              </button>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
};
