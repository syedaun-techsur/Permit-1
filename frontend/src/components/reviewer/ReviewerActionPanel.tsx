import React, { useState } from 'react';
import { format } from 'date-fns';
import type { PermitApplication } from '../../types/permit.types';
import { PermitStatusBadge } from '../permit/PermitStatusBadge';
import { Button } from '../ui/Button';
import { RequestInfoModal } from './RequestInfoModal';
import { DecisionModal } from './DecisionModal';
import { permitsApi } from '../../api/permits.api';
import { useUiStore } from '../../store/ui.store';

interface ReviewerActionPanelProps {
  permit: PermitApplication;
  onActionComplete: (updated: PermitApplication) => void;
}

export const ReviewerActionPanel: React.FC<ReviewerActionPanelProps> = ({
  permit,
  onActionComplete,
}) => {
  const { addToast } = useUiStore();
  const [isBeginningReview, setIsBeginningReview] = useState(false);
  const [requestInfoOpen, setRequestInfoOpen] = useState(false);
  const [decisionModalOutcome, setDecisionModalOutcome] = useState<
    'approved' | 'rejected' | null
  >(null);

  const handleBeginReview = async () => {
    setIsBeginningReview(true);
    try {
      const updated = await permitsApi.beginReview(permit.id);
      onActionComplete(updated);
      addToast('success', 'Review started. Application is now under review.');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Failed to begin review. Please try again.';
      addToast('error', msg);
    } finally {
      setIsBeginningReview(false);
    }
  };

  // ── Draft: guard ───────────────────────────────────────────────────────────
  if (permit.status === 'draft') {
    return null;
  }

  // ── Approved or Rejected: read-only decision card ──────────────────────────
  if (permit.status === 'approved' || permit.status === 'rejected') {
    return (
      <div
        className="bg-white rounded-xl border border-border-default p-4 mb-4"
        data-testid="reviewer-action-panel"
      >
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-sm font-semibold text-text-primary">Decision</h3>
          <PermitStatusBadge status={permit.status} />
        </div>
        {permit.decision_reason && (
          <div className="mb-3">
            <p className="text-xs text-text-secondary mb-1">Reason</p>
            <p className="text-sm text-text-primary">{permit.decision_reason}</p>
          </div>
        )}
        <div className="flex flex-wrap gap-4 text-xs text-text-secondary">
          {permit.decision_at && (
            <span>
              Decided:{' '}
              {format(new Date(permit.decision_at), 'PPP')}
            </span>
          )}
          {permit.decided_by && <span>By: {permit.decided_by}</span>}
        </div>
      </div>
    );
  }

  // ── Submitted or additional_info_needed: Begin Review ─────────────────────
  if (permit.status === 'submitted' || permit.status === 'additional_info_needed') {
    return (
      <div
        className="bg-white rounded-xl border border-border-default p-4 mb-4"
        data-testid="reviewer-action-panel"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Actions</h3>
            <p className="text-xs text-text-secondary mt-0.5">
              {permit.status === 'submitted'
                ? 'Start reviewing this application.'
                : 'Applicant has responded — begin reviewing their response.'}
            </p>
          </div>
          <Button
            variant="primary"
            loading={isBeginningReview}
            onClick={handleBeginReview}
            data-testid="begin-review-btn"
          >
            Begin Review
          </Button>
        </div>
      </div>
    );
  }

  // ── Under Review: full action bar ─────────────────────────────────────────
  if (permit.status === 'under_review') {
    return (
      <>
        <div
          className="bg-white rounded-xl border border-border-default p-4 mb-4"
          data-testid="reviewer-action-panel"
        >
          <h3 className="text-sm font-semibold text-text-primary mb-3">Review Actions</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => setRequestInfoOpen(true)}
              data-testid="request-info-btn"
            >
              Request Information
            </Button>
            <button
              onClick={() => setDecisionModalOutcome('approved')}
              data-testid="approve-btn"
              className="inline-flex items-center justify-center gap-2 font-medium rounded-md text-body-sm px-4 py-2 h-10 bg-green-600 hover:bg-green-700 text-white transition-all duration-150 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Approve
            </button>
            <button
              onClick={() => setDecisionModalOutcome('rejected')}
              data-testid="reject-btn"
              className="inline-flex items-center justify-center gap-2 font-medium rounded-md text-body-sm px-4 py-2 h-10 bg-red-600 hover:bg-red-700 text-white transition-all duration-150 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Reject
            </button>
          </div>
        </div>

        <RequestInfoModal
          applicationId={permit.id}
          isOpen={requestInfoOpen}
          onClose={() => setRequestInfoOpen(false)}
          onSuccess={(updated) => {
            setRequestInfoOpen(false);
            onActionComplete(updated);
          }}
        />

        <DecisionModal
          applicationId={permit.id}
          outcome={decisionModalOutcome ?? 'approved'}
          isOpen={decisionModalOutcome !== null}
          onClose={() => setDecisionModalOutcome(null)}
          onSuccess={(updated) => {
            setDecisionModalOutcome(null);
            onActionComplete(updated);
          }}
        />
      </>
    );
  }

  return null;
};
