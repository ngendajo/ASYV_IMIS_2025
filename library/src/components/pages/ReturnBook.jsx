import React, {useState, useEffect} from 'react'
import { useParams } from "react-router-dom";
import moment from 'moment';
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import { Link,useNavigate } from 'react-router-dom';
import baseUrl from "../../api/baseUrl";

export default function ReturnBook() {
    const [data, setData] = useState([]);
    const navigate =useNavigate()
    const params = useParams();
    let {auth} = useAuth();
    const [returndate, setReturnedate] = useState(new Date());
   

    useEffect(() => {
      const intervalId = setInterval(() => {
        setReturnedate(new Date());
      }, 1000); // Update every second
      
        return () => clearInterval(intervalId); // Cleanup on unmount
    }, []);
  
    useEffect(() =>{
    
        const getData = async () =>{
            try{
                const response = await axios.get(baseUrl + '/issue-book-detail/' + params.id, {
                    headers: {
                        "Authorization": 'Bearer ' + String(auth.accessToken)
                    },
                    withCredentials: true 
                });
                console.log(response.data)
                setData(response.data.results);
            }catch(err) {
                console.log(err);
                //navigate('/error');
            }
        }
    
        getData();
    
    },[auth,params])
    const confirmreturn= async (id)=>{
      try{
        const response = await axios.patch(baseUrl+'/issue/'+id+"/",
            JSON.stringify({
              returndate:returndate
            }),
            {
                headers: { 
                  "Authorization": 'Bearer ' + String(auth.accessToken),
                  'Content-Type': 'application/json' },
                withCredentials:true
            }
            );
            alert("Book Returned Successfully")
            console.log(response.data)
            navigate("/issued")
    } catch(err) {
        console.log(err)
    }
    }
  return (
    <center className='formelement'>
      <h2 >Return a Book</h2>
      <h3>{moment(returndate).format("Do MMMM YYYY, h:mm:ss a")}</h3>
      {data && typeof data === 'object' ? (
  <div>
    <p><strong>Student: </strong>{data.first_name} {data.rwandan_name}</p>
    <p>
      <strong>From</strong> {data.grade_name} <strong>Grade</strong> {data.family_name} <strong>Family</strong> {data.combination_name} <strong>Class</strong>
    </p>
    <p>
      <strong>Book returned: </strong>{data.book_name} {data.author_name} <strong>Author, from</strong> {data.category_name} <strong>Category</strong>
    </p>
    <p><strong>Issued on </strong>{moment(data.issuedate).format("Do MMMM YYYY, h:mm:ss a")}</p>

    {data.returndate === "Not yet Returned" ? (
      <label htmlFor="loginbutton">
        <button onClick={() => confirmreturn(data.issue_id)} className='submitbuton'>
          Save Return a Book
        </button>
      </label>
    ) : (
      <p><strong>Returned on </strong>{moment(data.returndate).format("Do MMMM YYYY, h:mm:ss a")}</p>
    )}
  </div>
) : null}
    
        <label htmlFor="create new">
            <Link to="/issued" className="forgetpass">Go Back!</Link>
        </label> 
    </center>
  )
  }
