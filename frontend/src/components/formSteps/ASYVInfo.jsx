import {useState, useEffect} from "react";

import ItemForm from "./ItemForm";
import baseUrl from "../../api/baseUrl";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import "./style.css";

const ASYVInfo = ({ setForm, formData, navigation }) => {
  const { auth } = useAuth();
  let [combinations, setCombinations] = useState([]);
  let [grades, setGrades] = useState([]);
  let [families, setFamilies] = useState([]);
  let [eps1, setEps1] = useState([]);
  
  useEffect(() =>{
    
    const getgrades = async () =>{
        try{
            const response = await axios.get(baseUrl+'/grades/',{
                headers: {
                    "Authorization": 'Bearer ' + String(auth.accessToken),
                    "Content-Type": 'multipart/form-data'
                },
                withCredentials:true
            });
            setGrades(response.data)
        }catch(err) {
            console.log(err);
        }
    }

    getgrades();

},[auth])
const getfamilies = (event) => {
    const id = event.target.value;
    grades.forEach((grade)=>{
        if(parseInt(grade.id,10) === parseInt(id,10)){
            setFamilies(grade.families);
        }
    })
    
}



useEffect(() =>{

  const geteps = async () =>{
      try{
          const response = await axios.get(baseUrl+'/ep/',{
              headers: {
                  "Authorization": 'Bearer ' + String(auth.accessToken),
                  "Content-Type": 'multipart/form-data'
              },
              withCredentials:true
          });
          
          setEps1(response.data)
      }catch(err) {
          console.log(err);
      }
  }

  geteps();

},[auth])

useEffect(() =>{

  const getcombinations = async () =>{
      try{
          const response = await axios.get(baseUrl+'/combination/',{
              headers: {
                  "Authorization": 'Bearer ' + String(auth.accessToken),
                  "Content-Type": 'multipart/form-data'
              },
              withCredentials:true
          });
          setCombinations(response.data);
      }catch(err) {
          console.log(err);
      }
  }

  getcombinations();

},[auth])
  const { family,combination,eps} = formData;

  const { previous, next } = navigation;
  

  return (
    <div className="form">
      <h4>ASYV Info</h4>
      <center>
        <label htmlFor="grade">
            Grade
        </label>     
            <select name="grade" onChange={getfamilies}  className='marks-group'>
              <option value="">select grade</option>
                {grades.map((e,ind) => {
                    return  <option key={ind} value={e.id}>{e.grade_name}</option>
                })}               
            </select>
      </center>
      <center> 
          <label htmlFor="family">
              Family 
          </label>      
              <select name="family"value={family} onChange={setForm}  className='marks-group'>
              <option value="" disabled>Select your family</option>
                  {families.map((e,ind) => {
                      return  <option key={ind} value={e.id}>{e.family_name}</option>
                  })}               
              </select> 
      </center>
      <center>
        <label htmlFor="combination">
                    Combination
        </label>
        
        <select name='combination'value={combination} onChange={setForm}  className='marks-group'>
          <option value="" disabled>select combination</option>
        {combinations.map((e,ind) => {
          return  <option key={ind} value={e.id}>{e.combination_name}</option>
            })}
        </select>
      </center>
      <center>
        <label htmlFor="combination">
                    EP
        </label>
        
        <select name='eps'value={eps} onChange={setForm} className='marks-group'>
          <option value="" disabled>select ep</option>
        {eps1.map((e,ind) => {
          return  <option key={ind} value={e.id}>{e.title}</option>
            })}
        </select>
      </center>
      <div>
        <button className='next-btn' onClick={previous}>Previous</button>
        <button className='next-btn' onClick={next}>Next</button>
      </div>
    </div>
  );
};

export default ASYVInfo;
