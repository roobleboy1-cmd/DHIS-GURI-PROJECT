import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Fast Loading Spinner for Route Suspense
const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Standalone Auth Pages (Lazy loaded)
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));

// Public Catalog Pages (Lazy loaded)
const Houses = lazy(() => import('./pages/Houses'));
const HouseDetails = lazy(() => import('./pages/HouseDetails'));
const HouseDesigns = lazy(() => import('./pages/HouseDesigns'));
const DesignDetails = lazy(() => import('./pages/DesignDetails'));
const Engineers = lazy(() => import('./pages/Engineers'));
const EngineerDetails = lazy(() => import('./pages/EngineerDetails'));

// Dashboard & Core Operations Pages (Lazy loaded)
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const Workers = lazy(() => import('./pages/Workers'));
const ConstructionRequests = lazy(() => import('./pages/ConstructionRequests'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetails = lazy(() => import('./pages/ProjectDetails'));
const ProjectProgress = lazy(() => import('./pages/ProjectProgress'));
const ProjectDocuments = lazy(() => import('./pages/ProjectDocuments'));
const Payments = lazy(() => import('./pages/Payments'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Reviews = lazy(() => import('./pages/Reviews'));
const UserProfile = lazy(() => import('./pages/UserProfile'));

// Admin Pages (Lazy loaded)
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));

const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
      {/* Standalone Authentication Pages (Clean center card, no sidebar) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* All Application Pages Wrapped in Unified Dashboard Layout */}
      <Route element={<DashboardLayout />}>
        {/* Site root navigates directly to Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Public Catalog Routes */}
        <Route path="/houses" element={<Houses />} />
        <Route path="/houses/:id" element={<HouseDetails />} />
        <Route path="/designs" element={<HouseDesigns />} />
        <Route path="/designs/:id" element={<DesignDetails />} />
        <Route path="/engineers" element={<Engineers />} />
        <Route path="/engineers/:id" element={<EngineerDetails />} />

        {/* Authenticated Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workers"
          element={
            <ProtectedRoute allowedRoles={['admin', 'engineer']}>
              <Workers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests"
          element={
            <ProtectedRoute allowedRoles={['admin', 'engineer', 'client']}>
              <ConstructionRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute>
              <ProjectDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id/progress"
          element={
            <ProtectedRoute>
              <ProjectProgress />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id/documents"
          element={
            <ProtectedRoute>
              <ProjectDocuments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute allowedRoles={['admin', 'client']}>
              <Payments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute allowedRoles={['admin', 'client']}>
              <Favorites />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviews"
          element={
            <ProtectedRoute>
              <Reviews />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        {/* Admin Guarded Routes */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminReports />
            </ProtectedRoute>
          }
        />

        {/* 404 Catch-All Page inside Dashboard Layout */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
    </Suspense>
  );
}

export default App;
