import React, { useState, useEffect } from "react";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import baseUrl from "../../api/baseUrl";
import './AddCombination.css';
import ReactPaginate from 'react-paginate';

export default function AddCombination() {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('add');
    const [combinations, setCombinations] = useState([]);
    const [selectedCombination, setSelectedCombination] = useState({ combination_name: '' });
    const [isEditing, setIsEditing] = useState(false);

    const [currentPage, setCurrentPage] = useState(0);
    const combPerPage = 5;

    useEffect(() => {
        if (activeTab === 'list') {
            fetchCombinations();
        }
    }, [activeTab]);

    const fetchCombinations = () => {
        axios.get(baseUrl + '/combination/', {
            headers: {
                "Authorization": 'Bearer ' + String(auth.accessToken)
            }
        })
        .then(res => {
            setCombinations(res.data);
        })
        .catch(error => alert(error.response.data));
    };

    const registerCombination = (e) => {
        e.preventDefault();
        const url = isEditing 
            ? `${baseUrl}/combination/${selectedCombination.id}/`
            : `${baseUrl}/combination/`;
        const method = isEditing ? 'post' : 'post';

        console.log("selectedCombination", selectedCombination);

        axios({
            method: method,
            url: url,
            data: {
                'combination_name': e.target.combination_name.value,
            },
            headers: {
                "Authorization": 'Bearer ' + String(auth.accessToken),
                "Content-Type": 'application/json'
            }
        })
        .then(res => {
            alert(res.data.combination_name + (isEditing ? " updated" : " created") + " successfully");
            setActiveTab('list');
            setIsEditing(false);
            setSelectedCombination({ combination_name: '' });
            fetchCombinations(); // Fetch the updated list
        })
        .catch(error => alert(error.response.data));
    };

    const handleEditCombination = (combination) => {
        setSelectedCombination(combination);
        setIsEditing(true);
        setActiveTab('add');
    };

    const handleDelete = async (id) => {
        axios.delete(`${baseUrl}/combination/${id}/delete/`, {
            headers: {
                "Authorization": 'Bearer ' + String(auth.accessToken),
                "Content-Type": 'application/json'
            }
        })
        .then(res => {
            console.log(res)
            alert("Combination Deleted Successfully")
            fetchCombinations();
        })
        .catch(error => alert(error.response.data));
    };

    const handlePageClick = ({ selected }) => {
        setCurrentPage(selected);
    };

    // Logic to display combinations for the current page
    const offset = currentPage * combPerPage;
    const currentCombinations = combinations.slice(offset, offset + combPerPage);

    return (
        <div className="JobContainer">
            <button onClick={() => navigate(-1)} className="comb-back-button">Back &gt;</button>
            <div className="grade-tabs">
                <button
                    className={activeTab === 'add' ? 'active' : ''}
                    onClick={() => {
                        setActiveTab('add');
                        setIsEditing(false);
                        setSelectedCombination({ combination_name: '' });
                    }}
                >
                    {isEditing ? "Edit Combination" : "Add Combination"}
                </button>
                <button
                    className={activeTab === 'list' ? 'active' : ''}
                    onClick={() => setActiveTab('list')}
                >
                    Combinations
                </button>
            </div>
            {activeTab === 'add' ? (
                <div className="comb-form">
                    <form onSubmit={registerCombination} className='form-element'>
                        <div className="comb-form-grid">
                            <input
                                type='text'
                                name='combination_name'
                                placeholder='Combination name'
                                value={selectedCombination.combination_name}
                                onChange={(e) => setSelectedCombination({ ...selectedCombination, combination_name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="submit-container">
                            <button type="submit">{isEditing ? "Update" : "Save"}</button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="list-container">
                    <div  className="comb-list">
                    {currentCombinations.map((combination) => (
                        <div key={combination.id} className="comb-item" onClick={() => handleEditCombination(combination)}>
                            <p>{combination.combination_name}</p>
                            {(auth.user.is_crc || auth.user.is_superuser) && (
                                <button onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(combination.id);
                                }} className="comb-delete-button">
                                   Delete
                                </button>
                            )}
                        </div>
                    ))}
                    
                      </div>
                      
                      <div className="pagination">
                    <ReactPaginate
                        previousLabel={'<'}
                        nextLabel={'>'}
                        breakLabel={'...'}
                        pageCount={Math.ceil(combinations.length / combPerPage)}
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
