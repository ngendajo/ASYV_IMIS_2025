import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { SidebarDataAlu } from './dashboard-sidebar-data-alu.jsx';
import { SidebarDataCrc } from './dashboard-sidebar-data-crc.jsx';
import useAuth from '../../hooks/useAuth';
import ProfileImage from "./ProfileImage.jsx";
import baseUrl from "../../api/baseUrl";
import axios from "axios";

// Styled Components
const ProfileName = styled.span`
  color: var(--orange);
  font-family: Medium;
  font-size: 18px;
  line-height: 1.2;
`;

const ProfileRole = styled.span`
  color: var(--white);
  font-family: Regular;
  font-size: 14px;
  margin-top: 5px;
`;

const navTextStyles = css`
  color: var(--orange);
  font-family: Medium;
  font-size: 18px;
  padding: 8px 30px;
`;

const navSubTextStyles = css`
  color: var(--white);
  font-family: Regular;
  font-size: 16px;
  padding: 7px 40px;
`;

const SidebarLink = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  transition: 0.1s;

  &.active {
    background: var(--green);
    color: var(--white);
  }

  ${(props) => props.cName === 'nav-text' && navTextStyles}
  ${(props) => props.cName === 'nav-sub-text' && navSubTextStyles}
`;

const SubMenu = styled.div`
  display: ${(props) => (props.isOpen ? 'block' : 'none')};
`;

const ArrowIcon = styled.span`
  font-size: 18px;
  transition: transform 0.3s;
  transform: ${(props) => (props.isOpen ? 'rotate(90deg)' : 'rotate(0deg)')};
  margin-left: auto;
`;

// Component
const Sidebar = ({ className }) => {
  const { auth } = useAuth();
  const location = useLocation();
  const [openSubNav, setOpenSubNav] = useState([]);
  const [user, setUser] = useState(null);

  // Load user data
  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await axios.get(`${baseUrl}/users/?id=${auth.user.id}`, {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
            "Content-Type": "multipart/form-data"
          },
          withCredentials: true
        });
        setUser(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    getUsers();
  }, [auth]);

  // SubNav Toggle
  const handleSubNavToggle = (index) => {
    setOpenSubNav((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const isSubNavOpen = (index) => openSubNav.includes(index);

  const sidebarData = auth.user.is_alumni ? SidebarDataAlu : SidebarDataCrc;

  return (
    <div className={`Sidebar ${className || ""}`}>
      <div className="SidebarWrap">
        <div className="Profile">
          {user && <ProfileImage user={user} size={48} canEdit={false} />}
          <div className="ProfileText">
            <ProfileName>{auth.user.first_name}</ProfileName>
            {auth.user.is_alumni && <ProfileRole>Alumni</ProfileRole>}
            {auth.user.is_crc && <ProfileRole>CRC Staff</ProfileRole>}
            {auth.user.is_superuser && <ProfileRole>Super User</ProfileRole>}
          </div>
        </div>

        <div className="Content">
          {sidebarData.map((item, index) => (
            <div key={index}>
              {item.subNav ? (
                <>
                  <SidebarLink
                    to={item.path}
                    cName={item.cName}
                    onClick={(e) => { e.preventDefault(); handleSubNavToggle(index); }}
                    className={location.pathname === item.path ? 'active' : ''}
                  >
                    {item.title}
                    <ArrowIcon isOpen={isSubNavOpen(index)}>&gt;</ArrowIcon>
                  </SidebarLink>
                  <SubMenu isOpen={isSubNavOpen(index)}>
                    {item.subNav.map((subItem, subIndex) => (
                      <SidebarLink
                        to={subItem.path}
                        key={subIndex}
                        cName={subItem.cName}
                        className={location.pathname === subItem.path ? 'active' : ''}
                      >
                        {subItem.title}
                      </SidebarLink>
                    ))}
                  </SubMenu>
                </>
              ) : (
                <SidebarLink
                  to={item.path}
                  cName={item.cName}
                  className={location.pathname === item.path ? 'active' : ''}
                >
                  {item.title}
                </SidebarLink>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
