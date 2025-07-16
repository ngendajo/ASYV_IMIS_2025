import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../static/images/logo.png';
import useLogout from '../../hooks/useLogout';
import useAuth from '../../hooks/useAuth';
import { SidebarDataAlu } from './dashboard-sidebar-data-alu';
import { SidebarDataCrc } from './dashboard-sidebar-data-crc';
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import './dashboard-header.css';

export default function DashboardHeader({ onToggleSidebar, isSidebarVisible }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const navigate = useNavigate();
  const logout = useLogout();
  const { auth } = useAuth();

  const navData = auth.user?.is_alumni ? SidebarDataAlu : SidebarDataCrc;

  const toggleMenu = () => setMenuOpen(prev => !prev);

  const handleLogout = async () => {
    await logout();
    navigate('/home');
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="DashboardHeader">
      <div className="HomeHeaderTopbar">
        <div className="HomeHeaderLeft">
          <img src={Logo} alt="ASYV Logo" />
          {!isMobile && <p>Agahozo-Shalom Youth Village Alumni Platform</p>}
        </div>

        {isMobile ? (
          <div className="HomeHeaderRightCompact">
            <button className="HomeHeaderLoginCompact" onClick={handleLogout}>Logout</button>
            <button className="HomeHeaderHamburger" onClick={toggleMenu}>
              {menuOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
            </button>
          </div>
        ) : (
          <div className="DashboardHeaderRight">
            <div className="DashboardHeaderLogout">
              <button onClick={handleLogout}>Logout</button>
            </div>
          </div>
        )}
      </div>

      {isMobile && menuOpen && (
        <div className="MobileDropdownMenu">
          {navData.map((item, i) =>
            item.subNav ? (
              item.subNav.map((sub, j) => (
                <Link
                  key={`${i}-${j}`}
                  to={sub.path}
                  onClick={toggleMenu}
                  className="MobileDropdownItem"
                >
                  {sub.title}
                </Link>
              ))
            ) : (
              <Link
                key={i}
                to={item.path}
                onClick={toggleMenu}
                className="MobileDropdownItem"
              >
                {item.title}
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}
