import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { ApplicantDashboard } from './ApplicantDashboard';
import { ReviewerDashboard } from './ReviewerDashboard';

// AdminDashboard is added in Plan 04
// Import lazily to avoid breaking before Plan 04 runs:
const AdminDashboard = lazy(() =>
  import('./AdminDashboard')
    .then(m => ({ default: m.AdminDashboard }))
    .catch(() => ({ default: () => <div className="p-6 text-gray-500">Admin dashboard loading...</div> }))
);

export function DashboardPage() {
  const user = useAuthStore(s => s.user);
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'applicant') return <ApplicantDashboard />;
  if (user.role === 'reviewer') return <ReviewerDashboard />;
  if (user.role === 'admin') {
    return (
      <Suspense fallback={<div className="p-6 animate-pulse text-gray-400">Loading admin dashboard...</div>}>
        <AdminDashboard />
      </Suspense>
    );
  }
  return <Navigate to="/login" replace />;
}
