import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  /** When accentWhen > 0, apply accent color to the left border and icon. */
  accentWhen?: number;
  accentColor?: 'orange' | 'primary';
  isLoading?: boolean;
}

export function StatCard({ icon: Icon, value, label, accentWhen, accentColor = 'primary', isLoading }: StatCardProps) {
  const isAccented = accentWhen !== undefined && accentWhen > 0;
  const accentClass = isAccented
    ? accentColor === 'orange'
      ? 'border-l-4 border-orange-400'
      : 'border-l-4 border-brand-primary'
    : '';

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5 animate-pulse">
        <div className="h-8 w-8 bg-gray-200 rounded mb-3" />
        <div className="h-7 w-16 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm p-5 flex flex-col gap-2 transition-all ${accentClass}`}>
      <Icon className={`w-6 h-6 ${isAccented && accentColor === 'orange' ? 'text-orange-500' : 'text-brand-primary'}`} />
      <span className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</span>
      <span className="text-sm text-gray-500">{label}</span>
    </div>
  );
}
