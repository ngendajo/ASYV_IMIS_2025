import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { SidebarDataAlu } from './dashboard-sidebar-data-alu.jsx';
import { SidebarDataCrc } from './dashboard-sidebar-data-crc.jsx';
import useAuth from '../../hooks/useAuth';
import ProfileImage from "./ProfileImage.jsx";
import baseUrl from "../../api/baseUrl";
import axios from "axios";

const ProfileName = styled.span`
  // font
  color: var(--orange);
  font-family: Medium;
  font-size: 18px;
  line-height: 1.2;
`;

const ProfileRole = styled.span`
  // font
  color:var(--white);
  font-family: Regular;
  font-size: 14px;
  // box
  margin-top: 5px;
`;

const ProfileContact = styled.span`
  // font
  color: var(--white);
  font-family: Light;
  font-size: 12px;
`;

const navTextStyles = css`
  // font
  color: var(--orange);
  font-family: Medium;
  font-size: 18px;
  // box
  padding: 8px 30px;
`;

const navSubTextStyles = css`
  // font
  color: var(--white);
  font-family: Regular;
  font-size: 16px;
  // box
  padding: 7px 40px;
`;

const SidebarLink = styled(Link)`
  // display
  display: flex;
  align-items: center;
  // font
  text-decoration: none;
  transition: 0.1s;
  /*
  &:hover {
    ${(props) =>
      props.cName === 'nav-text' &&
      css`
        background: var(--green);
        color: var(--orange);
      `}
  }
  &:hover {
    ${(props) =>
      props.cName === 'nav-sub-text' &&
      css`
        background: var(--green);
        color: var(--white);
      `}
  }
  */
  &.active{
    // font
    background: var(--green);
    color: var(--white);
  }
  ${(props) =>
    props.cName === 'nav-text' && css`
      ${navTextStyles};
    `}

  ${(props) =>
    props.cName === 'nav-sub-text' && css`
      ${navSubTextStyles};
    `}
`;

const SubMenu = styled.div`
  // display
  display: ${(props) => (props.isOpen ? 'block' : 'none')};
`;

const ArrowIcon = styled.span`
  // display
  font-size: 18px;
  transition: transform 0.3s;
  transform: ${(props) => (props.isOpen ? 'rotate(90deg)' : 'rotate(0deg)')};
  // box
  margin-left: auto;
`;

const Sidebar = ({ className }) => {
  const {auth} = useAuth();
  const location = useLocation();
  const [openSubNav, setOpenSubNav] = useState([]);
  const [errMsg, setErrMsg] = useState('');
  const [msg, setMsg] = useState("");
  const [user, setUser] = useState([]);

  useEffect(() => {
    const dashboardItem = SidebarDataAlu.find(item => item.path === '/');
    if (dashboardItem) {
      const dashboardIndex = SidebarDataAlu.indexOf(dashboardItem);
      setOpenSubNav([dashboardIndex]);
    }
  }, []);

  useEffect(() => {
    const dashboardItem = SidebarDataCrc.find(item => item.path === '/');
    if (dashboardItem) {
      const dashboardIndex = SidebarDataCrc.indexOf(dashboardItem);
      setOpenSubNav([dashboardIndex]);
    }
  }, []);
  const getUsers = async () => {
    try {
      const response = await axios.get(baseUrl + '/users/?id=' + auth.user.id, {
        headers: {
          "Authorization": 'Bearer ' + String(auth.accessToken),
          "Content-Type": 'multipart/form-data'
        },
        withCredentials: true
      });
      setUser(response.data);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    getUsers();
  }, [auth]);

  const handleSubNavToggle = (index) => {
    setOpenSubNav((prevState) => {
      const isCurrentlyOpen = prevState.includes(index);
      if (isCurrentlyOpen) {
        return prevState.filter((item) => item !== index);
      } else {
        return [...prevState, index];
      }
    });
  };

  const isSubNavOpen = (index) => openSubNav.includes(index);
  //console.log(auth.user)

 
  const onEdit = async (formData) => {
    try {
      // Perform the image upload request
      await axios.post(
        `${baseUrl}/updateuserimage/${auth.user.id}`,
        formData,
        {
          headers: {
            "Authorization": `Bearer ${auth.accessToken}`,
            "Content-Type": 'multipart/form-data',
          },
          withCredentials: true,
        }
      );
      getUsers();
      setMsg("Image updated successfully");
    } catch (error) {
      // Handle errors
      if (!error.response) {
        setMsg('No Server Response');
      } else if (error.response.status === 404) {
        setMsg('Problem with saving');
      } else {
        setMsg(`Update image failed: ${error.message}`);
      }
      
    }
  };
  

return (
  <div className={`Sidebar ${className || ""}`}>
      <div className="SidebarWrap">
        <div className="Profile">
        {/* {user.map((use, i) =>
            //<img src={baseUrlforImg + use?.image_url} alt="Profile" />
            <ProfileImage user={use} onEdit={handleEditProfile} />
        )} */}
           {user && (
        <>
          <ProfileImage user={user} onEdit={onEdit} />
          {/* Other sidebar content */}
        </>
      )}
          <div className="ProfileText">
            <ProfileName>{auth.user.first_name}</ProfileName>
            {auth.user.is_alumni && <ProfileRole>Alumni</ProfileRole>}
            {auth.user.is_crc && <ProfileRole>CRC Staff</ProfileRole>}
            {auth.user.is_superuser && <ProfileRole>Super User</ProfileRole>}
            <ProfileContact>{auth.user.email}</ProfileContact>
            <ProfileContact>{auth.user.phone1}</ProfileContact>
            <ProfileContact>{msg}</ProfileContact>
            <ProfileContact>{errMsg}</ProfileContact>
          </div>
        </div>
        <div className="Content">
          {auth.user.is_alumni && (
          SidebarDataAlu.map((item, index) => (
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
          )))}
          {(auth.user.is_crc || auth.user.is_superuser) && (
          SidebarDataCrc.map((item, index) => (
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
          )))}
        </div>
      </div>
    </div>
);
};

export default Sidebar;