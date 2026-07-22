import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import { usePermit } from '../../hooks/usePermit';
import { useAuthStore } from '../../store/auth.store';
import type { PermitApplication } from '../../types/permit.types';
import { PermitStatusBadge } from '../../components/permit/PermitStatusBadge';
import { PermitStatusTimeline } from '../../components/permit/PermitStatusTimeline';
import { DocumentList } from '../../components/document/DocumentList';
import { ReviewerActionPanel } from '../../components/reviewer/ReviewerActionPanel';
import { MessagePanel } from '../../components/messaging/MessagePanel';
import { AppShell } from '../../components/layout/AppShell';
import { permitsApi } from '../../api/permits.api';
import { useUiStore } from '../../store/ui.store';

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

// ─── Skeleton Loading ─────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 bg-gray-100 rounded" />
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div className="h-40 bg-gray-100 rounded-xl" />
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
        <div className="w-full lg:w-5/12 h-96 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useUiStore();

  const { permit: fetchedPermit, lifecycle, isLoading, error } = usePermit(id ?? '');
  const [permit, setPermit] = useState<PermitApplication | null>(null);
  const [isDownloadingArchive, setIsDownloadingArchive] = useState(false);

  // Sync fetched permit into local state (allows optimistic updates from action panel)
  if (fetchedPermit && !permit) {
    setPermit(fetchedPermit);
  } else if (fetchedPermit && permit && fetchedPermit.updated_at !== permit.updated_at) {
    // If the background fetch returned a newer version but we haven't done action, use it
    // (action panel updates take priority since user just did something)
  }

  const displayPermit = permit ?? fetchedPermit;

  const handleActionComplete = (updated: PermitApplication) => {
    setPermit(updated);
  };

  const handleDownloadAll = async () => {
    if (!displayPermit) return;
    setIsDownloadingArchive(true);
    try {
      const result = await permitsApi.getDocumentArchive(displayPermit.id);
      window.open(result.downloadUrl, '_blank', 'noopener,noreferrer');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Failed to generate download archive. Please try again.';
      addToast('error', msg);
    } finally {
      setIsDownloadingArchive(false);
    }
  };

  // ── Error state ──────────────────────────────────────────────────────────
  if (error && !displayPermit) {
    return (
      <AppShell title="Review Application">
        <div className="max-w-7xl mx-auto" data-testid="reviewer-detail-error">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700 font-medium">{error}</p>
            <button
              onClick={() => navigate('/review/queue')}
              className="mt-4 text-sm text-red-600 underline"
            >
              Back to review queue
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  // ── Loading state ────────────────────────────────────────────────────────
  if (isLoading && !displayPermit) {
    return (
      <AppShell title="Review Application">
        <div className="max-w-7xl mx-auto" data-testid="reviewer-detail-skeleton">
          <PageSkeleton />
        </div>
      </AppShell>
    );
  }

  if (!displayPermit) return null;

  const siteAddress = `${displayPermit.site_street}, ${displayPermit.site_city}, ${displayPermit.site_state} ${displayPermit.site_zip}`;

  return (
    <AppShell title={displayPermit.reference_number}>
      <div className="max-w-7xl mx-auto" data-testid="reviewer-detail-page">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-6">
          <button
            onClick={() => navigate('/review/queue')}
            className="text-sm text-brand-primary hover:underline self-start"
          >
            ← Review Queue
          </button>
          <div className="flex items-center gap-2 sm:ml-auto">
            <h1 className="text-xl font-bold font-mono text-text-primary">
              {displayPermit.reference_number}
            </h1>
            <PermitStatusBadge status={displayPermit.status} />
          </div>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column: 55% — form data + docs + timeline + action panel */}
          <div className="flex-1 lg:w-[55%] space-y-4">
            {/* Reviewer Action Panel */}
            <ReviewerActionPanel
              permit={displayPermit}
              onActionComplete={handleActionComplete}
            />

            {/* Application Details */}
            <section className="bg-white rounded-xl border border-border-default p-6" data-testid="form-data-panel">
              <h2 className="text-base font-semibold text-text-primary mb-4">Application Details</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ReadOnlyField
                  label="Permit Type"
                  value={PERMIT_TYPE_LABELS[displayPermit.permit_type] ?? displayPermit.permit_type}
                />
                <ReadOnlyField label="Reference Number" value={displayPermit.reference_number} />
                <ReadOnlyField label="Site Address" value={siteAddress} />
                <ReadOnlyField label="Applicant Name" value={displayPermit.contact_name} />
                {/* Reviewer-visible fields */}
                <ReadOnlyField label="Applicant Email" value={displayPermit.applicant_email ?? displayPermit.contact_email} />
                <ReadOnlyField label="Applicant Phone" value={displayPermit.applicant_phone ?? displayPermit.contact_phone} />
                {displayPermit.estimated_start_date && (
                  <ReadOnlyField label="Estimated Start Date" value={displayPermit.estimated_start_date} />
                )}
                {displayPermit.estimated_value != null && (
                  <ReadOnlyField
                    label="Estimated Value"
                    value={`$${displayPermit.estimated_value.toLocaleString()}`}
                  />
                )}
                <div className="sm:col-span-2">
                  <ReadOnlyField label="Project Description" value={displayPermit.project_description} />
                </div>
                {displayPermit.additional_notes && (
                  <div className="sm:col-span-2">
                    <ReadOnlyField label="Additional Notes" value={displayPermit.additional_notes} />
                  </div>
                )}
                {/* Info request note from reviewer */}
                {displayPermit.info_request_note && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-amber-700">Info Request Note (sent to applicant)</dt>
                    <dd className="mt-1 text-sm text-text-primary bg-amber-50 border border-amber-200 rounded-md p-2">
                      {displayPermit.info_request_note}
                    </dd>
                  </div>
                )}
                {/* Applicant's info response */}
                {displayPermit.info_response_note && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-green-700">Applicant's Response</dt>
                    <dd className="mt-1 text-sm text-text-primary bg-green-50 border border-green-200 rounded-md p-2">
                      {displayPermit.info_response_note}
                    </dd>
                  </div>
                )}
              </dl>
            </section>

            {/* Application Status Timeline */}
            <section className="bg-white rounded-xl border border-border-default p-6" data-testid="timeline-panel">
              <h2 className="font-semibold text-text-primary mb-4">Application Status</h2>
              <PermitStatusTimeline
                stages={lifecycle}
                currentStatus={displayPermit.status}
                infoRequestNote={displayPermit.info_request_note}
              />
            </section>

            {/* Documents */}
            <section className="bg-white rounded-xl border border-border-default p-6" data-testid="document-panel">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-text-primary">Documents</h2>
                <button
                  onClick={handleDownloadAll}
                  disabled={isDownloadingArchive}
                  data-testid="download-all-btn"
                  className="inline-flex items-center gap-2 text-sm text-brand-primary hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:underline"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                  {isDownloadingArchive ? 'Preparing…' : 'Download All'}
                </button>
              </div>
              <DocumentList
                applicationId={displayPermit.id}
                applicationStatus={displayPermit.status}
              />
            </section>
          </div>

          {/* Right column: 45% — MessagePanel (sticky full height) */}
          <div
            className="w-full lg:w-[45%] lg:sticky lg:top-6 lg:self-start"
            style={{ maxHeight: 'calc(100vh - 6rem)' }}
          >
            {user && (
              <MessagePanel
                applicationId={displayPermit.id}
                currentUserId={user.id}
                currentUserRole={user.role}
                isReviewer={true}
              />
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
