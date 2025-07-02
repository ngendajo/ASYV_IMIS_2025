import React, {useState, useEffect} from 'react'
import moment from 'moment';
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import { Link } from 'react-router-dom';
import { BiEditAlt } from "react-icons/bi";
import baseUrl from "../../api/baseUrl";
import DynamicTable from "./dinamicTable/DynamicTable";

export default function OverdueBooks() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingpdf, setLoadingpdf] = useState(false);
    
    let {auth} = useAuth();
  
    useEffect(() =>{
        const getData = async () =>{
            try{
                const response = await axios.get(baseUrl+'/issued/',{
                    headers: {
                        "Authorization": 'Bearer ' + String(auth.accessToken),
                        "Content-Type": 'multipart/form-data'
                    },
                    withCredentials:true 
                });
                //console.log(response.data)
                setLoading(false);
                var booklist=[]
                response.data.forEach(e=>{
                    var currentDate = new Date();
                    var targetDate = new Date(e.issuedate);

                    var differenceInTime = currentDate.getTime()- targetDate.getTime();
                    var differenceInDays = Math.round(differenceInTime / (1000 * 3600 * 24));
                    console.log(differenceInDays)
                    if(differenceInDays>30){
                        booklist.push({
                            Student_ID:e.studentid,
                            Name:e.last_name+' '+e.first_name+" ("+ e.grade_name+", "+e.family_name+", "+e.combination_name+")",
                            Email:e.email,
                            Book_name:e.book_name,
                            ISBNumber:e.isbnumber,
                            Category:e.category_name,
                            Author:e.author_name,
                            "Book Number":e.library_number,
                            "Issue Date":moment(e.issuedate).format("Do MMMM YYYY, h:mm:ss a"),
                            "Overdue Days":differenceInDays,
                            Edit:<span>
                                <Link to={`/issue/${e.id}`}><BiEditAlt className='icon'/></Link>
                            </span>
                        })
                    }
                    
                })
                setData(booklist);
            }catch(err) {
                console.log(err);
                //navigate('/error');
            }
        }
    
        getData();
    
    },[auth])
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
  return (
    <div>
      <center><h2 >Overdue Books <button className="prenext" onClick={overduebookReprtpdf} disabled={loadingpdf}>{loadingpdf ? 'Exporting...' : 'Export Overdue Books in PDF'}</button></h2></center>
      {loading ? (
          <p>Loading...</p>
        ) : (
              <DynamicTable mockdata={data} /> 
        )
      }
    </div>
  )
  }
