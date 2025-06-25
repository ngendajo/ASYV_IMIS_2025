import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import useAuth from "../../hooks/useAuth";
import React, {useState, useEffect} from 'react';
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import baseUrl from "../../api/baseUrl";

export default function Editcategory() {
    const [category_name, setCategory_name] = useState("");
    const {auth} = useAuth();
    const user= jwtDecode(auth.accessToken);
    const params = useParams();
    const navigate =useNavigate()

    useEffect(() =>{
    
        const getCategory = async () =>{
            try{
                const response = await axios.get(baseUrl+'/category/?id='+params.id,{
                    headers: {
                        "Authorization": 'Bearer ' + String(auth.accessToken),
                        "Content-Type": 'multipart/form-data'
                    },
                    withCredentials:true
                });
                let data=response.data;
                if (data && data.length > 0) {
                    setCategory_name(data[0].category_name);
                  } else {
                    console.log("No data")// Handle the case when data is undefined or empty
                  }
            }catch(err) {
                console.log(err);
                //navigate('/error');
            }
        }
    
        getCategory();
    
    },[auth,params])
    
    let updatecategory = (e )=> {
        e.preventDefault()
        axios.post(baseUrl+'/category/'+params.id+"/", {
            'category_name':category_name
        },
        {
            headers: {
                "Authorization": 'Bearer ' + String(auth.accessToken),
                "Content-Type": 'application/json'
            }
        }
    )
    .then(res =>{
        console.log(res)
        navigate('/categories')
    })
    .catch(error => console.log(error))
       
    }
    const handleDelete = () => {
        
        axios.delete(baseUrl+'/category/'+params.id+'/delete/',
        {
            headers: {
                "Authorization": 'Bearer ' + String(auth.accessToken),
                "Content-Type": 'application/json'
            }
        }
        ).then(res =>{
            console.log(res)
            navigate('/categories')
        })
      };
  return (
    <div className='loginform'>
        {user.is_superuser ?
        <Link onClick={handleDelete} className="line" to="#">Delete Grade</Link>:
        <></>
        }
        
        <center><h2>Update Category form</h2></center> 
        <form  onSubmit={updatecategory} className='formelement'>
            <label htmlFor="category">Enter Category Name</label>
            <input
                className='credentials'
                type='text'
                name='ccategory_name'
                value={category_name}
                onChange={event=>setCategory_name(event.target.value)}
                required
                />
            <label htmlFor="loginbutton">
                <button className='submitbuton'>Update</button> 
            </label>
            <label htmlFor="create new">
                <Link to="/categories" className="forgetpass">Go Back!</Link>
            </label>
        </form>
        
        
    </div>
  )
}
