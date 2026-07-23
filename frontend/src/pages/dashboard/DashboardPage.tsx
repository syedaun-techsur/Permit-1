import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { AppShell } from '../../components/layout/AppShell';
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

  let content: ReactNode;
  if (user.role === 'applicant') {
    content = <ApplicantDashboard />;
  } else if (user.role === 'reviewer') {
    content = <ReviewerDashboard />;
  } else if (user.role === 'admin') {
    content = (
      <Suspense fallback={<div className="p-6 animate-pulse text-gray-400">Loading admin dashboard...</div>}>
        <AdminDashboard />
      </Suspense>
    );
  } else {
    return <Navigate to="/login" replace />;
  }

  // Wrap in the shared shell (NavBar + skip link) so the dashboard/home page has the
  // same TopBar — log out, notifications — as every other page. `bare` because each
  // role dashboard already provides its own padded/centered container.
  return <AppShell bare>{content}</AppShell>;
}
