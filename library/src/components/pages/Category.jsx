import axios from "axios";
import { React,useState } from "react"
import useAuth from "../../hooks/useAuth";
import { Link,useNavigate } from "react-router-dom";
import baseUrl from "../../api/baseUrl";

export default function Category() {
  const {auth} = useAuth();
  const navigate =useNavigate()
  const [category, setCategory] = useState('');
  
let handleSubmit = (e )=> {
  e.preventDefault()
  axios.post(baseUrl+'/category/', {
      'category_name':category,
  },
  {
      headers: {
          "Authorization": 'Bearer ' + String(auth.accessToken),
          "Content-Type": 'application/json'
      }
  }
)
.then(res =>{
  alert(res.data.category_name+" created successfully")
  navigate('/categories')
})
.catch(error => alert(error.response.data))
  
}
  return (
    <div className="loginform">
        <h2>Add a new category form</h2>
        
        <form className='formelement' onSubmit={handleSubmit}>
          <label htmlFor="category">Enter category Name</label>
          <input 
            className='credentials' 
            type="text"
            id="category"
            autoComplete="off"
            onChange={(e) => setCategory(e.target.value)}
            value={category}
            required
          />
                <label htmlFor="loginbutton">
                  <button className='submitbuton'>Save</button> 
                </label>
                <label htmlFor="create new">
                  <Link to="/categories" className="forgetpass">Go Back!</Link>
                </label>
    
        </form>
       </div>
  )
}
