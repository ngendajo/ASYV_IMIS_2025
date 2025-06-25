import React, {useState, useEffect} from 'react'
import moment from 'moment';
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import { Link } from 'react-router-dom';
import { BiEditAlt } from "react-icons/bi";
import baseUrl from "../../api/baseUrl";
import DynamicTable from "./dinamicTable/DynamicTable";
import { IoEye } from "react-icons/io5";
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

export default function Students() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingpdf, setLoadingpdf] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
    let {auth} = useAuth();

    useEffect(() => {
        const getData1 = async () => {
            try {
                const response = await axios.get(baseUrl + '/borrowers/', {
                    headers: {
                        "Authorization": 'Bearer ' + String(auth.accessToken),
                        "Content-Type": 'multipart/form-data'
                    },
                    withCredentials: true
                });
                //console.log(response.data);
                setFilteredData(response.data);
            } catch (err) {
                console.log(err);
                // navigate('/error');
            }
        };
    
        getData1();
    }, [auth]);
    
    useEffect(() => {
        const getData = async () => {
            try {
                const response = await axios.get(baseUrl + '/students/', {
                    headers: {
                        "Authorization": 'Bearer ' + String(auth.accessToken),
                        "Content-Type": 'multipart/form-data'
                    },
                    withCredentials: true
                });
                
                var studentlist = [];
                var i = 1;
                setLoading(false);
                response.data.forEach(async (student) => {
                    const studentBooks = filteredData
                        .filter(item => item.student_id === student.id)
                        .map((item, index) => ({
                            No: index + 1,
                            book_name: item.book_name,
                            isbnumber: item.isbnumber,
                            category_name: item.category_name,
                            author_name: item.author_name,
                            issuedate: item.issuedate === "Not yet Issued" ? "Not yet Issued" : moment(item.issuedate).format("Do MMMM YYYY, h:mm:ss a").toLocaleString(),
                            returndate: item.returndate === "Not yet Returned" ? "Not yet Returned" : moment(item.returndate).format("Do MMMM YYYY, h:mm:ss a").toLocaleString()
                        }))
                        .sort((a, b) => {
                            if (a.returndate === "Not yet Returned" && b.returndate !== "Not yet Returned") {
                                return -1; // 'a' comes first
                            } else if (a.returndate !== "Not yet Returned" && b.returndate === "Not yet Returned") {
                                return 1; // 'b' comes first
                            } else {
                                return 0; // no change in order
                            }
                        });

                    
                    studentlist.push({
                        No: i,
                        Books: <Popup
                                    trigger={<button><IoEye /></button>}
                                    position="right center"
                                    contentStyle={{ width: 'auto', maxWidth: 'fit-content' }} // Adjust the contentStyle to fit the content dynamically
                                >
                                    {studentBooks.length > 0 ?
                                        <DynamicTable mockdata={studentBooks} /> : <p>No books found</p>
                                    }
                                </Popup>,
                        Names: student.last_name + " " + student.first_name,
                        Reg_No: student.studentid,
                        Gender: student.gender,
                        Email: student.email,
                        Grade: student.grade_name,
                        Family: student.family_name,
                        Combination: student.combination_name,
                        Edit: <span>
                            <Link to={`/student/${student.id}`}><BiEditAlt className='icon' /></Link>
                        </span>
                    });
                    i++;
                });
                setData(studentlist);
            } catch (err) {
                console.log(err);
                // navigate('/error');
            }
        };
    
        getData();
    }, [auth, filteredData]);
    
    
    const studentReprtexcel = async () => {
        setLoadingpdf(true);
          const response = await fetch(`${baseUrl}/exportstudentexcel/`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + auth.accessToken,  // ensure auth.accessToken is valid
                    'Content-Type': 'application/json',
                }
                });
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
        
  return (
    <div>
     <center><h2 >List of Students <button className="prenext" onClick={studentReprtexcel} disabled={loadingpdf}>{loadingpdf ? 'Exporting...' : 'Export List of Students in Excel'}</button></h2></center> 
        {loading ? (
            <p>Loading...</p>
          ) : (
                <DynamicTable mockdata={data} /> 
          )
        }
    </div>
  )
}

