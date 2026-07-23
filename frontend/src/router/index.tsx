import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';
import { useAuthStore } from '../store/auth.store';
import { Skeleton } from '../components/ui/Skeleton';
import { UserRole } from '../types/auth.types';

// Admin pages
const AdminApplicationsPage = lazy(() =>
  import('../pages/admin/AdminApplicationsPage').then(m => ({ default: m.AdminApplicationsPage }))
);
const UserManagementPage = lazy(() =>
  import('../pages/admin/UserManagementPage').then(m => ({ default: m.UserManagementPage }))
);
const AuditLogPage = lazy(() =>
  import('../pages/admin/AuditLogPage').then(m => ({ default: m.AuditLogPage }))
);

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

// Dashboard page (role-aware router)
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));

const PageLoader = () => (
  <div className="min-h-screen bg-surface-base flex items-center justify-center">
    <div className="w-full max-w-sm p-8 space-y-4">
      <Skeleton height="h-8" className="w-1/2" />
      <Skeleton lines={3} />
    </div>
  </div>
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

        {/* Dashboard — role-aware router */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

        {/* Admin routes — protected by admin RoleGuard */}
        <Route
          path="/admin/applications"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                <AdminApplicationsPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                <UserManagementPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit-log"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                <AuditLogPage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        {/* Legacy role-based routes redirect to /dashboard */}
        <Route path="/applicant/*" element={<Navigate to="/dashboard" replace />} />
        <Route path="/reviewer/*" element={<Navigate to="/dashboard" replace />} />
        <Route path="/admin/*" element={<Navigate to="/dashboard" replace />} />

        {/* Root redirect */}
        <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
