import React from 'react';
import './dashboard.css'
import { DashboardCard } from '../../components/dashboard/dashboard-card';
import icon1 from '../../static/images/profile_icon.png'
import icon2 from '../../static/images/directory_icon.png'
import icon3 from '../../static/images/career_icon.png'
import icon4 from '../../static/images/education_icon.png'
import icon5 from '../../static/images/donation_icon.png'
import icon6 from '../../static/images/mentoring_icon.png'
import icon7 from '../../static/images/events_icon.png'
import icon8 from '../../static/images/forums_icon.png'
import icon9 from '../../static/images/inquiries_icon.png'
import icon10 from '../../static/images/story_posts_icon.png'
import icon11 from '../../static/images/job_posts_icon.png'
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