import React, { useState } from 'react';
import DashboardHeader from './dashboard-header';
import DashboardSidebar from './dashboard-sidebar';

const DashboardLayout = ({ children }) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarVisible((prev) => !prev);
  };

  return (
    <div className="app-layout">
      <DashboardHeader onToggleSidebar={toggleSidebar} isSidebarVisible={isSidebarVisible} />
      {/* Sidebar always shows on desktop, never on mobile */}
      <DashboardSidebar className="hide-mobile" />
      <>
        {children}
      </>
    </div>
  );
};

export default DashboardLayout;
