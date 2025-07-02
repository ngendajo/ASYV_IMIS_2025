import React, {useState, useEffect} from 'react'
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import { Link } from 'react-router-dom';
import { BiEditAlt } from "react-icons/bi";
import baseUrl from "../../api/baseUrl";
import DynamicTable from "./dinamicTable/DynamicTable";

export default function Combs() {
  const [data, setData] = useState([]);
  let {auth} = useAuth();

    useEffect(() =>{
    
        const getData = async () =>{
            try{
                const response = await axios.get(baseUrl+'/combination/',{
                    headers: {
                        "Authorization": 'Bearer ' + String(auth.accessToken),
                        "Content-Type": 'multipart/form-data'
                    },
                    withCredentials:true
                });
                var combinationlist=[]
                var i=1
                response.data.forEach(e=>{
                    combinationlist.push({
                    No:i,
                    combination_name:e.combination_name,
                    Edit:<span>
                        <Link to={`/add-comb/${e.id}`}><BiEditAlt className='icon'/></Link>
                    </span>
                })
                i=i+1
                })
                setData(combinationlist);
            }catch(err) {
                console.log(err);
                //navigate('/error');
            }
        }
    
        getData();
    
    },[auth])
  return (
    <div>
      <h2 >Averable Combinations</h2>
      <DynamicTable mockdata={data} />
    </div>
  )
}
