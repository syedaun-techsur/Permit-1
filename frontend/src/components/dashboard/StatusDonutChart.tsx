import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState } from 'react';
import type { StatusDistributionItem } from '../../types/dashboard.types';

interface StatusDonutChartProps {
  data: StatusDistributionItem[];
  onSliceClick?: (status: string) => void;
  title?: string;
}

// Map permit statuses to accessible, color-blind-safe colors
// Matches color.status.* tokens from Phase 1 tailwind.config.ts
const STATUS_COLORS: Record<string, string> = {
  draft:                  '#94a3b8',  // status.draft — slate-400
  submitted:              '#2563EB',  // status.submitted — brand blue
  under_review:           '#D97706',  // status.under_review — amber
  additional_info_needed: '#EA580C',  // status.additional_info — orange-red
  approved:               '#16A34A',  // status.approved — green
  rejected:               '#DC2626',  // status.rejected — red
};

export function StatusDonutChart({ data, onSliceClick, title = 'Application Status Distribution' }: StatusDonutChartProps) {
  const [chartError, setChartError] = useState(false);
  const totalCount = data.reduce((sum, d) => sum + d.count, 0);
  const ariaLabel = `${title}: ${data.map(d => `${d.count} ${d.status.replace(/_/g, ' ')}`).join(', ')}`;

  if (chartError) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
        Chart unavailable.
        <button onClick={() => setChartError(false)} className="text-brand-primary hover:underline focus:outline-none focus:ring-2 focus:ring-brand-primary">
          Retry
        </button>
      </div>
    );
  }

  if (!data.length) return null;

  return (
    <div>
      {/* Accessible chart */}
      <div
        role="img"
        aria-label={ariaLabel}
        style={{ width: '100%', height: 260 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
              innerRadius="55%"
              outerRadius="75%"
              paddingAngle={2}
              animationDuration={300}
              onClick={(entry) => onSliceClick?.(entry.status as string)}
              style={{ cursor: onSliceClick ? 'pointer' : 'default' }}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.status}
                  fill={STATUS_COLORS[entry.status] ?? '#64748b'}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [value, name.replace(/_/g, ' ')]}
            />
            <Legend
              formatter={(value) => (value as string).replace(/_/g, ' ')}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Center label */}
      <p className="text-center text-sm text-gray-500 -mt-2">{totalCount} total</p>

      {/* Visually-hidden fallback table for screen readers */}
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr><th>Status</th><th>Count</th></tr>
        </thead>
        <tbody>
          {data.map(d => (
            <tr key={d.status}>
              <td>{d.status.replace(/_/g, ' ')}</td>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
