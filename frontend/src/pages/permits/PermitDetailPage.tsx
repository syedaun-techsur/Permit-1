import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { usePermit } from '../../hooks/usePermit';
import { useAuthStore } from '../../store/auth.store';
import { useUiStore } from '../../store/ui.store';
import { permitsApi } from '../../api/permits.api';
import type { PermitApplication } from '../../types/permit.types';
import { PermitStatusBadge } from '../../components/permit/PermitStatusBadge';
import { PermitStatusTimeline } from '../../components/permit/PermitStatusTimeline';
import { DocumentList } from '../../components/document/DocumentList';
import { MessagePanel } from '../../components/messaging/MessagePanel';
import { AppShell } from '../../components/layout/AppShell';

// ─── Skeleton loading components ─────────────────────────────────────────────

function HeaderSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-6" data-testid="header-skeleton">
      <div className="h-8 w-48 bg-gray-100 animate-pulse rounded" />
      <div className="h-6 w-24 bg-gray-100 animate-pulse rounded" />
      <div className="h-4 w-32 bg-gray-100 animate-pulse rounded" />
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="space-y-4" data-testid="timeline-skeleton">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-gray-100 animate-pulse shrink-0" />
          <div className="h-4 w-40 bg-gray-100 animate-pulse rounded" />
        </div>
      ))}
    </div>
  );
}

function FormPanelSkeleton() {
  return (
    <div className="space-y-4" data-testid="form-skeleton">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="space-y-1">
          <div className="h-4 w-24 bg-gray-100 animate-pulse rounded" />
          <div className="h-6 w-full bg-gray-100 animate-pulse rounded" />
        </div>
      ))}
    </div>
  );
}

function DocumentPanelSkeleton() {
  return (
    <div className="space-y-3" data-testid="document-skeleton">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="h-16 rounded-lg bg-gray-100 animate-pulse" />
      ))}
    </div>
  );
}

// ─── Read-only field display ──────────────────────────────────────────────────

function ReadOnlyField({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null || value === '') return null;
  return (
    <div>
      <dt className="text-sm font-medium text-text-secondary">{label}</dt>
      <dd className="mt-1 text-sm text-text-primary">{String(value)}</dd>
    </div>
  );
}

const PERMIT_TYPE_LABELS: Record<string, string> = {
  construction: 'Construction',
  zoning_variance: 'Zoning Variance',
  event_permit: 'Event Permit',
  demolition: 'Demolition',
  renovation: 'Renovation',
  signage: 'Signage',
};

// ─── Respond to Info Request form ────────────────────────────────────────────

interface RespondToInfoFormProps {
  permit: PermitApplication;
  onSuccess: (updated: PermitApplication) => void;
}

