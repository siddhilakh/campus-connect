import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { StudentDashboard } from './pages/StudentDashboard';
import { SeniorDashboard } from './pages/SeniorDashboard';
import { PlacementAdminDashboard } from './pages/PlacementAdminDashboard';
import { SystemAdminDashboard } from './pages/SystemAdminDashboard';
import { CompaniesPage } from './pages/CompaniesPage';
import { SeniorConnectPage } from './pages/SeniorConnectPage';
import { ExperienceDetailPage } from './pages/ExperienceDetailPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ProfilePage } from './pages/ProfilePage';
import { HelpFaqPage } from './pages/HelpFaqPage';

// Authenticated Layout Wrapper
const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex font-sans">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Protected Route Guard
const ProtectedRoute: React.FC<{
  children?: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role) && user.role !== 'SYSTEM_ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export const App: React.FC = () => {
  const { user, getDefaultRouteForRole } = useAuth();

  return (
    <Routes>
      {/* Public Login Route */}
      <Route
        path="/login"
        element={user ? <Navigate to={getDefaultRouteForRole(user.role)} replace /> : <Login />}
      />

      {/* Authenticated Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Default redirect to role dashboard */}
          <Route
            path="/"
            element={
              user ? (
                <Navigate to={getDefaultRouteForRole(user.role)} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Student Dashboard */}
          <Route path="/student-dashboard" element={<StudentDashboard />} />

          {/* Senior Dashboard */}
          <Route
            path="/senior-dashboard"
            element={
              <ProtectedRoute allowedRoles={['SENIOR', 'PLACEMENT_ADMIN', 'SYSTEM_ADMIN']}>
                <SeniorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Placement Admin Portal */}
          <Route
            path="/admin/manage-placements"
            element={
              <ProtectedRoute allowedRoles={['PLACEMENT_ADMIN', 'SYSTEM_ADMIN']}>
                <PlacementAdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* System Admin Portal */}
          <Route
            path="/admin/system"
            element={
              <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
                <SystemAdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Shared Discovery Pages */}
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/senior-connect" element={<SeniorConnectPage />} />
          <Route path="/senior-connect/experiences/:id" element={<ExperienceDetailPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/help" element={<HelpFaqPage />} />
        </Route>
      </Route>

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
