import React, {useState, useEffect} from 'react'
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import { Link } from 'react-router-dom';
import { BiEditAlt } from "react-icons/bi";
import baseUrl from "../../api/baseUrl";
import DynamicTable from "./dinamicTable/DynamicTable";

export default function Authors() {
  const [data, setData] = useState([]);
    let {auth} = useAuth();

    useEffect(() =>{
    
        const getData = async () =>{
            try{
                const response = await axios.get(baseUrl+'/author/',{
                    headers: {
                        "Authorization": 'Bearer ' + String(auth.accessToken),
                        "Content-Type": 'multipart/form-data'
                    },
                    withCredentials:true 
                });
                var authorlist=[]
                var i=1
                response.data.forEach(e=>{
                    authorlist.push({
                    No:i,
                    author_name:e.author_name,
                    Edit:<span>
                        <Link to={`/author/${e.id}`}><BiEditAlt className='icon'/></Link>
                    </span>
                })
                i=i+1
                })
                setData(authorlist);
            }catch(err) {
                console.log(err);
                //navigate('/error');
            }
        }
    
        getData();
    
    },[auth])
  return (
    <div>
      <h2 >Averable Authors</h2>
      <DynamicTable mockdata={data} />
    </div>
  )
}
