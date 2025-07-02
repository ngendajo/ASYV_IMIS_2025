import React, {useState, useEffect} from 'react'
import moment from 'moment';
import useAuth from "../hooks/useAuth";
import axios from "axios";
import { Link } from 'react-router-dom';
import baseUrl from "../api/baseUrl";
import { SiBookstack } from "react-icons/si";
import { MdLibraryBooks } from "react-icons/md";
import { PiStudentBold } from "react-icons/pi";
import { FaBookReader } from "react-icons/fa";
import { FaBookDead } from "react-icons/fa";
import MostBorrowerDisplay from "./pages/MostBorrowerDisplay";
//import TeacherDashBoard from "./TeacherDashBoard";

export default function LibrarianDashBoard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issuedate, setIssuedate] = useState(new Date());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  let {auth} = useAuth();

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIssuedate(new Date());
    }, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);
  useEffect(() =>{
    const getData = async () =>{
        try{
            const response = await axios.get(baseUrl+'/general/',{
                headers: {
                    "Authorization": 'Bearer ' + String(auth.accessToken),
                    "Content-Type": 'multipart/form-data'
                },
                withCredentials:true 
            });
            //console.log(response.data)
            setData(response.data);
            setLoading(false);
        }catch(err) {
            console.log(err);
            //navigate('/error');
        }
    }

    getData();

},[auth])
if (loading) {
  return <div>Loading...</div>;
}
if (!data.length) {
  return <div>No data available</div>;
}
  return (
    <center>
      <p>{moment(issuedate).format("Do MMMM YYYY, h:mm:ss a").toLocaleString()}</p>
      {/* <TeacherDashBoard/> */}
      <div className='general-report'>
        <div className='general-report-item-container'>
          <Link to={`/books`} className='general-report-item'>
            <div><SiBookstack className='libarryreports' /></div>
            <div><span className='books'>{data[0].nbook_types}</span> <span className='books-label'>Book Types</span></div>
          </Link>
        </div>
        <div className='general-report-item-container'>
          <Link to={`/books`} className='general-report-item'>
            <div><MdLibraryBooks  className='libarryreports' /></div>
            <div><span className='books'>{data[0].nbooks}</span> <span className='books-label'>Books</span></div>
          </Link>
        </div>
        <div className='general-report-item-container'>
          <Link to={`/students`} className='general-report-item'>
            <div><PiStudentBold  className='libarryreports' /></div>
            <div><span className='books'>{data[0].nstudents}</span> <span className='books-label'>Students</span></div>
          </Link>
        </div>
        <div className='general-report-item-container'>
          <Link to={`/issued`} className='general-report-item'>
            <div><FaBookReader  className='libarryreports' /></div>
            <div><span className='books'>{data[0].nissued_books}</span> <span className='books-label'>Issued Books</span></div>
          </Link>
        </div>
        <div className='general-report-item-container'>
          <Link to={`/overdue`} className='general-report-item'>
            <div><FaBookDead  className='libarryreports' /></div>
            <div><span className='books'>{data[0].noverdue_books}</span> <span className='books-label'>Overdue Books</span></div>
          </Link>
        </div>
      </div>
      <div className="borrowers">
        <form className='mostborrowers'>
          <label>
            Start Date:
            <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          </label>
          <label>
            End Date:
            <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
          </label>
        </form>
        <MostBorrowerDisplay start_date={startDate} end_date={endDate} />
      </div>
    </center>
  )
}
