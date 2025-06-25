import axios from "axios";
import {React,useState, useEffect} from "react";
import useAuth from "../../hooks/useAuth";
import { Link,useNavigate } from "react-router-dom";
import baseUrl from "../../api/baseUrl";

export default function Student() {
  const {auth} = useAuth();
  const navigate =useNavigate()
  const [first_name, setFirst_name] = useState('');
  const [last_name, setLast_name] = useState('');
  const [email, setEmail] = useState('');
  const [studentid, setStudentid] = useState('');
  const [combinations, setCombinations] = useState([]);
  const [combination, setCombination] = useState('');
  let [grades, setGrades] = useState([]);
  let [families, setFamilies] = useState([]);
  let [family, setFamily] = useState('');
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() =>{
    
      const getData = async () =>{
          try{
              const response = await axios.get(baseUrl+'/bulkstudent/',{
                  headers: {
                      "Authorization": 'Bearer ' + String(auth.accessToken),
                      "Content-Type": 'multipart/form-data'
                  },
                  withCredentials:true 
              });
            
              setData(response.data);
          }catch(err) {
              console.log(err);
              //navigate('/error');
          }
      }

      getData();

  },[auth])


  useEffect(() =>{
    
    const getgrades = async () =>{
        try{
            const response = await axios.get(baseUrl+'/grades/',{
                headers: {
                    "Authorization": 'Bearer ' + String(auth.accessToken),
                    "Content-Type": 'multipart/form-data'
                },
                withCredentials:true
            });
            setGrades(response.data)
        }catch(err) {
            console.log(err);
        }
    }

    getgrades();

},[auth])
const getfamilies = (event) => {
    const id = event.target.value;
    grades.forEach((grade)=>{
        if(parseInt(grade.id,10) === parseInt(id,10)){
            setFamilies(grade.families);
        }
    })
    
}


  useEffect(() =>{

    const getcombinations = async () =>{
        try{
            const response = await axios.get(baseUrl+'/combination/',{
                headers: {
                    "Authorization": 'Bearer ' + String(auth.accessToken),
                    "Content-Type": 'multipart/form-data'
                },
                withCredentials:true
            });
            setCombinations(response.data);
        }catch(err) {
            console.log(err);
        }
    }
  
    getcombinations();
  
  },[auth])

  
let handleSubmit = (e )=> {
  e.preventDefault()
  axios.post(baseUrl+'/bulkstudent/', {
    "email": email, 
    "first_name": first_name, 
    "last_name": last_name, 
    "password": "Amahoro@1", 
    "phone1":studentid,
    "family_id":family, 
    "studentid":studentid, 
    "combination":combination
  },
  {
      headers: {
          "Authorization": 'Bearer ' + String(auth.accessToken),
          "Content-Type": 'application/json'
      }
  }
)
.then(res =>{
  alert(res.data.first_name+" created successfully")
  navigate('/students') 
})
.catch(error => alert(error.response.data))
  
}
function checkStudentid(id){
  setStudentid(id)
  setFilteredData(data.filter((item) => {
    // Check if student_info exists and studentid is not null
    if (item.studentid) {
      return item.studentid.includes(id);
    }
    return false; // Exclude items without student_info or studentid
  }))
}
  return (
    <div className="loginform">
        <h2>Add a new Student Form</h2>
        
        <form className='formelement' onSubmit={handleSubmit}>
          <label htmlFor="email">Enter Email</label>
          <input 
            className='credentials' 
            type="text"
            id="email"
            autoComplete="off" 
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />
          <label htmlFor="first_name">Enter First Name</label>
          <input 
            className='credentials' 
            type="text"
            id="first_name"
            autoComplete="off" 
            onChange={(e) => setFirst_name(e.target.value)}
            value={first_name}
            required
          /><label htmlFor="last_name">Enter Last Name</label>
          <input 
            className='credentials' 
            type="text"
            id="last_name"
            autoComplete="off" 
            onChange={(e) => setLast_name(e.target.value)}
            value={last_name}
            required
          />
          <label htmlFor="studentid">Enter Student Id</label>
          <input 
            className='credentials' 
            type="text"
            id="studentid"
            autoComplete="off" 
            onChange={(e) => checkStudentid(e.target.value)}
            value={studentid}
            required
          />
          {filteredData.length>0 && studentid!==""?
            <p className="invalid">
              {filteredData.map((st,index)=>(
                <span key={index}>{st.user.first_name} {st.user.last_name}, exist with the same ID:{st.studentid}.</span>
              ))}
            </p>:
            <>
              {studentid===""?
                <p className="invalid">
                Enter Student ID
                </p>:
                <>
                  <label htmlFor="combination">
                    Combination
                  </label>
                  
                  <select className='credentials'  name='combination'value={combination} onChange={(e) => setCombination(e.target.value)}>
                      <option value="" disabled>select combination</option>
                          {combinations.map((e,ind) => {
                        return  <option key={ind} value={e.id}>{e.combination_name}</option>
                          })}
                  </select>
                  <label htmlFor="grade">Grade</label>     
                  <select className='credentials' name="grade" onChange={getfamilies}>
                    <option value="">select grade</option>
                      {grades.map((e,ind) => {
                          return  <option key={ind} value={e.id}>{e.grade_name}</option>
                      })}               
                  </select>
                  <label htmlFor="family">Family </label>      
                  <select className='credentials' name="family"value={family} onChange={(e) => setFamily(e.target.value)}>
                    <option value="" disabled>Select your family</option>
                      {families.map((e,ind) => {
                          return  <option key={ind} value={e.id}>{e.family_name}</option>
                      })}               
                  </select> 

                  <label htmlFor="loginbutton">
                    <button className='submitbuton'>Save</button> 
                  </label>
                </>
                
              }
            </>
          }
          
          <label htmlFor="create new"> 
            <Link to="/students" className="forgetpass">Go Back!</Link>
          </label>
    
        </form>
       </div>
  )
}
