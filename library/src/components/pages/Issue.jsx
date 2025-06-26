import axios from "axios";
import {React,useState, useEffect} from "react";
import moment from 'moment';
import useAuth from "../../hooks/useAuth";
import { Link,useNavigate } from "react-router-dom";
import baseUrl from "../../api/baseUrl";

export default function Issue() {
  const {auth} = useAuth();
  const navigate =useNavigate()
  const [bookid, setBookid] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [library_number, setLibrary_number] = useState('');
  const [library_numberOptions, setLibrary_numberOptions] = useState('');
   const [book_name, setBook_name] = useState('');
   const [studentid, setStudentid] = useState('')
   const [isbnumber, setIsbnumber] = useState('')
   const [issuedate, setIssuedate] = useState(new Date());
   

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIssuedate(new Date());
    }, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);
  
    const getstudent = async (id) =>{
      setStudentid(id)
        try{
            const response = await axios.get(baseUrl+'/kid-books/'+id+'/',{
                headers: {
                    "Authorization": 'Bearer ' + String(auth.accessToken),
                    "Content-Type": 'multipart/form-data'
                },
                withCredentials:true 
            });
            //console.log(response.data)
            if(id!==""){
              setFilteredData(response.data)
            }else{
              setFilteredData([])
            }
            
        }catch(err) {
            console.log(err);
            //navigate('/error');
        }
    }

  /* function getstudent(id){
    setStudentid(id)
    if (Array.isArray(data)) {
      let da = data.filter((item) => {
        // Check if student_info exists and studentid is not null
        if (item.student_info && item.student_info.studentid) {
          return item.student_info.studentid.includes(id);
        }
        return false; // Exclude items without student_info or studentid
      });
    
      if (da.length > 0) {
        setFilteredData(da);
      } else {
        setFilteredData([]);
      }
    } else {
      // Handle the case where data is not an array
      console.error("Data is not an array.");
    }
    
  }
  console.log(data) */
 
  const getbook = async (id) =>{
    
    setIsbnumber(id);
    try{
        const response = await axios.get(baseUrl+'/book/?isbnumber='+id,{
            headers: {
                "Authorization": 'Bearer ' + String(auth.accessToken),
                "Content-Type": 'multipart/form-data'
            },
            withCredentials:true
        });
        const response2 = await axios.get(baseUrl + '/issue/?book__isbnumber=' + id, {
            headers: {
                "Authorization": 'Bearer ' + String(auth.accessToken)
            },
            withCredentials: true
        });
        var library_numbers_list=[]
        response2.data.results.forEach(e=>{
          if(e.returndate==="Not yet Returned"){
            library_numbers_list.push(e.library_number)
          }
      })
      console.log(library_numbers_list)
        let data=response.data;
        if (data && data.length > 0) {
            setBookid(data[0].id);
            setBook_name(data[0].book_name);
            setLibrary_numberOptions((Array.from({ length: data[0].number_of_books }, (_, index) => index + 1)).filter(item => !((library_numbers_list).map(item => parseInt(item, 10))).includes(item)))

          } else {
            setBookid('');
            setBook_name('');
            setLibrary_numberOptions([])
            console.log("No data")// Handle the case when data is undefined or empty
          }
    }catch(err) {
        console.log(err);
        //navigate('/error');
    }
}
  let handleSubmit = (e )=> {
    e.preventDefault() 
    if(bookid==="" || e.target.borrower.value==="" || library_number==="" || issuedate===""){
      alert("There is a problem")
    }else{
      
      axios.post(baseUrl+'/issue/', {
        'book':bookid,
        'borrower':e.target.borrower.value,
        'library_number':library_number,
        'issuedate':issuedate,
        'returndate':"Not yet Returned"
      },
      {
          headers: {
              "Authorization": 'Bearer ' + String(auth.accessToken),
              "Content-Type": 'application/json'
          }
      }
    )
    .then(res =>{
      alert("Book Issued successfully")
      navigate('/issued') 
    })
    .catch(error => alert(error.response.data))
      }
  }
  return (
    <div className="loginform">
        <h2>Issue a new Book Form</h2>
        <p>Current Date and Time: {moment(issuedate).format("Do MMMM YYYY, h:mm:ss a").toLocaleString()}</p>
        <form className='formelement' onSubmit={handleSubmit}>
          <label htmlFor="book">Enter Student ID</label>
          <input 
            className='credentials' 
            type="text"
            id="studentid"
            autoComplete="off" 
            onBlur={(e) => getstudent(e.target.value)}
            required
          />
          <span>
            {studentid!=="" && filteredData.length>0?
            <>
            {filteredData.map((student) => (
              <span key={student.user_id}>
                <label>
                  {student.first_name} {student.rwandan_name}, Student ID: {student.reg_number},  From {student.grade_name} Grade, {student.family_name} Family, {student.combination_name} Class
                  <input type="hidden" name="borrower" value={student.user_id}/>
                </label>
                <label className="invalid">Number of Books you have :{student.no_books}</label>
                {(student.no_books)>0?
                    (
                      <span className="invalid">
                        {student.issued_books.map((borr, index) => (
                            <span key={index}>
                              {index + 1}. {borr.book_name}, ISB:{borr.isbnumber}, library number:{borr.library_number}, Issued Date:{moment(borr.issuedate).format("Do MMMM YYYY, h:mm:ss a")}, No. day(s) pass:{Math.floor((issuedate.getTime() - new Date(borr.issuedate).getTime()) / (1000 * 60 * 60 * 24))}  <br/>
                            </span>
                          ))}
                      </span>
                    ) : (
                      <></>
                    )
                }
                {(student.no_books)>1?
                      <span className="invalid">You have <strong>two or more books</strong>. You are not allowed to borrow another book. </span>:
                      <>
                       {(student.issued_books.filter(
                      (borr) =>(Math.floor((issuedate.getTime() - new Date(borr.issuedate).getTime()) / (1000 * 60 * 60 * 24)))>28 
                    ).length)>0?
                    <span className="invalid">
                      You have overdue books
                    </span>:
                    <>
                     <label>
                          Enter a Valid ISB Number
                        </label>
                        <input 
                          className='credentials' 
                          type="text"
                          id="book"
                          autoComplete="off" 
                          onBlur={(e) => getbook(e.target.value)}
                          required
                        />
                        <p></p>
                        {isbnumber===""?
                        <p className="invalid">Enter SSBNumber</p>:
                        <>
                          {library_numberOptions.length>0?
                          <>
                          <span>{book_name},<br/> ISB Nmuber: {isbnumber}</span><br/>
                          <select className='credentials'  value={library_number} onChange={(e) => setLibrary_number(e.target.value)}>
                          <option value="" disabled>select Book Number</option>
                            {library_numberOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                          </select>
                          </>
                          :
                          <>
                          {book_name===""?
                            <span className="invalid">There is no that book in the database</span>:
                            <span className="invalid">The books in the library have been exhausted; they have all been borrowed.</span> 
                          }
                            
                          </>
                          }
                        </>
                        }
                    </>
                  
                    }
                      </>
                    }
              </span>
            ))}
            </>:<p className="invalid">
              Enter a Valid student ID
            </p>
            }
        </span>
            {(bookid==="" || library_number==="" || issuedate==="")?
            <></>:
            <label htmlFor="loginbutton">
              <button className='submitbuton'>Save</button> 
          </label>
            }
          
          <label htmlFor="create new"> 
            <Link to="/issued" className="forgetpass">Go Back!</Link>
          </label>
    
        </form>
       </div>
  )
}

