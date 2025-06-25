// src/components/Sidebar.jsx
import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { SidebarData } from './SidebarData';
import Profile from '../../static/images/profile.jpg';
import useAuth from '../../hooks/useAuth';

const SidebarNav = styled.nav`
  background: var(--black);
  width: 264px;
  height: 832px;
  display: flex;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  transition: 350ms;
  z-index: 10;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  overflow-y: auto; /* Add vertical scroll */
`;

const SidebarWrap = styled.div`
  width: 100%;
  padding: 20px 0;
`;

const ScrollableSidebarWrap = styled.div`
  flex: 1;
  overflow-y: auto;
  max-height: calc(100vh - 160px); /* Adjust based on the profile section height */
  padding-right: 10px; /* Space for scrollbar */
  scrollbar-width: none; /* For Firefox */
  -ms-overflow-style: none;  /* For Internet Explorer and Edge */
  &::-webkit-scrollbar {
    display: none;  /* For WebKit browsers */
  }
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
`;

const ProfileImage = styled.img`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  margin-right: 15px;
  margin-left: 15px;
`;

const ProfileDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProfileName = styled.span`
  font-family: Bold;
  font-size: 20px;
  color: var(--yellow);
`;

const ProfileRole = styled.span`
  font-family: Medium;
  color:var(--white);
`;

const ProfileEmail = styled.span`
  font-family: Light;
  color: var(--white);
  font-size: 12px;
`;

const SidebarLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 10px 15px;
  font-size: 16px;
  font-family: Medium;
  color: var(--yellow);
  text-decoration: none;
  transition: background 0.3s, color 0.3s;
  &:hover {
    background: var(--green);
    color: var(--white);
  }
`;

const SidebarIcon = styled.div`
  margin-right: 15px;
  svg {
    font-size: 1.5rem;
  }
`;

const SidebarText = styled.span`
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
`;

const Sidebar = () => {
  const  {auth}  = useAuth();

  return (
    <SidebarNav>
      <SidebarWrap>
      <ProfileSection>
          <ProfileImage src={Profile} alt="Profile" />
          <ProfileDetails>
            <ProfileName>{auth.user.first_name} {auth.user.last_name}</ProfileName>
            <ProfileRole>Alumni</ProfileRole>
            <ProfileEmail>{auth.user.email}</ProfileEmail>
          </ProfileDetails>
        </ProfileSection>
        <ScrollableSidebarWrap>
        {SidebarData.map((item, index) => (
          <SidebarLink to={item.path} key={index} className={item.cName}>
            <SidebarIcon dangerouslySetInnerHTML={{ __html: item.icon }} />
            <SidebarText>{item.title}</SidebarText>
          </SidebarLink>
        ))}
           </ScrollableSidebarWrap>
      </SidebarWrap>
    </SidebarNav>
  );
};

export default Sidebar;