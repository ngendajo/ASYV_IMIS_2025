import axios from "axios";
import { React,useState } from "react"
import useAuth from "../../hooks/useAuth";
import { Link,useNavigate } from "react-router-dom";
import baseUrl from "../../api/baseUrl";

export default function Comb() {
  const {auth} = useAuth();
  const navigate =useNavigate()
  const [comb, setComb] = useState('');
  
let handleSubmit = (e )=> {
  e.preventDefault()
  axios.post(baseUrl+'/combination/', {
      'combination_name':comb,
  },
  {
      headers: {
          "Authorization": 'Bearer ' + String(auth.accessToken),
          "Content-Type": 'application/json'
      }
  }
)
.then(res =>{
  alert(res.data.combination_name+" created successfully")
  navigate('/combs')
})
.catch(error => alert(error.response.data))
  
}
  return (
    <div className="loginform">
        <h2>Add a new Combination form</h2>
        
        <form className='formelement' onSubmit={handleSubmit}>
          <label htmlFor="comb">Enter Combination Name</label>
          <input 
            className='credentials' 
            type="text"
            id="comb"
            autoComplete="off"
            onChange={(e) => setComb(e.target.value)}
            value={comb}
            required
          />
                <label htmlFor="loginbutton">
                  <button className='submitbuton'>Save</button> 
                </label>
                <label htmlFor="create new">
                  <Link to="/combs" className="forgetpass">Go Back!</Link>
                </label>
    
        </form>
       </div>
  )
}
