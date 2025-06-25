import axios from "axios";
import {React,useState, useEffect} from "react";
import { useParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { Link,useNavigate } from "react-router-dom";
import baseUrl from "../../api/baseUrl";

export default function EditStaff() {
    const {auth} = useAuth();
    const navigate =useNavigate()
    const params = useParams();
    const [email, setEmail] = useState('');
    const [first_name, setFirst_name] = useState('');
    const [last_name, setLast_name] = useState('');
    const roles = [{'title':'librarian'},{'title':'teacher'}];
    const [role, setRole] = useState('');
    const [phone1, setPhone1] = useState('')

    useEffect(() =>{
    
        const getstaff = async () =>{
            try{
                const response = await axios.get(baseUrl+'/bulkeducator/?id='+params.id,{
                    headers: {
                        "Authorization": 'Bearer ' + String(auth.accessToken),
                        "Content-Type": 'multipart/form-data'
                    },
                    withCredentials:true
                });
                let data=response.data;
                if (data && data.length > 0) {
                    setEmail(data[0].email);
                    setFirst_name(data[0].first_name);
                    setLast_name(data[0].last_name);
                    setPhone1(data[0].phone1);
                    setRole(data[0].is_librarian?"librarian":"teacher");
                  } else {
                    console.log("No data")// Handle the case when data is undefined or empty
                  }
            }catch(err) {
                console.log(err);
                //navigate('/error');
            }
        }
    
        getstaff();
    
    },[auth,params])
  
    
  let handleSubmit = (e )=> {
    e.preventDefault()
    axios.put(baseUrl+'/bulkeducator/'+params.id+"/", {
      'email':email,
      'first_name':first_name,
      'last_name':last_name,
      'password':"Amahoro@1",
      'phone1':phone1,
      'role':role
    },
    {
        headers: {
            "Authorization": 'Bearer ' + String(auth.accessToken),
            "Content-Type": 'application/json'
        }
    }
  )
  .then(res =>{
    alert(res.data.first_name+" updated successfully")
    navigate('/staffs')
  })
  .catch(error => alert(error.response.data))
    
  }
 
    return (
      <div className="loginform">
        
        <h2>Update a Faff Form</h2>
        
        <form className='formelement' onSubmit={handleSubmit}>
        <label htmlFor="email">Enter Email</label>
        <input 
          className='credentials' 
          type="email"
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
        />
        <label htmlFor="last_name">Enter Last Name</label>
        <input 
          className='credentials' 
          type="text"
          id="last_name"
          autoComplete="off" 
          onChange={(e) => setLast_name(e.target.value)}
          value={last_name}
          required
        />
        <label htmlFor="phone1">Enter Phone Number</label>
        <input 
          className='credentials' 
          type="text"
          id="phone1"
          autoComplete="off" 
          onChange={(e) => setPhone1(e.target.value)}
          value={phone1}
          required
        />
        <label htmlFor="role">
                  Role
        </label>
        
        <select className='credentials'  name='role'value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="" disabled>select role</option>
                {roles.map((e,ind) => {
              return  <option key={ind} value={e.title}>{e.title}</option>
                })}
        </select>

        <label htmlFor="loginbutton">
          <button className='submitbuton'>Save</button> 
        </label>
        <label htmlFor="create new"> 
          <Link to="/staffs" className="forgetpass">Go Back!</Link>
        </label>
  
      </form>
    </div>
    )
  }