import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import useAuth from "../../hooks/useAuth";
import React, {useState, useEffect} from 'react';
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import baseUrl from "../../api/baseUrl";

export default function Editauthor() {
    const [author_name, setAuthor_name] = useState("");
    const {auth} = useAuth();
    const user= jwtDecode(auth.accessToken);
    const params = useParams();
    const navigate =useNavigate()

    useEffect(() =>{
    
        const getAuthor = async () =>{
            try{
                const response = await axios.get(baseUrl+'/author/?id='+params.id,{
                    headers: {
                        "Authorization": 'Bearer ' + String(auth.accessToken),
                        "Content-Type": 'multipart/form-data'
                    },
                    withCredentials:true
                });
                let data=response.data;
                if (data && data.length > 0) {
                    setAuthor_name(data[0].author_name);
                  } else {
                    console.log("No data")// Handle the case when data is undefined or empty
                  }
            }catch(err) {
                console.log(err);
                //navigate('/error');
            }
        }
    
        getAuthor();
    
    },[auth,params])
    
    let updateauthor = (e )=> {
        e.preventDefault()
        axios.post(baseUrl+'/author/'+params.id+"/", {
            'author_name':author_name
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
        navigate('/authors')
    })
    .catch(error => console.log(error))
       
    }
    const handleDelete = () => {
        
        axios.delete(baseUrl+'/author/'+params.id+'/delete/',
        {
            headers: {
                "Authorization": 'Bearer ' + String(auth.accessToken),
                "Content-Type": 'application/json'
            }
        }
        ).then(res =>{
            console.log(res)
            navigate('/authors')
        })
      };
  return (
    <div className='loginform'>
        {user.is_superuser ?
        <Link onClick={handleDelete} className="line" to="#">Delete Grade</Link>:
        <></>
        }
        
        <center><h2>Add a new Author form</h2></center> 
        <form  onSubmit={updateauthor} className='formelement'>
            <label htmlFor="author">Enter Author Name</label>
            <input
                className='credentials'
                type='text'
                name='author_name'
                value={author_name}
                onChange={event=>setAuthor_name(event.target.value)}
                required
                />
            <label htmlFor="loginbutton">
                <button className='submitbuton'>Update</button> 
            </label>
            <label htmlFor="create new">
                <Link to="/authors" className="forgetpass">Go Back!</Link>
            </label>
        </form>
        
        
    </div>
  )
}
