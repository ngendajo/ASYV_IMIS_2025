import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import { CiCircleRemove } from "react-icons/ci";
import { BsFillHouseAddFill } from "react-icons/bs";
import { BiSave } from "react-icons/bi";
import baseUrl from "../../api/baseUrl";
import './AddGrade.css';
import ReactPaginate from 'react-paginate';

export default function AddGrade() {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const params = useParams();
    const [activeTab, setActiveTab] = useState('add');
    const [grades, setGrades] = useState([]);
    const [selectedGrade, setSelectedGrade] = useState({
        grade_name: '',
        start_academic_year: '',
        end_academic_year: '',
        families: [{ family_name: '', family_number: '', family_mother: '', family_mother_tel: '', id: 0 }]
    });
    const [isEditing, setIsEditing] = useState(false);

    const [currentPage, setCurrentPage] = useState(0);
    const gradesPerPage = 4;

    useEffect(() => {
        if (activeTab === 'list') {
            fetchGrades();
        } else if (activeTab === 'add' && params.id) {
            fetchGradeDetails(params.id);
        }
    }, [activeTab, params.id]);

    const fetchGrades = () => {
        axios.get(baseUrl + '/grades/', {
            headers: {
                "Authorization": 'Bearer ' + String(auth.accessToken)
            }
        })
        .then(res => {
            setGrades(res.data);
        })
        .catch(error => alert(error.response.data));
    };

    const fetchGradeDetails = (id) => {
        axios.get(baseUrl + `/grades/?id=${id}`, {
            headers: {
                "Authorization": 'Bearer ' + String(auth.accessToken)
            }
        })
        .then(res => {
            const gradeData = res.data[0];
            const familiesData = gradeData.families.map(family => ({
                family_name: family.family_name,
                family_number: family.family_number,
                family_mother: family.family_mother,
                family_mother_tel: family.family_mother_tel,
                id: family.id
            }));
            setSelectedGrade({
                id: gradeData.id,
                grade_name: gradeData.grade_name,
                start_academic_year: gradeData.start_academic_year,
                end_academic_year: gradeData.end_academic_year,
                families: familiesData
            });
            setIsEditing(true);
        })
        .catch(error => alert(error.response.data));
    };

    const registerGrade = (e) => {
        e.preventDefault();
        const url = isEditing
            ? `${baseUrl}/grade/${selectedGrade.id}/`
            : `${baseUrl}/grades/`;
        const method = isEditing ? 'post' : 'post';

        axios({
            method: method,
            url: url,
            data: {
                'grade_name': selectedGrade.grade_name,
                'start_academic_year': selectedGrade.start_academic_year,
                'end_academic_year': selectedGrade.end_academic_year
               
            },
            headers: {
                "Authorization": 'Bearer ' + String(auth.accessToken),
                "Content-Type": 'application/json'
            }
        })
        .then(res => {
            alert("Grade " + (isEditing ? "updated" : "added") + " successfully");
            setActiveTab('list');
            setIsEditing(false);
            resetSelectedGrade();
        })
        .catch(error => console.log(error.response));
    };

    const handleEditGrade = (grade) => {
        fetchGradeDetails(grade.id);
        setActiveTab('add');
    };

    const handleDelete = async (id) => {
      //  alert("Please delete all the families first.");

        axios.delete(baseUrl+'/grade/'+id+'/delete/',
            {
                headers: {
                    "Authorization": 'Bearer ' + String(auth.accessToken),
                    "Content-Type": 'application/json'
                }
            }
            ) .then(res => {
                alert("Grade Deleted Successfully");
                fetchGrades();
                setActiveTab('list');
                setIsEditing(false);
                resetSelectedGrade();
            })
    };

    const confirmDelete = async (id) => {
        axios.delete(baseUrl + '/grade/' + id + '/delete/', {
            headers: {
                "Authorization": 'Bearer ' + String(auth.accessToken),
                "Content-Type": 'application/json'
            }
        })
        .then(res => {
            alert("Grade Deleted Successfully");
            fetchGrades();
            setActiveTab('list');
            setIsEditing(false);
            resetSelectedGrade();
        });
    };

    const handleAddFamilies = () => {
        const values = [...selectedGrade.families];
        values.push({
            family_name: '',
            family_number: '',
            family_mother: '',
            family_mother_tel: '',
            id: 0
        });
        setSelectedGrade({ ...selectedGrade, families: values });
    };

    const handleRemoveFamilies = (index, familyId) => {
        if (familyId !== 0) {
            axios.delete(baseUrl + '/family/' + familyId + '/delete/', {
                headers: {
                    "Authorization": 'Bearer ' + String(auth.accessToken),
                    "Content-Type": 'application/json'
                }
            })
            .then(res => {
                const values = [...selectedGrade.families];
                values.splice(index, 1);
                setSelectedGrade({ ...selectedGrade, families: values });
            })
            .catch(error => console.log(error));
        } else {
            const values = [...selectedGrade.families];
            values.splice(index, 1);
            setSelectedGrade({ ...selectedGrade, families: values });
        }
    };

    const handleInputChange = (index, event) => {
        const values = [...selectedGrade.families];
        const updatedValue = event.target.name;
        values[index][updatedValue] = event.target.value;
        setSelectedGrade({ ...selectedGrade, families: values });
    };

    const handleGradeInputChange = (event) => {
        const { name, value } = event.target;
        setSelectedGrade({ ...selectedGrade, [name]: value });
    };

    const resetSelectedGrade = () => {
        setSelectedGrade({
            id: "",
            grade_name: '',
            start_academic_year: '',
            end_academic_year: '',
            families: [{ family_name: '', family_number: '', family_mother: '', family_mother_tel: '', id: 0 }]
        });
    };

    const handlePageClick = ({ selected }) => {
        setCurrentPage(selected);
    };

    // Logic to display combinations for the current page
    const offset = currentPage * gradesPerPage;
    const currentGrades = grades.slice(offset, offset + gradesPerPage);

    return (
        <div className="GradeContainer">
            <button onClick={() => navigate(-1)} className="comb-back-button">Back &gt;</button>
            <div className="grade-tabs">
                <button
                    className={activeTab === 'add' ? 'active' : ''}
                    onClick={() => {
                        setActiveTab('add');
                        setIsEditing(false);
                        resetSelectedGrade();
                    }}
                >
                    {isEditing ? "Edit Grade" : "Add Grade"}
                </button>
                <button
                    className={activeTab === 'list' ? 'active' : ''}
                    onClick={() => setActiveTab('list')}
                >
                    List Grades
                </button>
            </div>

            {activeTab === 'add' && (
                <div className="grade-request-form">
                    <form onSubmit={registerGrade}>
                        <div className="grade-info">
                            <label>
                                <span>Grade name:</span>
                                <input
                                    type="text"
                                    name="grade_name"
                                    value={selectedGrade.grade_name}
                                    onChange={handleGradeInputChange}
                                    required
                                />
                            </label>
                            <label>
                                <span>Start year:</span>
                                <input
                                    type="text"
                                    name="start_academic_year"
                                    value={selectedGrade.start_academic_year}
                                    onChange={handleGradeInputChange}
                                    required
                                />
                            </label>
                            <label>
                                <span>End year:</span>
                                <input
                                    type="text"
                                    name="end_academic_year"
                                    value={selectedGrade.end_academic_year}
                                    onChange={handleGradeInputChange}
                                    required
                                />
                            </label>
                        </div>

                        <div>
                            {selectedGrade.families.map((input, index) => (
                                <div key={index} className="family-info">
                                    <span>Family {index + 1}:</span>
                                    <div className="family-info-input">
                                        <input
                                            type="text"
                                            name="family_name"
                                            placeholder="Family name"
                                            value={input.family_name}
                                            onChange={(event) => handleInputChange(index, event)}
                                        />
                                        <input
                                            type="number"
                                            name="family_number"
                                            placeholder="Family number"
                                            value={input.family_number}
                                            onChange={(event) => handleInputChange(index, event)}
                                        />
                                        <input
                                            type="text"
                                            name="family_mother"
                                            placeholder="Family mother"
                                            value={input.family_mother}
                                            onChange={(event) => handleInputChange(index, event)}
                                        />
                                        <input
                                            type="text"
                                            name="family_mother_tel"
                                            placeholder="Mother Tel"
                                            value={input.family_mother_tel}
                                            onChange={(event) => handleInputChange(index, event)}
                                        />
                                        <button type="button"  className="remove-family-btn" onClick={() => handleRemoveFamilies(index, input.id)}>
                                            <CiCircleRemove size={30} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <div className='buttons'>
                            <button type="button" className="add-family-btn" onClick={handleAddFamilies}>
                                <BsFillHouseAddFill size={20} /> Add family
                            </button>
                      
                        <div className="form-buttons">
                            <button type="submit" className="save-btn">
                                <BiSave size={20} /> {isEditing ? "Update" : "Save"}
                            </button>
                            {isEditing && (
                                <button type="button" className="delete" onClick={() => handleDelete(selectedGrade.id)}>
                                    Delete Grade
                                </button>
                            )}
                        </div>

                        </div>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'list' && (
                <div className="submitted-posts-list">
                    {grades.length === 0 ? (
                        <p>No grades available.</p>
                    ) : (
                        <table className="grades-list">
                            <tbody>
                                {currentGrades.map((grade) => (
                                    <tr key={grade.id}  className="grade-item" >
                                        <td>
                                         <p>{grade.grade_name} ({grade.start_academic_year} - {grade.end_academic_year})</p>
                                         </td>
                                         <td>
                                            <button onClick={() => handleEditGrade(grade)}>Edit</button>
                                        
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

<div className="pagination">
                    <ReactPaginate
                        previousLabel={'<'}
                        nextLabel={'>'}
                        breakLabel={'...'}
                        pageCount={Math.ceil(grades.length / gradesPerPage)}
                        marginPagesDisplayed={1}
                        pageRangeDisplayed={3}
                        onPageChange={handlePageClick}
                        containerClassName={'alu-pagination'}
                        activeClassName={'active'}
                    />

</div>
                </div>
            )}
        </div>
    );
}
