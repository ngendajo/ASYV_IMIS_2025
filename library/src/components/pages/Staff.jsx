import axios from "axios";
import {React,useState} from "react";
import useAuth from "../../hooks/useAuth";
import { Link,useNavigate } from "react-router-dom";
import baseUrl from "../../api/baseUrl";

export default function Staff() {
  const {auth} = useAuth();
  const navigate =useNavigate()
  const [email, setEmail] = useState('');
  const [first_name, setFirst_name] = useState('');
  const [last_name, setLast_name] = useState('');
  const roles = [{'title':'librarian'},{'title':'teacher'}];
  const [role, setRole] = useState('');
  const [phone1, setPhone1] = useState('')
 
let handleSubmit = (e )=> {
  e.preventDefault()
  axios.post(baseUrl+'/bulkeducator/', {
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
  alert(res.data.first_name+" created successfully")
  navigate('/staffs')
})
.catch(error => alert(error.response.data))
  
}
  return (
    <div className="loginform">
        <h2>Add a new Staff Form</h2>
        
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

