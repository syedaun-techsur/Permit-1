import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';
import { useAuthStore } from '../store/auth.store';
import { Skeleton } from '../components/ui/Skeleton';
import { UserRole } from '../types/auth.types';

const LoginPage = lazy(() => import('../pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));

// Permit pages
const PermitListPage = lazy(() => import('../pages/permits/PermitListPage').then(m => ({ default: m.PermitListPage })));
const PermitDetailPage = lazy(() => import('../pages/permits/PermitDetailPage').then(m => ({ default: m.PermitDetailPage })));
const PermitFormPageCreate = lazy(() =>
  import('../pages/permits/PermitFormPage').then(m => ({ default: () => m.PermitFormPage({ mode: 'create' }) }))
);
const PermitFormPageEdit = lazy(() =>
  import('../pages/permits/PermitFormPage').then(m => ({ default: () => m.PermitFormPage({ mode: 'edit' }) }))
);

// Reviewer pages
const ReviewQueuePage = lazy(() => import('../pages/reviewer/ReviewQueuePage').then(m => ({ default: m.ReviewQueuePage })));
const ReviewDetailPage = lazy(() => import('../pages/reviewer/ReviewDetailPage').then(m => ({ default: m.ReviewDetailPage })));

const PageLoader = () => (
  <div className="min-h-screen bg-surface-base flex items-center justify-center">
    <div className="w-full max-w-sm p-8 space-y-4">
      <Skeleton height="h-8" className="w-1/2" />
      <Skeleton lines={3} />
    </div>
  </div>
);

// Placeholder dashboard pages — replaced in later phases
const ApplicantDashboard = () => (
  <div className="p-8"><h1 className="text-heading-xl text-text-primary">Applicant Dashboard</h1><p className="text-body-md text-text-secondary mt-2">Coming in Phase 2.</p></div>
);
const ReviewerDashboard = () => (
  <div className="p-8"><h1 className="text-heading-xl text-text-primary">Reviewer Dashboard</h1><p className="text-body-md text-text-secondary mt-2">Coming in Phase 3.</p></div>
);
const AdminDashboard = () => (
  <div className="p-8"><h1 className="text-heading-xl text-text-primary">Admin Dashboard</h1><p className="text-body-md text-text-secondary mt-2">Coming in Phase 5.</p></div>
);

export function AppRouter() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Permit routes — protected */}
        <Route path="/permits" element={<ProtectedRoute><PermitListPage /></ProtectedRoute>} />
        <Route path="/permits/new" element={<ProtectedRoute><PermitFormPageCreate /></ProtectedRoute>} />
        <Route path="/permits/:id/edit" element={<ProtectedRoute><PermitFormPageEdit /></ProtectedRoute>} />
        <Route path="/permits/:id" element={<ProtectedRoute><PermitDetailPage /></ProtectedRoute>} />

        {/* Reviewer routes — RoleGuard restricts to reviewer/admin */}
        <Route
          path="/review/queue"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={[UserRole.REVIEWER, UserRole.ADMIN]}>
                <ReviewQueuePage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/review/:id"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={[UserRole.REVIEWER, UserRole.ADMIN]}>
                <ReviewDetailPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        {/* Protected routes */}
        <Route path="/applicant/*" element={<ProtectedRoute><ApplicantDashboard /></ProtectedRoute>} />
        <Route path="/reviewer/*" element={<ProtectedRoute><ReviewerDashboard /></ProtectedRoute>} />
        <Route path="/admin/*" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

        {/* Root redirect */}
        <Route path="/" element={<Navigate to={isAuthenticated ? '/applicant' : '/login'} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
