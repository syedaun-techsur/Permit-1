import React, { useEffect, useRef, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAssignReviewer, useActiveReviewers } from '../../hooks/useAdmin';
import { useUiStore } from '../../store/ui.store';
import type { AdminPermit } from '../../types/admin.types';

interface AssignReviewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  permit: AdminPermit;
  onSuccess: () => void;
}

export const AssignReviewerModal: React.FC<AssignReviewerModalProps> = ({
  isOpen,
  onClose,
  permit,
  onSuccess,
}) => {
  const { reviewers, loading: reviewersLoading } = useActiveReviewers();
  const { assign, loading: assignLoading } = useAssignReviewer();
  const addToast = useUiStore((s) => s.addToast);

  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(permit.assignedReviewerId);
  const searchRef = useRef<HTMLInputElement>(null);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedId(permit.assignedReviewerId);
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [isOpen, permit.assignedReviewerId]);

  const filtered = reviewers.filter((r) =>
    r.fullName.toLowerCase().includes(search.toLowerCase()),
  );

  const handleConfirm = async () => {
    try {
      await assign(permit.id, selectedId);
      addToast('success', 'Reviewer assigned successfully');
      onSuccess();
      onClose();
    } catch {
      addToast('error', 'Failed to assign reviewer');
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={`Assign Reviewer — ${permit.referenceNumber}`}
      size="md"
    >
      <div aria-labelledby="assign-reviewer-title">
        <div className="mb-4">
          <label htmlFor="reviewer-search" className="text-label text-text-primary block mb-1">
            Search reviewer
          </label>
          <input
            id="reviewer-search"
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type reviewer name…"
            className="w-full px-3 py-2 rounded-sm border border-border-default bg-surface-card text-text-primary text-body-md focus:outline-none focus:ring-2 focus:ring-border-focus"
            aria-label="Search reviewers"
          />
        </div>

        {reviewersLoading ? (
          <p className="text-body-sm text-text-secondary py-4 text-center">Loading reviewers…</p>
        ) : (
          <ul
            role="listbox"
            aria-label="Reviewer options"
            className="max-h-60 overflow-y-auto border border-border-default rounded-sm divide-y divide-border-default"
          >
            {/* Unassign option */}
            <li
              role="option"
              aria-selected={selectedId === null}
              onClick={() => setSelectedId(null)}
              className={`px-4 py-2 cursor-pointer hover:bg-surface-sidebar text-body-sm transition-colors ${
                selectedId === null ? 'bg-surface-sidebar font-medium text-brand-primary' : 'text-text-secondary'
              }`}
            >
              No reviewer / Unassign
            </li>

            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-body-sm text-text-secondary text-center">
                No reviewers match your search
              </li>
            ) : (
              filtered.map((r) => (
                <li
                  key={r.id}
                  role="option"
                  aria-selected={selectedId === r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={`px-4 py-2 cursor-pointer hover:bg-surface-sidebar text-body-sm transition-colors ${
                    selectedId === r.id
                      ? 'bg-surface-sidebar font-medium text-brand-primary'
                      : 'text-text-primary'
                  }`}
                >
                  {r.fullName}{' '}
                  <span className="text-text-secondary">
                    ({r.activeApplicationCount} active)
                  </span>
                </li>
              ))
            )}
          </ul>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={onClose} disabled={assignLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => void handleConfirm()}
            loading={assignLoading}
            disabled={assignLoading}
          >
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  );
};
