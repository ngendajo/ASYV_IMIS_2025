import React, {useState} from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import { Link } from "react-router-dom";
import { CiCircleRemove } from "react-icons/ci";
import baseUrl from "../../api/baseUrl";

export default function NewGrade() {
  const {auth} = useAuth();
    const navigate =useNavigate()
    const [families, setFamilies] = useState([{ family_name: '', family_number: '',family_mother: '', family_mother_tel: ''  }])

    let registerGrade = (e )=> {
        e.preventDefault()
        axios.post(baseUrl+'/grades/', {
            'grade_name':e.target.grade_name.value, 
            'start_academic_year':e.target.start_academic_year.value,
            'end_academic_year':e.target.end_academic_year.value,
            'families':families
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
        navigate('/grades')
    })
    .catch(error => console.log(error))
        
    }

    const handleAddFamilies = () => {
        const values = [...families];
        values.push({
            family_name: '', 
            family_number: '',
            family_mother: '', 
            family_mother_tel: ''
        });
        setFamilies(values);
      };
      const handleRemoveFamilies = (index) => {
        const values = [...families];
        values.splice(index, 1);
        setFamilies(values); 
      };
      const handleInputChange = (index, event) => {
        const values = [...families];
        const updatedValue = event.target.name;
        values[index][updatedValue] = event.target.value;
    
        setFamilies(values);
      };
    

  return (
    <center className='alumni-list-body'>
        <center><h2>Add a new grade form</h2></center>
        <form onSubmit={registerGrade} className='formelement'>
          <label>Grade name </label>
          <input className='credentials'  type="text" name="grade_name" placeholder="Enter grade" required />
          <label>Start year</label>
          <input className='credentials'  type="text" name="start_academic_year" placeholder="Enter start academic year" required/>
          <label>End year</label>
          <input className='credentials'  type="text" name="end_academic_year" placeholder="Enter end academic year" required />
          {families.map((input, index) => {
            return (
              <div key={index} className="family-info">
                            <span>Family{index +1}:</span>
                            <div className="family-info-input">
                                <input
                                  className='credentials' 
                                  type='text'
                                  name='family_name'
                                  placeholder='Family name'
                                  value={input.family_name}
                                  onChange={(event) =>
                                  handleInputChange(index, event)
                                  }
                                />
                                <input
                                  className='credentials' 
                                  type='number'
                                  name='family_number'
                                  placeholder='Family number'
                                  value={input.family_number}
                                  onChange={(event) =>
                                  handleInputChange(index, event)
                                  }
                                />
                                <input
                                  className='credentials' 
                                  type='text'
                                  name='family_mother'
                                  placeholder='Family mother'
                                  value={input.family_mother}
                                  onChange={(event) =>
                                  handleInputChange(index, event)
                                  }
                                />
                                <input
                                  className='credentials' 
                                  type='text'
                                  name='family_mother_tel'
                                  placeholder='Family mother tel'
                                  value={input.family_mother_tel}
                                  onChange={(event) =>
                                  handleInputChange(index, event)
                                      }
                                />
                                <button variant="secondary" onClick={() => handleRemoveFamilies(index)}><CiCircleRemove/></button>
                            </div>

                        </div>
                        )
                        })}

          <label htmlFor="create new">          
            <button className='submitbuton' variant="primary" onClick={() => handleAddFamilies()}>Add a family</button>
          </label>  
          <label htmlFor="create new">        
            <button className='submitbuton' type="submit">Save</button>
          </label> 
        </form>
        <p>
              <Link className="forgetpass" to="/grades">Go back</Link>
        </p>
    </center>
  )
}
