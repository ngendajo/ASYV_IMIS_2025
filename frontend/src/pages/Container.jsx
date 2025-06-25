import { Outlet } from "react-router-dom";
import Header from '../components/dashboard/dashboard-header';
import Sidebar from '../components/dashboard/dashboard-sidebar';
import useAuth from '../hooks/useAuth';
import { useState } from 'react';

const Container = () => {
  const { auth } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <>
      <Header onToggleSidebar={toggleSidebar} />
      <div className="app-layout">
        <Sidebar className={sidebarOpen ? "show" : "hide-mobile"} />
        <div className="MarginContainer">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Container;
