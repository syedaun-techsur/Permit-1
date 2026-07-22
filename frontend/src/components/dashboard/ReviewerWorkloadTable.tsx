import { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import type { ReviewerWorkloadItem } from '../../types/dashboard.types';

interface ReviewerWorkloadTableProps {
  data: ReviewerWorkloadItem[];
  onViewQueue?: (reviewerId: string) => void;
}

type SortKey = keyof Pick<ReviewerWorkloadItem, 'reviewerName' | 'assigned' | 'underReview' | 'additionalInfoNeeded' | 'decidedThisWeek'>;

export function ReviewerWorkloadTable({ data, onViewQueue }: ReviewerWorkloadTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('assigned');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sorted = [...data].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal as string) : (aVal as number) - (bVal as number);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const TH = ({ col, label }: { col: SortKey; label: string }) => (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none hover:text-gray-900 whitespace-nowrap"
      onClick={() => handleSort(col)}
      aria-sort={sortKey === col ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className="w-3 h-3 opacity-60" />
      </span>
    </th>
  );

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="w-full text-sm" aria-label="Reviewer workload">
        <thead className="bg-gray-50">
          <tr>
            <TH col="reviewerName" label="Reviewer" />
            <TH col="assigned" label="Active" />
            <TH col="underReview" label="Under Review" />
            <TH col="additionalInfoNeeded" label="Needs Action" />
            <TH col="decidedThisWeek" label="Decided This Week" />
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row.reviewerId} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">{row.reviewerName}</td>
              <td className="px-4 py-3 text-gray-700">{row.assigned}</td>
              <td className="px-4 py-3 text-gray-700">{row.underReview}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1 font-semibold ${row.additionalInfoNeeded > 8 ? 'text-amber-600' : 'text-gray-700'}`}>
                  {row.additionalInfoNeeded > 8 && <span aria-label="Overloaded" title="Overloaded">⚠</span>}
                  {row.additionalInfoNeeded}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-700">{row.decidedThisWeek}</td>
              <td className="px-4 py-3">
                {onViewQueue && (
                  <button
                    onClick={() => onViewQueue(row.reviewerId)}
                    className="text-xs text-brand-primary hover:underline focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    View queue →
                  </button>
                )}
              </td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">
                No reviewers found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
