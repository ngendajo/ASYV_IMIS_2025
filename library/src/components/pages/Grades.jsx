import { Link } from 'react-router-dom';
import {FaSearch} from "react-icons/fa";
import React, {useState, useEffect} from 'react';
import axios from 'axios';
import useAuth from '../../hooks/useAuth';
import baseUrl from '../../api/baseUrl';

export default function Grades() {
  const [results, setResults]=useState([]);
    const [results1, setResults1]=useState([]);
    const [input, setInput] = useState("");
    const {auth} = useAuth();

    useEffect(() =>{
    
        const getGrades = async () =>{
            try{
                const response = await axios.get(baseUrl+'/grades/',{
                    headers: {
                        "Authorization": 'Bearer ' + String(auth.accessToken),
                        "Content-Type": 'multipart/form-data'
                    },
                    withCredentials:true
                });
                setResults1(response.data.sort((a, b) => b.start_academic_year - a.start_academic_year));
                setResults(response.data.sort((a, b) => b.start_academic_year - a.start_academic_year));
                //console.log(response.data)
            }catch(err) {
                console.log(err);
                //navigate('/error');
            }
        }
    
        getGrades();
    
    },[auth])
    const fetchDAta = (value) =>{
      if(results1.length>0){
        let results=results1.filter((grade) =>
        grade?.grade_name.toLowerCase().includes(value.toLowerCase()) || 
        grade?.start_academic_year.toLowerCase().includes(value.toLowerCase()) || 
        grade?.end_academic_year.toLowerCase().includes(value.toLowerCase())
      );
      setResults(results)
       }
        
      }
      const handleChange = (value) =>{
        setInput(value)
        fetchDAta(value)
    }
    
  return (
    <div>
      <div className='input-wrapper search-staff grade-search'>
        <FaSearch id='search-icon'/>
        <input placeholder='search grade...' value={input} onChange={(e) =>handleChange(e.target.value)}/>
      </div>
      <div className='grades-list'>
        {Array.isArray(results)?
          <>
            { results.map((result, id)=>{
              return <div className='grade-details' key={id}>
            <p><strong>Grade:</strong> {result.grade_name}</p>
            <p><strong>Start Academic Year:</strong>{result.start_academic_year}</p>
            <p><strong>End Academic Year:</strong>{result.end_academic_year}</p>
            <h3>Families</h3>
            <ol>
                {result.families?.map((fa,i)=>{
                  return <div className='view-family-alumni' to={`/familyalumni/${fa.id}`} key={i}> 
                            <li key={i}><strong>{fa.family_name}</strong>
                              <ul className='family-detail'>
                                <li>Mother:{fa.family_mother}</li>
                                <li>Mother Tel:{fa.family_mother_tel}</li>
                              </ul>
                            </li>
                          </div>
                })}
                
            </ol>
                    <Link className='edit-grade' to={`/grade/${result.id}`}>Update</Link>
                    </div>
                })}
                </>:<h1>No grade registered yet!</h1>
        }
            </div>
    </div>
  )
}
