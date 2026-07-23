import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { useState } from 'react';
import type { StatusDistributionItem } from '../../types/dashboard.types';

interface StatusBarChartProps {
  data: StatusDistributionItem[];
  onBarClick?: (status: string) => void;
  title?: string;
}

// Matches color.status.* tokens from Phase 1 tailwind.config.ts
const STATUS_COLORS: Record<string, string> = {
  draft:                  '#94a3b8',
  submitted:              '#2563EB',
  under_review:           '#D97706',
  additional_info_needed: '#EA580C',
  approved:               '#16A34A',
  rejected:               '#DC2626',
};

export function StatusBarChart({ data, onBarClick, title = 'Applications by Status' }: StatusBarChartProps) {
  const [chartError, setChartError] = useState(false);
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

  // Format status label for display
  const chartData = data.map(d => ({ ...d, label: d.status.replace(/_/g, ' ') }));

  return (
    <div>
      <div
        role="img"
        aria-label={ariaLabel}
        style={{ width: '100%', height: 300 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 32 }}>
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="label" width={150} />
            <Tooltip formatter={(value: number) => [value, 'Applications']} />
            <Bar
              dataKey="count"
              radius={[0, 4, 4, 0]}
              animationDuration={300}
              onClick={(entry) => onBarClick?.((entry as { status: string }).status)}
              style={{ cursor: onBarClick ? 'pointer' : 'default' }}
            >
              {chartData.map((entry) => (
                <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#64748b'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Screen-reader fallback table */}
      <table className="sr-only">
        <caption>{title}</caption>
        <thead><tr><th>Status</th><th>Count</th></tr></thead>
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
