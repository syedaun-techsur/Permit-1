import React from 'react';
import { Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { ApplicationStatus, LifecycleStage } from '../../types/permit.types';

interface PermitStatusTimelineProps {
  stages: LifecycleStage[];
  currentStatus: ApplicationStatus;
  infoRequestNote?: string;
}

const STAGE_LABELS: Record<ApplicationStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  additional_info_needed: 'Additional Info Needed',
  approved: 'Approved',
  rejected: 'Rejected',
};

type StageState = 'completed' | 'current' | 'future' | 'muted-terminal';

function getStageState(
  status: ApplicationStatus,
  currentStatus: ApplicationStatus,
  stages: LifecycleStage[],
): StageState {
  const isCompleted = stages.some((s) => s.stage === status);
  if (isCompleted) return 'completed';

  const isTerminal = status === 'approved' || status === 'rejected';
  if (isTerminal) {
    if (currentStatus === 'approved' && status === 'rejected') return 'muted-terminal';
    if (currentStatus === 'rejected' && status === 'approved') return 'muted-terminal';
  }

  if (status === currentStatus) return 'current';
  return 'future';
}

function getStageEntry(status: ApplicationStatus, stages: LifecycleStage[]): LifecycleStage | undefined {
  return stages.find((s) => s.stage === status);
}

const CompletedIndicator: React.FC = () => (
  <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center shrink-0">
    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
  </div>
);

const CurrentIndicator: React.FC = () => (
  <div className="relative shrink-0">
    <div className="w-6 h-6 rounded-full border-2 border-brand-primary bg-white" />
    <div className="absolute inset-0 rounded-full border-2 border-brand-primary animate-ping opacity-40" />
  </div>
);

const FutureIndicator: React.FC = () => (
  <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-white shrink-0" />
);

const MutedTerminalIndicator: React.FC = () => (
  <div className="w-6 h-6 rounded-full border-2 border-gray-200 bg-gray-50 shrink-0" />
);

export const PermitStatusTimeline: React.FC<PermitStatusTimelineProps> = ({
  stages,
  currentStatus,
  infoRequestNote,
}) => {
  // Non-terminal stages (always shown in main flow)
  const mainStages: ApplicationStatus[] = ['draft', 'submitted', 'under_review', 'additional_info_needed'];
  // Terminal branch stages
  const terminalStages: ApplicationStatus[] = ['approved', 'rejected'];

  const renderIndicator = (state: StageState) => {
    switch (state) {
      case 'completed':
        return <CompletedIndicator />;
      case 'current':
        return <CurrentIndicator />;
      case 'muted-terminal':
        return <MutedTerminalIndicator />;
      case 'future':
      default:
        return <FutureIndicator />;
    }
  };

  const renderConnectorLine = (isCompleted: boolean) => (
    <div
      className={`ml-3 w-0.5 h-6 ${isCompleted ? 'bg-brand-primary' : 'border-l-2 border-gray-300'}`}
    />
  );

  return (
    <div className="flex flex-col" data-testid="permit-status-timeline">
      {/* Main flow stages */}
      {mainStages.map((status, idx) => {
        const state = getStageState(status, currentStatus, stages);
        const entry = getStageEntry(status, stages);
        const isCompleted = state === 'completed';
        const isCurrent = state === 'current';
        const isLastMain = idx === mainStages.length - 1;

        return (
          <div key={status}>
            {/* Stage row */}
            <div className="flex items-start gap-3" data-testid={`stage-${status}`} data-state={state}>
              {renderIndicator(state)}
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center flex-wrap gap-2">
                  <span
                    className={`text-sm font-medium leading-tight ${
                      isCurrent
                        ? 'text-brand-primary'
                        : isCompleted
                        ? 'text-text-primary'
                        : 'text-text-secondary'
                    }`}
                  >
                    {STAGE_LABELS[status]}
                  </span>
                  {isCurrent && (
                    <span
                      className="bg-brand-primary/10 text-brand-primary text-xs px-2 py-0.5 rounded-full"
                      data-testid="in-progress-pill"
                    >
                      In Progress
                    </span>
                  )}
                </div>
                {entry && (
                  <p
                    className="text-sm text-text-secondary mt-0.5 leading-tight"
                    title={new Date(entry.entered_at).toLocaleString()}
                  >
                    {formatDistanceToNow(new Date(entry.entered_at), { addSuffix: true })}
                  </p>
                )}
              </div>
            </div>

            {/* Info request note shown after additional_info_needed stage */}
            {status === 'additional_info_needed' && infoRequestNote && currentStatus === 'additional_info_needed' && (
              <div className="ml-9 mt-2 mb-2 p-3 bg-orange-50 border border-orange-300 rounded-lg text-sm text-orange-800">
                <p className="font-semibold mb-1">Additional Information Requested:</p>
                <p>{infoRequestNote}</p>
              </div>
            )}

            {/* Connector line between stages (not after the last main stage) */}
            {!isLastMain && (
              <div className="ml-3 w-0.5 h-5 bg-gradient-to-b from-transparent to-transparent">
                {renderConnectorLine(isCompleted)}
              </div>
            )}
          </div>
        );
      })}

      {/* Terminal branching section */}
      <div className="ml-3 flex items-start gap-0 mt-1">
        {/* Branch connector line */}
        <div className="flex flex-col">
          <div className="w-0.5 h-4 bg-gray-300" />
          {/* Fork: two lines splitting from one */}
        </div>
      </div>

      {/* Terminal stages: approved and rejected as branching nodes */}
      <div className="ml-4 space-y-2" data-testid="terminal-stages">
        {terminalStages.map((status, idx) => {
          const state = getStageState(status, currentStatus, stages);
          const entry = getStageEntry(status, stages);
          const isCompleted = state === 'completed';
          const isMuted = state === 'muted-terminal';
          const prefix = idx === 0 ? '├─' : '└─';

          return (
            <div key={status} className="flex items-start gap-2" data-testid={`stage-${status}`} data-state={state}>
              <span className="text-gray-400 text-xs leading-6 select-none">{prefix}</span>
              {renderIndicator(state)}
              <div className="flex-1 min-w-0">
                <span
                  className={`text-sm font-medium leading-tight ${
                    isCompleted
                      ? status === 'approved'
                        ? 'text-green-700'
                        : 'text-red-700'
                      : isMuted
                      ? 'text-gray-300 line-through'
                      : 'text-text-secondary'
                  }`}
                  data-testid={`${status}-label`}
                >
                  {STAGE_LABELS[status]}
                </span>
                {entry && (
                  <p
                    className="text-sm text-text-secondary mt-0.5"
                    title={new Date(entry.entered_at).toLocaleString()}
                  >
                    {formatDistanceToNow(new Date(entry.entered_at), { addSuffix: true })}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
