import React, {useState, useEffect} from 'react'
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import { Link } from 'react-router-dom';
import { BiEditAlt } from "react-icons/bi";
import baseUrl from "../../api/baseUrl";
import DynamicTable from "./dinamicTable/DynamicTable";

export default function Staffs() {
  const [data, setData] = useState([]);
  let {auth} = useAuth();

  useEffect(() =>{
  
      const getData = async () =>{
          try{
              const response = await axios.get(baseUrl+'/bulkeducator/',{
                  headers: {
                      "Authorization": 'Bearer ' + String(auth.accessToken),
                      "Content-Type": 'multipart/form-data'
                  },
                  withCredentials:true 
              });
              var stafflist=[]
              var i=1
              response.data.forEach(e=>{
                  stafflist.push({
                  No:i,
                  staff_name:e.first_name+" "+e.last_name,
                  email:e.email,
                  Role:e.is_librarian?"Librarian":"Teacher",
                  Edit:<span>
                      <Link to={`/staff/${e.id}`}><BiEditAlt className='icon'/></Link>
                  </span>
              })
              i=i+1
              })
              setData(stafflist);
          }catch(err) {
              console.log(err);
              //navigate('/error');
          }
      }
  
      getData();
  
  },[auth])
return (
  <div>
    <h2 >Registered Staff</h2>
    <DynamicTable mockdata={data} />
  </div>
)
}

