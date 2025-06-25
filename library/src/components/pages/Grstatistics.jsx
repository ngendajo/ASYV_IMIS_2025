import React, {useState, useEffect} from 'react'
import moment from 'moment';
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import { Link } from 'react-router-dom';
import baseUrl from "../../api/baseUrl";
import { MdLibraryBooks } from "react-icons/md";
import { PiStudentBold } from "react-icons/pi";
import { FaBookReader } from "react-icons/fa";
import { FaBookDead } from "react-icons/fa";

export default function Grstatistics() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [issuedate, setIssuedate] = useState(new Date());
    const [loadingpdf, setLoadingpdf] = useState(false);
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
  const issuedbookReprtpdf = async () => {
    setLoadingpdf(true);
    try {
      const response = await axios.get(baseUrl + '/exportissued/', {
        headers: {
          "Authorization": 'Bearer ' + String(auth.accessToken),
          "Content-Type": 'application/pdf', // Set correct content type
        },
        responseType: 'blob', // Set response type to blob
        withCredentials: true
      });
  
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'list_of_Issued_books.pdf');
      document.body.appendChild(link);
      link.click();
      setLoadingpdf(false);
    } catch (err) {
      console.error('Error exporting issued books:', err);
      setLoadingpdf(false);
    }
  }
  const overduebookReprtpdf = async () => {
    setLoadingpdf(true);
    try {
      const response = await axios.get(baseUrl + '/exportoverdue/', {
        headers: {
          "Authorization": 'Bearer ' + String(auth.accessToken),
          "Content-Type": 'application/pdf', // Set correct content type
        },
        responseType: 'blob', // Set response type to blob
        withCredentials: true
      });
  
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'list_of_Overdue_books.pdf');
      document.body.appendChild(link);
      link.click();
      setLoadingpdf(false);
    } catch (err) {
      console.error('Error exporting issued books:', err);
      setLoadingpdf(false);
    }
  }
  const bookReprtpdf = async () => {
    setLoadingpdf(true);
    try {
      const response = await axios.get(baseUrl + '/exportbooks/', {
        headers: {
          "Authorization": 'Bearer ' + String(auth.accessToken),
          "Content-Type": 'application/pdf', // Set correct content type
        },
        responseType: 'blob', // Set response type to blob
        withCredentials: true
      });
  
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'list_of_books.pdf');
      document.body.appendChild(link);
      link.click();
      setLoadingpdf(false);
    } catch (err) {
      console.error('Error exporting books:', err);
      setLoadingpdf(false);
    }
  }
  const studentReprtexcel = async () => {
    setLoadingpdf(true);
      const response = await fetch(`${baseUrl}/exportstudentexcel/`);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'LFHS_students_data.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setLoadingpdf(false);
    };
    const issuedbookPerClassReprtexcel = async () => {
      setLoadingpdf(true);
        const response = await fetch(`${baseUrl}/library/book-export/`);
        const blob = await response.blob();
  
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'LFHS_Issued_Books_to_students_per_class_data.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setLoadingpdf(false);
      };
    const issuedbookReprtexcel = async () => {
      setLoadingpdf(true);
        const response = await fetch(`${baseUrl}/exportissuedexcel/`);
        const blob = await response.blob();
  
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'LFHS_Issued_Books_to_students_data.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setLoadingpdf(false);
      };
  if (loading) {
    return <div>Loading...</div>;
  }
  if (!data.length) {
    return <div>No data available</div>;
  }
  return (
    <center>
      <p>{moment(issuedate).format("Do MMMM YYYY, h:mm:ss a").toLocaleString()}</p>
      <div className='general-report'>
        
        <div className='general-report-item-container'>
          <Link to={`#`} className='general-report-item'>
            <div><MdLibraryBooks  className='libarryreports' /></div>
            <div><span className='books'>{data[0].nbooks}</span> <span className='books-label'>Books</span></div>
            <button className="prenext" onClick={bookReprtpdf} disabled={loadingpdf}>{loadingpdf ? 'Exporting...' : 'Export Books in PDF'}</button>
          </Link>
        </div>
        <div className='general-report-item-container'>
          <Link to={`#`} className='general-report-item'>
            <div><PiStudentBold  className='libarryreports' /></div>
            <div><span className='books'>{data[0].nstudents}</span> <span className='books-label'>Students</span></div>
            <button className="prenext" onClick={studentReprtexcel} disabled={loadingpdf}>{loadingpdf ? 'Exporting...' : 'Export List of Students in Excel'}</button>
          </Link>
        </div>
        <div className='general-report-item-container'>
          <Link to={`#`} className='general-report-item'>
            <div><FaBookReader  className='libarryreports' /></div>
            <div><span className='books'>{data[0].nissued_books}</span> <span className='books-label'>Issued Books</span></div>
            <button className="prenext" onClick={issuedbookReprtpdf} disabled={loadingpdf}>{loadingpdf ? 'Exporting...' : 'Export issued Books in PDF'}</button>
          </Link>
        </div>
        <div className='general-report-item-container'>
          <Link to={`#`} className='general-report-item'>
            <div><FaBookReader  className='libarryreports' /></div>
            <div><span className='books'>{data[0].nissued_books}</span> <span className='books-label'>Issued Books</span></div>
            <button className="prenext" onClick={issuedbookReprtexcel} disabled={loadingpdf}>{loadingpdf ? 'Exporting...' : 'Export issued books to Students in Excel'}</button>
          </Link>
        </div>
        <div className='general-report-item-container'>
          <Link to={`#`} className='general-report-item'>
            <div><FaBookReader  className='libarryreports' /></div>
            <div><span className='books'>{data[0].nissued_books}</span> <span className='books-label'>Issued Books</span></div>
            <button className="prenext" onClick={issuedbookPerClassReprtexcel} disabled={loadingpdf}>{loadingpdf ? 'Exporting...' : 'Export issued books to Students per Class in Excel'}</button>
          </Link>
        </div>
        <div className='general-report-item-container'>
          <Link to={`#`} className='general-report-item'>
            <div><FaBookDead  className='libarryreports' /></div>
            <div><span className='books'>{data[0].noverdue_books}</span> <span className='books-label'>Overdue Books</span></div>
            <button className="prenext" onClick={overduebookReprtpdf} disabled={loadingpdf}>{loadingpdf ? 'Exporting...' : 'Export Overdue Books in PDF'}</button>
          </Link>
        </div>
      </div>
    </center>
  )
}
