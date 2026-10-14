import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Standalone Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Public Catalog Pages (Within Dashboard Layout)
import Houses from './pages/Houses';
import HouseDetails from './pages/HouseDetails';
import HouseDesigns from './pages/HouseDesigns';
import DesignDetails from './pages/DesignDetails';
import Engineers from './pages/Engineers';
import EngineerDetails from './pages/EngineerDetails';

// Dashboard & Core Operations Pages (Protected)
import Dashboard from './pages/dashboard/Dashboard';
import Workers from './pages/Workers';
import ConstructionRequests from './pages/ConstructionRequests';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import ProjectProgress from './pages/ProjectProgress';
import ProjectDocuments from './pages/ProjectDocuments';
import Payments from './pages/Payments';
import Favorites from './pages/Favorites';
import Notifications from './pages/Notifications';
import Reviews from './pages/Reviews';
import UserProfile from './pages/UserProfile';

// Admin Pages
import AdminUsers from './pages/admin/AdminUsers';
import AdminReports from './pages/admin/AdminReports';

import NotFound from './pages/NotFound';

function App() {
  return (
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
  );
}

export default App;
