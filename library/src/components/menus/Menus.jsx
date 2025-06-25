import React,{useState} from 'react';
import {Link} from 'react-router-dom';
import useAuth from "../../hooks/useAuth";
//import { jwtDecode } from 'jwt-decode';
import {FiAlignRight,FiXCircle,FiChevronDown } from "react-icons/fi";

export default function Menus() {
    const [isMenu, setisMenu] = useState(false);
    const [isResponsiveclose, setResponsiveclose] = useState(false);
    const { auth } = useAuth();
    const user= auth.user;
    const toggleClass = () => {
      setisMenu(isMenu === false ? true : false);
      setResponsiveclose(isResponsiveclose === false ? true : false);
  };

    let boxClass = ["main-menu menu-right menuq1"];
    if(isMenu) {
        boxClass.push('menuq2');
    }else{
        boxClass.push('');
    }

    const [isMenuSubMenu, setMenuSubMenu] = useState(false);
      
    const toggleSubmenu = () => {
      setMenuSubMenu(isMenuSubMenu === false ? true : false);
    };
    
    let boxClassSubMenu = ["sub__menus"];
    if(isMenuSubMenu) {
        boxClassSubMenu.push('sub__menus__Active');
    }else {
        boxClassSubMenu.push('');
    }
  return (
    <header className="header__middle">
        <div className="container">
            <div className="row">

                <div className="header__middle__menus">
                    <nav className="main-nav " >

                    {/* Responsive Menu Button */}
                    {isResponsiveclose === true ? <> 
                        <span className="menubar__button" style={{ display: 'none' }} onClick={toggleClass} > <FiXCircle />   </span>
                    </> : <> 
                        <span className="menubar__button" style={{ display: 'none' }} onClick={toggleClass} > <FiAlignRight />   </span>
                    </>}


                    <ul className={boxClass.join(' ')}>
                    <li  className="menu-item" >
                        <Link className='is-active' onClick={toggleClass} to={`/`}> Dashboard </Link> 
                    </li>
                    {user.is_superuser || user.is_librarian || user.is_crc || user.is_teacher ?
                        <>
                           {/* <li onClick={toggleSubmenu} className="menu-item sub__menus__arrows" > <Link to="#"> Attendance <FiChevronDown /> </Link>
                                <ul className={boxClassSubMenu.join(' ')} >
                                    <li><Link onClick={toggleClass} className='is-active' to={`/absenteeism`}>Absenteeism</Link> </li>
                                     <li> <Link onClick={toggleClass} className='is-active'  to={`/newattendace`}>Take Attendance </Link> </li> 
                                    <li><Link onClick={toggleClass} className='is-active' to={`/report`}> Report By Class</Link> </li>
                                    <li><Link onClick={toggleClass} className='is-active' to={`/greport`}>General Report </Link> </li>
                                    <li><Link onClick={toggleClass} className='is-active' to={`/schooltimetable`}> School TimeTable </Link> </li>
                                </ul>
                            </li>
                            <li onClick={toggleSubmenu} className="menu-item sub__menus__arrows" > <Link to="#"> EAP <FiChevronDown /> </Link>
                                <ul className={boxClassSubMenu.join(' ')} > 
                                    <li className="menu-item " ><Link onClick={toggleClass} className='is-active' to={`/eap`}> EAP Student </Link> </li>
                                    <li className="menu-item " ><Link onClick={toggleClass} className='is-active' to={`/eap-att`}> EAP Attendance </Link> </li>
                                    <li className="menu-item " ><Link onClick={toggleClass} className='is-active' to={`/eap-reports`}> EAP Report </Link> </li>
                                </ul>
                            </li> */}
                        </>:
                        <></>
                    }
                    {user.is_superuser || user.is_librarian || user.is_crc ?
                    <>
                        <li onClick={toggleSubmenu} className="menu-item sub__menus__arrows" > <Link to="#"> Books <FiChevronDown /> </Link>
                            <ul className={boxClassSubMenu.join(' ')} > 
                                <li> <Link onClick={toggleClass} className='is-active'  to={`/category`}> New Category </Link> </li>
                                <li><Link onClick={toggleClass} className='is-active' to={`/categories`}> Manage Categories </Link> </li>
                                <li> <Link onClick={toggleClass} className='is-active'  to={`/author`}> New Author </Link> </li>
                                <li><Link onClick={toggleClass} className='is-active' to={`/authors`}> Manage Authors </Link> </li>
                                <li> <Link onClick={toggleClass} className='is-active'  to={`/book`}> New Book </Link> </li>
                                <li><Link onClick={toggleClass} className='is-active' to={`/books`}> Manage Books </Link> </li>
                            </ul>
                        </li>
                        <li onClick={toggleSubmenu} className="menu-item sub__menus__arrows" > <Link to="#"> Issue <FiChevronDown /> </Link>
                            <ul className={boxClassSubMenu.join(' ')} > 
                                <li> <Link onClick={toggleClass} className='is-active'  to={`/issue`}> Issue Book </Link> </li>
                                <li><Link onClick={toggleClass} className='is-active' to={`/issued`}> Manage Issued Books </Link> </li>
                            </ul>
                        </li>
                        {/* <li onClick={toggleSubmenu} className="menu-item sub__menus__arrows" > <Link to="#"> School Info <FiChevronDown /> </Link>
                            <ul className={boxClassSubMenu.join(' ')} > 
                                <li> <Link onClick={toggleClass} className='is-active'  to={`/grade`}> New Grade </Link> </li>
                                <li><Link onClick={toggleClass} className='is-active' to={`/grades`}> Manage Grades </Link> </li>
                                <li> <Link onClick={toggleClass} className='is-active'  to={`/comb`}> New Combination </Link> </li>
                                <li><Link onClick={toggleClass} className='is-active' to={`/combs`}> Manage Combinations </Link> </li>
                            </ul>
                        </li> */}
                        <li onClick={toggleSubmenu} className="menu-item sub__menus__arrows" > <Link to="#"> Users <FiChevronDown /> </Link>
                            <ul className={boxClassSubMenu.join(' ')} > 
                                {/* <li> <Link onClick={toggleClass} className='is-active'  to={`/student`}> New Student </Link> </li> */}
                                <li><Link onClick={toggleClass} className='is-active' to={`/students`}> Manage Students </Link> </li>
                                {/* <li> <Link onClick={toggleClass} className='is-active'  to={`/staff`}> New Staff </Link> </li> */}
                                {/* <li><Link onClick={toggleClass} className='is-active' to={`/staffs`}> Manage Staff </Link> </li> */}
                            </ul>
                        </li>
                        <li onClick={toggleSubmenu} className="menu-item sub__menus__arrows" > <Link to="#"> Reports <FiChevronDown /> </Link>
                            <ul className={boxClassSubMenu.join(' ')} > 
                                <li> <Link onClick={toggleClass} className='is-active'  to={`/grstatistics`}> Library Books </Link> </li>
                                <li><Link onClick={toggleClass} className='is-active' to={`/fastatistics`}> E-Books </Link> </li>
                                <li><Link onClick={toggleClass} className='is-active' to={`/costatistics`}> Others </Link> </li>
                            </ul>
                        </li>
                    </>:
                    user.is_teacher || user.is_student ?
                        <>
                            <li className="menu-item " ><Link onClick={toggleClass} className='is-active' to={`/borrowed`}> Borrowed Books </Link> </li>
                            <li className="menu-item " ><Link onClick={toggleClass} className='is-active' to={`/boverdue`}> Overdue Books </Link> </li>
                        </>:
                                <>
                                
                                </>
                            
                        
                    }
                    { user.is_superuser ?
                            <>
                                {/* <li onClick={toggleSubmenu} className="menu-item sub__menus__arrows" > <Link to="#"> Uploads <FiChevronDown /> </Link>
                                    <ul className={boxClassSubMenu.join(' ')} > 
                                        <li className="menu-item " ><Link onClick={toggleClass} className='is-active' to={`/upbook`}> Upload Books </Link> </li>
                                        <li className="menu-item " ><Link onClick={toggleClass} className='is-active' to={`/upstudent`}> Upload Students </Link> </li>
                                        <li className="menu-item " ><Link onClick={toggleClass} className='is-active' to={`/upissue`}> Upload Issued Books </Link> </li>
                                    </ul>
                                </li> */}
                                {/* <li onClick={toggleSubmenu} className="menu-item sub__menus__arrows" > <Link to="#"> TimeTable <FiChevronDown /> </Link>
                                    <ul className={boxClassSubMenu.join(' ')} > 
                                        <li> <Link onClick={toggleClass} className='is-active'  to={`/timeslots`}> TimeSlots </Link> </li>
                                        <li> <Link onClick={toggleClass} className='is-active'  to={`/grade-timeslots`}> Link Grade & TimeSlots </Link> </li>
                                        <li> <Link onClick={toggleClass} className='is-active'  to={`/subjects`}> Subjects </Link> </li>
                                        <li> <Link onClick={toggleClass} className='is-active'  to={`/academics`}> Academics </Link> </li>
                                        <li> <Link onClick={toggleClass} className='is-active'  to={`/rooms`}> Rooms </Link> </li>
                                        <li><Link onClick={toggleClass} className='is-active' to={`/schooltimetable`}> School TimeTable </Link> </li>
                                    </ul>
                                </li> */}
                            </>:
                                <>
                                
                                </>}
                    
                    
                    <li className="menu-item " ><Link onClick={toggleClass} className='is-active' to={`/pass`}> Password </Link> </li>

                    </ul>


                    </nav>     
                </div> 
            </div>
	    </div>
    </header>
  )
}
