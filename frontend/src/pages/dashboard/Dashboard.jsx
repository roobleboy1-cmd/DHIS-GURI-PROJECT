import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import EngineerDashboard from './EngineerDashboard';
import ClientDashboard from './ClientDashboard';
import WorkerDashboard from './WorkerDashboard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner fullScreen message="Loading workspace..." />;

  switch (user?.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'engineer':
      return <EngineerDashboard />;
    case 'worker':
      return <WorkerDashboard />;
    case 'client':
    default:
      return <ClientDashboard />;
  }
};

export default Dashboard;
