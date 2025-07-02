import useAuth from "../hooks/useAuth";
//import { jwtDecode } from 'jwt-decode';
import { useState, useEffect } from "react";
import Header from '../components/Header/Header';

import { Outlet } from 'react-router-dom';
import Menus from './menus/Menus';
import Footer from "./Footer";

const MainDashboard = () => {
  const [title, setTitle] = useState("");
  const { auth } = useAuth();
  const user= auth.user; 
  //console.log(user)
  useEffect(() => {
    if (user.is_superuser){
      setTitle("LMS-Admin")
    }
    else if(user.is_librarian){
      setTitle("LMS-Librarian")
    }
    else if(user.is_teacher){
      setTitle("LMS-Teacher")
    }
    else if(user.is_student){
      setTitle("LMS-Student")
    }
    else {
      setTitle("LMS-Visitor")
    }
      document.title = title;
      }, [title,user]);
  return (
    <div className='dashboard'> 
        <Header/>
        <Menus/>
          <div className='mainbody'>
            <Outlet/>
          </div>
          <Footer/>
       
    </div>
  )
}

export default MainDashboard