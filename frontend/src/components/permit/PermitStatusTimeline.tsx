import React from 'react';
import { format } from 'date-fns';
import type { ApplicationStatus, LifecycleStage } from '../../types/permit.types';

interface PermitStatusTimelineProps {
  stages: LifecycleStage[];
  currentStatus: ApplicationStatus;
  infoRequestNote?: string;
}

const STAGE_ORDER: ApplicationStatus[] = [
  'draft',
  'submitted',
  'under_review',
  'additional_info_needed',
  'approved',
];

const STAGE_LABELS: Record<ApplicationStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  additional_info_needed: 'Additional Info Needed',
  approved: 'Approved',
  rejected: 'Rejected',
};

/** Maps internal status values to human-readable ARIA strings */
const STAGE_STATUS_LABELS: Record<'completed' | 'current' | 'future', string> = {
  completed: 'completed',
  current: 'current',
  future: 'upcoming',
};

function getStageStatus(
  stage: ApplicationStatus,
  currentStatus: ApplicationStatus,
  stageRecord: LifecycleStage | undefined,
): 'completed' | 'current' | 'future' {
  if (stageRecord) return 'completed';

  // Special: approved/rejected are terminal — both are "future" unless reached
  if (
    (stage === 'approved' || stage === 'rejected') &&
    currentStatus !== 'approved' &&
    currentStatus !== 'rejected'
  ) {
    return 'future';
  }

  if (stage === currentStatus) return 'current';

  // Determine if this stage comes before current in the normal flow
  const stageIdx = STAGE_ORDER.indexOf(stage);
  const currentIdx = STAGE_ORDER.indexOf(currentStatus);
  if (stageIdx < currentIdx) return 'completed';

  return 'future';
}

interface StageNodeProps {
  stage: ApplicationStatus;
  status: 'completed' | 'current' | 'future';
  stageRecord?: LifecycleStage;
  isLast?: boolean;
}

const StageNode: React.FC<StageNodeProps> = ({ stage, status, stageRecord, isLast }) => {
  const label = STAGE_LABELS[stage];
  const enteredAt = stageRecord?.entered_at ? new Date(stageRecord.entered_at) : null;
  const formattedDate = enteredAt ? format(enteredAt, 'PPpp') : null;

  const ariaLabel = [
    label,
    STAGE_STATUS_LABELS[status],
    formattedDate ? `completed ${formattedDate}` : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <li
      className="relative flex items-start gap-4"
      aria-label={ariaLabel}
      aria-current={status === 'current' ? 'step' : undefined}
    >
      {/* Connector line */}
      {!isLast && (
        <div
          className={`absolute left-3.5 top-7 w-0.5 h-full -translate-x-1/2 ${
            status === 'completed' ? 'bg-brand-primary' : 'bg-border-default'
          }`}
          aria-hidden="true"
        />
      )}

      {/* Stage indicator */}
      <div
        className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-full border-2 shrink-0 mt-0.5 ${
          status === 'completed'
            ? 'bg-brand-primary border-brand-primary text-white'
            : status === 'current'
            ? 'bg-white border-brand-primary ring-4 ring-blue-100'
            : 'bg-white border-border-default'
        }`}
        aria-hidden="true"
      >
        {status === 'completed' && (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {status === 'current' && (
          <div className="w-2 h-2 rounded-full bg-brand-primary" aria-hidden="true" />
        )}
      </div>

      {/* Stage details — aria-hidden since the li aria-label covers all info */}
      <div className="flex-1 min-w-0 pb-6" aria-hidden="true">
        <p
          className={`text-body-sm font-medium ${
            status === 'future' ? 'text-text-disabled' : 'text-text-primary'
          }`}
        >
          {label}
          {status === 'current' && (
            <span className="ml-2 text-caption text-brand-primary font-normal">In Progress</span>
          )}
        </p>

        {enteredAt && (
          <p
            className="text-caption text-text-secondary mt-0.5"
            title={format(enteredAt, 'PPpp')}
          >
            {format(enteredAt, 'PP')}
          </p>
        )}
      </div>
    </li>
  );
};

export const PermitStatusTimeline: React.FC<PermitStatusTimelineProps> = ({
  stages,
  currentStatus,
  infoRequestNote,
}) => {
  const stageMap = new Map<ApplicationStatus, LifecycleStage>();
  for (const s of stages) {
    stageMap.set(s.stage, s);
  }

  // Build node list: always show draft, submitted, under_review, additional_info_needed
  // and then show the terminal node (approved or rejected)
  const isTerminalApproved = currentStatus === 'approved';
  const isTerminalRejected = currentStatus === 'rejected';

  const coreStages: ApplicationStatus[] = [
    'draft',
    'submitted',
    'under_review',
    'additional_info_needed',
  ];

  // Terminal nodes
  const terminalStages: ApplicationStatus[] =
    isTerminalRejected ? ['rejected'] : isTerminalApproved ? ['approved'] : ['approved', 'rejected'];

  const allNodes = [...coreStages, ...terminalStages];

  return (
    <div data-testid="timeline-panel">
      {/* Info request note */}
      {currentStatus === 'additional_info_needed' && infoRequestNote && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-md" role="note">
          <p className="text-body-sm font-medium text-orange-800 mb-1">Additional Information Required</p>
          <p className="text-body-sm text-orange-700">{infoRequestNote}</p>
        </div>
      )}

      <ol aria-label="Permit application lifecycle" className="list-none">
        {allNodes.map((stage, index) => {
          const stageRecord = stageMap.get(stage);
          const nodeStatus = getStageStatus(stage, currentStatus, stageRecord);
          const isLast = index === allNodes.length - 1;

          return (
            <StageNode
              key={stage}
              stage={stage}
              status={nodeStatus}
              stageRecord={stageRecord}
              isLast={isLast}
            />
          );
        })}
      </ol>
    </div>
  );
};
