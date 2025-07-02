import React, { useState, useEffect } from 'react';
import { fetchEap, createEap, updateEap, deleteEap } from '../../services/eapservice';
import { fetchSchools, createSchools, updateSchools, deleteSchools } from '../../services/schools';
import { fetchEapClass, createEapClass, updateEapClass, deleteEapClass } from '../../services/eapclassservices';
import useAuth from "../../hooks/useAuth";
import DynamicTable from "../pages/dinamicTable/DynamicTable";
import { BiEditAlt, BiSave } from "react-icons/bi";

export default function Eaps() {
    let { auth } = useAuth();
    const currentDate = new Date();
    const initialDate = currentDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    const [eap, setEap] = useState([]);
    const [eapSchools, setEapSchools] = useState([]);
    const [eapClasses, setEapClasses] = useState([]);
    const [creating, setCreating] = useState(false); 
    const [editing, setEditing] = useState(null); // Track which timeslot is being edited
    const [formData, setFormData] = useState({
        last_name: "",
        first_name: "",
        student_school: "",
        current_class: ""
    });
    const [formSchoolData, setFormSchoolData] = useState({
        name: ""
    });
    const [formClassData, setFormClassData] = useState({
        name: "",
        academic_year:""
    });
   
    useEffect(() => {
        fetchSchools(auth).then(response => setEapSchools(response.data));
        fetchEapClass(auth,initialDate).then(response => setEapClasses(response.data));
        fetchEap(auth).then(response => setEap(response.data));
    }, [auth]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    

    const handleSchoolChange = (e) => {
        setFormSchoolData({ ...formSchoolData, [e.target.name]: e.target.value });
    };
    const handleClassChange = (e) => {
        setFormClassData({ ...formClassData, [e.target.name]: e.target.value });
    };

    const handleDelete = (id) => {
        const confirmed = window.confirm("Are you sure you want to delete this student?");
        if (confirmed) {
            deleteEap(auth, id)
                .then(() => {
                    setEap(eap.filter(item => item.id !== id));
                })
                .catch(error => {
                    console.error('There was an error!', error);
                });
        }
    };

    const handleEdit = (id) => {
        setEditing(id);
    };

    const handleSave = (id) => {
        const eapToUpdate = eap.find(st => st.id === id);
        updateEap(auth, id, {
            last_name: eapToUpdate.last_name,
            first_name: eapToUpdate.first_name,
            student_school: eapToUpdate.school,
            current_class: eapToUpdate.eap_class
        })
            .then(() => {
                setEditing(null); // Exit editing mode after saving
                fetchEap(auth).then(response => setEap(response.data));
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    };

    const handleInputChange = (id, key, value) => {
        setEap(preveap =>
            preveap.map(st =>
                st.id === id ? { ...st, [key]: value } : st
            )
        );
    };

    // Transform the timeslots data
    const transformedEap = eap
    .map(({ id, last_name,first_name,school,eap_class},index) => {
        
        return {
            "#":index+1,
            "Last Name": editing === id ? (
                <input
                    type="text"
                    name="last_name"
                    value={last_name}
                    onChange={(e) => handleInputChange(id, 'last_name', e.target.value)}
                />
            ) : (
                last_name
            ),
            "First Name": editing === id ? (
                <input
                    type="text"
                    name="first_name"
                    value={first_name}
                    onChange={(e) => handleInputChange(id, 'first_name', e.target.value)}
                />
            ) : (
                first_name
            ),
            "School": editing === id ? (
                <select
                    name="school"
                    value={school || ""}
                    onChange={(e) => handleInputChange(id, 'school', e.target.value)}
                    className="editing-select" // Optional: add styling class
                >
                    <option value="">Select a school</option>
                    {eapSchools.map((eapSchool) => (
                        <option key={eapSchool.id} value={eapSchool.id}>
                            {eapSchool.name}
                        </option>
                    ))}
                </select>
            ) : (
                school
            ),
            "EAP Class": editing === id ? (
                <select
                    name="eap_class"
                    value={eap_class || ""}
                    onChange={(e) => handleInputChange(id, 'eap_class', e.target.value)}
                >
                    <option value="">Select a class</option>
                    {eapClasses.map((eapClass) => (
                        <option key={eapClass.id} value={eapClass.id}>
                            {`${eapClass.name} - ${eapClass.academic_year}`}
                        </option>
                    ))}
                </select>
            ) : (
                eap_class
            ),
            edit: editing === id ? (
                <span
                    onClick={() => handleSave(id)}
                    style={{ cursor: 'pointer' }}
                >
                    <BiSave className='icon' />
                </span>
            ) : (
                <span
                    onClick={() => handleEdit(id)}
                    style={{ cursor: 'pointer' }}
                >
                    <BiEditAlt className='icon' />
                </span>
            )/* ,
            delete: (
                <span
                    onClick={() => handleDelete(id)}
                    style={{ cursor: 'pointer' }}
                >
                    Delete
                </span>
            ) */
        };
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        createEap(auth, formData)
            .then(response => {
                console.log('Created successfully', response.data);
                setFormData({
                    last_name: "",
                    first_name: "",
                    school: "",
                    eap_class: ""
                });
                fetchEap(auth).then(response => setEap(response.data));
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    };
    const handleSchoolSubmit = (e) => {
        e.preventDefault();
        
        console.log(formSchoolData)
        createSchools(auth, formSchoolData)
            .then(response => {
                console.log('Created successfully', response.data);
                
                fetchSchools(auth).then(response => setEap(response.data));
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    };
    const handleClassSubmit = (e) => {
        e.preventDefault();
        console.log(formClassData)
        console.log(formData)
        createEapClass(auth, formClassData)
            .then(response => {
                console.log('Created successfully', response.data);
                
                fetchEapClass(auth).then(response => setEap(response.data));
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    };

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
                }}
            >
                <h2>Students in English Access Program</h2>
                {!creating?
                    <button
                        style={
                            {
                                padding: '10px 20px',
                                margin: '5px',
                                border: 'none',
                                borderRadius: '5px',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: '16px',
                                backgroundColor: '#002F6C',
                            }
                        }
                        onClick={() => setCreating(!creating)}  // Call filterToday on button click
                    >
                        Create New
                    </button>:
                    <form className='formelement' onSubmit={handleSubmit}>
                    
                        <label htmlFor="first_name">Enter First Name</label>
                        <input
                            className='credentials'
                            type="text"
                            id="first_name"
                            name="first_name"
                            onChange={handleChange}
                            required
                        />
                        <label htmlFor="last_name">Enter Last Name</label>
                        <input
                            className='credentials'
                            type="text"
                            id="last_name"
                            name="last_name"
                            onChange={handleChange}
                            required
                        />
                        <label htmlFor="school">Enter School Name</label>
                        <select
                            className='credentials'
                            id="school"
                            name="student_school"
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select a school</option>
                            {eapSchools.map((school) => (
                                <option key={school.id} value={school.id}>
                                    {school.name}
                                </option>
                            ))}
                        </select>
                        <label htmlFor="eap_class">Enter EAP Class Name</label>
                        <select
                            className='credentials'
                            id="eap_class"
                            name="current_class"
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select a class</option>
                            {eapClasses.map((eapClass) => (
                                <option key={eapClass.id} value={eapClass.id}>
                                    {`${eapClass.name} - ${eapClass.academic_year}`}
                                </option>
                            ))}
                        </select>
                        <label htmlFor="loginbutton">
                            <button className='submitbuton' type="submit">Save</button> 
                        </label>
                        <button
                            style={
                                {
                                    padding: '10px 20px',
                                    margin: '5px',
                                    border: 'none',
                                    borderRadius: '5px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    backgroundColor: '#002F6C',
                                }
                            }
                            onClick={() => setCreating(!creating)}  // Call filterToday on button click
                        >
                            Cancel
                        </button>
                    </form>
                }
            </div>
            
            
            <h2>Available EAP Students</h2>
            <DynamicTable mockdata={transformedEap} />
            {/* Schoos  */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
                }}
            >
                <h2>Schools in English Access Program</h2>
                
                    <form className='formelement' onSubmit={handleSchoolSubmit}>
                    
                        <label htmlFor="schoo">Enter School Name</label>
                        <input
                            className='credentials'
                            type="text"
                            id="school"
                            name="name"
                            onChange={handleSchoolChange}
                            required
                        />
                        <label htmlFor="loginbutton">
                            <button className='submitbuton' type="submit">Save</button> 
                        </label>
                    </form>
                    
            </div>
            <DynamicTable mockdata={eapSchools} />
            {/* Classes  */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
                }}
            >
                <h2>Classes in English Access Program</h2>
                
                    <form className='formelement' onSubmit={handleClassSubmit}>
                    
                        <label htmlFor="eap_class">Enter EAP Class Name</label>
                        <input
                            className='credentials'
                            type="text"
                            id="eap_class"
                            name="name"
                            onChange={handleClassChange}
                            required
                        />
                        
                        <label htmlFor="academic_year">Enter Academic Year</label>
                        <input
                            className='credentials'
                            type="number"
                            id="academic_year"
                            name="academic_year"
                            onChange={handleClassChange}
                            required
                        />
                        <label htmlFor="loginbutton">
                            <button className='submitbuton' type="submit">Save</button> 
                        </label>
                    </form>
                    
            </div>
            <DynamicTable mockdata={eapClasses} />
        </div>
    );
}