function RespondToInfoForm({ permit, onSuccess }: RespondToInfoFormProps) {
  const { addToast } = useUiStore();
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const MAX_CHARS = 2000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updated = await permitsApi.respondToInfo(permit.id, response.trim() || undefined);
      onSuccess(updated);
      setResponse('');
      addToast('success', 'Response submitted — your application is back under review.');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Failed to submit response. Please try again.';
      addToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className="bg-white rounded-xl border border-amber-200 p-6"
      data-testid="respond-to-info-section"
    >
      <h2 className="text-base font-semibold text-text-primary mb-3">
        Additional Information Required
      </h2>

      {/* Reviewer's request */}
      {permit.info_request_note && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded-md">
          <p className="text-xs font-medium text-amber-800 mb-1">Reviewer's request:</p>
          <p className="text-sm text-amber-900">{permit.info_request_note}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label
            htmlFor="respond-textarea"
            className="block text-sm font-medium text-text-primary mb-1"
          >
            Your Response
          </label>
          <p className="text-xs text-text-secondary mb-2">
            You may also upload new supporting documents above.
          </p>
          <textarea
            id="respond-textarea"
            data-testid="respond-textarea"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={4}
            maxLength={MAX_CHARS}
            placeholder="Provide your response or explanation here…"
            className="w-full border border-border-default rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-primary resize-y"
          />
          <p className="text-xs text-text-secondary mt-1 text-right">
            {response.length}/{MAX_CHARS}
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          data-testid="submit-response-btn"
          className="inline-flex items-center justify-center gap-2 font-medium rounded-md text-body-sm px-4 py-2 h-10 bg-brand-primary text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all duration-150 active:scale-[0.98]"
        >
          {isSubmitting ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : null}
          Submit Response
        </button>
      </form>
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function PermitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { permit: fetchedPermit, lifecycle, isLoading, error } = usePermit(id ?? '');
  const [localPermit, setLocalPermit] = useState<PermitApplication | null>(null);

  const permit = localPermit ?? fetchedPermit;

  const referenceTitle = permit?.reference_number ?? 'Permit Details';

  // ── Error state ──────────────────────────────────────────────────────────
  if (error && !permit) {
    return (
      <AppShell title="Permit Details">
        <div className="max-w-5xl mx-auto" data-testid="permit-detail-error">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700 font-medium">{error}</p>
            <button
              onClick={() => navigate('/permits')}
              className="mt-4 text-sm text-red-600 underline"
            >
              Back to permits
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  // ── Skeleton loading ─────────────────────────────────────────────────────
  if (isLoading && !permit) {
    return (
      <AppShell title="Permit Details">
        <div className="max-w-5xl mx-auto" data-testid="permit-detail-skeleton">
          <HeaderSkeleton />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-white rounded-xl border p-6">
                <div className="h-6 w-40 bg-gray-100 animate-pulse rounded mb-4" />
                <FormPanelSkeleton />
              </section>
              <section className="bg-white rounded-xl border p-6">
                <div className="h-6 w-32 bg-gray-100 animate-pulse rounded mb-4" />
                <DocumentPanelSkeleton />
              </section>
            </div>
            <div>
              <section className="bg-white rounded-xl border p-6">
                <div className="h-6 w-36 bg-gray-100 animate-pulse rounded mb-4" />
                <TimelineSkeleton />
              </section>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!permit) return null;

  const siteAddress = `${permit.site_street}, ${permit.site_city}, ${permit.site_state} ${permit.site_zip}`;

  return (
    <AppShell title={referenceTitle}>
      <div className="max-w-5xl mx-auto" data-testid="permit-detail-page">
        {/* ── Page Header ───────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-6">
          <h1 className="text-xl font-bold font-mono text-text-primary" data-testid="permit-reference">
            {permit.reference_number}
          </h1>
          <PermitStatusBadge status={permit.status} />
          {permit.submitted_at && (
            <span className="text-sm text-text-secondary" data-testid="permit-submitted-date">
              Submitted {formatDistanceToNow(new Date(permit.submitted_at), { addSuffix: true })}
            </span>
          )}
        </div>

        {/* ── Two-column layout ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: form data + documents + messaging (2/3 width on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Details (read-only) */}
            <section className="bg-white rounded-xl border p-6" data-testid="form-data-panel">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-text-primary">Application Details</h2>
                {permit.status === 'draft' && (
                  <a
                    href={`/permits/${permit.id}/edit`}
                    className="text-sm text-brand-primary font-medium hover:underline"
                    data-testid="edit-button"
                  >
                    Edit
                  </a>
                )}
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ReadOnlyField
                  label="Permit Type"
                  value={PERMIT_TYPE_LABELS[permit.permit_type] ?? permit.permit_type}
                />
                <ReadOnlyField label="Reference Number" value={permit.reference_number} />
                <ReadOnlyField label="Site Address" value={siteAddress} />
                <ReadOnlyField label="Contact Name" value={permit.contact_name} />
                <ReadOnlyField label="Contact Phone" value={permit.contact_phone} />
                <ReadOnlyField label="Contact Email" value={permit.contact_email} />
                {permit.estimated_start_date && (
                  <ReadOnlyField label="Estimated Start Date" value={permit.estimated_start_date} />
                )}
                {permit.estimated_value != null && (
                  <ReadOnlyField
                    label="Estimated Value"
                    value={`$${permit.estimated_value.toLocaleString()}`}
                  />
                )}
                <div className="sm:col-span-2">
                  <ReadOnlyField label="Project Description" value={permit.project_description} />
                </div>
                {permit.additional_notes && (
                  <div className="sm:col-span-2">
                    <ReadOnlyField label="Additional Notes" value={permit.additional_notes} />
                  </div>
                )}
                {permit.decision_reason && (
                  <div className="sm:col-span-2">
                    <ReadOnlyField label="Decision Reason" value={permit.decision_reason} />
                  </div>
                )}
              </dl>
            </section>

            {/* Document Panel */}
            <section className="bg-white rounded-xl border p-6" data-testid="document-panel">
              <h2 className="text-base font-semibold text-text-primary mb-4">Documents</h2>
              <DocumentList
                applicationId={permit.id}
                applicationStatus={permit.status}
              />
            </section>

            {/* Respond to Info Request — only visible when additional_info_needed */}
            {permit.status === 'additional_info_needed' && (
              <RespondToInfoForm
                permit={permit}
                onSuccess={(updated) => setLocalPermit(updated)}
              />
            )}

            {/* Messaging Panel */}
            {user && permit.status !== 'draft' && (
              <section className="bg-white rounded-xl border p-6" data-testid="messaging-panel">
                <MessagePanel
                  applicationId={permit.id}
                  currentUserId={user.id}
                  currentUserRole={user.role}
                  isReviewer={false}
                />
              </section>
            )}
            {permit.status === 'draft' && (
              <section className="bg-white rounded-xl border p-6" data-testid="messaging-panel">
                <h2 className="text-base font-semibold text-text-primary mb-4">Messages</h2>
                <p className="text-text-secondary text-sm text-center py-8" data-testid="messaging-stub">
                  Messaging will be available once your application is under review.
                </p>
              </section>
            )}
          </div>

          {/* Right column: lifecycle timeline (1/3 width on desktop) */}
          <div>
            <section className="bg-white rounded-xl border p-6" data-testid="timeline-panel">
              <h2 className="font-semibold text-text-primary mb-4">Application Status</h2>
              <PermitStatusTimeline
                stages={lifecycle}
                currentStatus={permit.status}
                infoRequestNote={permit.info_request_note}
              />
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
