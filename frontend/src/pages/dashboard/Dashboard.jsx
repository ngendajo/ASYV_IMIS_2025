import React from 'react';
import './dashboard.css'
import useAuth from '../../hooks/useAuth';
import DashboardLayout from '../../components/dashboard/dashboard-layout';
import AlumniOutcomesDashboard from '../../components/dashboard/alumni-trends.jsx';
import AlumniDashboard from '../../components/dashboard/AlumniDashboard.jsx';


const Dashboard = () => {

  const { auth } = useAuth();
  
  return (
    <div>
    {(auth.user.is_alumni) && (
      <>
        <AlumniDashboard />
      </>)}
    {(auth.user.is_crc || auth.user.is_superuser) && (
      <>
      <div className="DashboardGrid">
        <AlumniOutcomesDashboard />
      </div>
      </>)}
    </div>
    
  );
};

export default Dashboard;