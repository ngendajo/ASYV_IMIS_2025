

import {useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

//import React from "react";

const AuthCheck = ({ allowedRoles }) => {
  const { auth } = useAuth();
  const location = useLocation();
  console.log(auth.roles)
  return allowedRoles.find((role) => auth.roles.includes(role)) ? (
    <Outlet />
  ) : auth?.user ? (
    <Navigate to="/unauthorized" state={{ from: location }} replace />
  ) : (
    <Navigate to="/home" state={{ from: location }} replace />
  );
};

export default AuthCheck;