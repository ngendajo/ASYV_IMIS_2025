import React, { useState, useEffect } from 'react';
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import baseUrl from "../../api/baseUrl";
import './AddCombination.css';
import ReactPaginate from 'react-paginate';

export default function AddEp() {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('add');
    const [eps, setEps] = useState([]);
    const [selectedEp, setSelectedEp] = useState({ title: '', type: 'A' });
    const [isEditing, setIsEditing] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const epsPerPage = 5;


    useEffect(() => {
        if (activeTab === 'list') {
            fetchEps();
        }
    }, [activeTab]);

    const fetchEps = () => {
        axios.get(baseUrl + '/ep/', {
            headers: {
                "Authorization": 'Bearer ' + String(auth.accessToken)
            }
        })
        .then(res => {
            setEps(res.data);
        })
        .catch(error => alert(error.response.data));
    };

    const registerEp = (e) => {
        e.preventDefault();
        const url = isEditing 
            ? `${baseUrl}/updateep/${selectedEp.id}/`
            : `${baseUrl}/ep/`;
        const method = isEditing ? 'post' : 'post';

        axios({
            method: method,
            url: url,
            data: {
                'title': e.target.title.value,
                'type': e.target.type.value,
            },
            headers: {
                "Authorization": 'Bearer ' + String(auth.accessToken),
                "Content-Type": 'application/json'
            }
        })
        .then(res => {
            alert(res.data.title + (isEditing ? " updated" : " created") + " successfully");
            setActiveTab('list');
            setIsEditing(false);
            setSelectedEp({ title: '', type: 'A' });
        })
        .catch(error => console.log(error.response));
    };

    const handleEditEp = (ep) => {
        console.log("ep", ep);
        setSelectedEp(ep);
        setIsEditing(true);
        setActiveTab('add');
    };

    const handleDelete = async (id) => {
        axios.delete(baseUrl + '/ep/' + id + '/delete/', {
            headers: {
                "Authorization": 'Bearer ' + String(auth.accessToken),
                "Content-Type": 'application/json'
            }
        })
        .then(res => {
            alert("EP Deleted Successfully");
            fetchEps();
            setActiveTab('list');
            setIsEditing(false);
            setSelectedEp({ title: '', type: 'A' });
        });
    };
    const handlePageClick = ({ selected }) => {
        setCurrentPage(selected);
    };

    // Logic to display combinations for the current page
    const offset = currentPage * epsPerPage;
    const currentEps = eps.slice(offset, offset + epsPerPage);

    return (
        <div className="JobContainer">
            <button onClick={() => navigate(-1)} className="comb-back-button">Back &gt;</button>
            <div className="grade-tabs">
                <button
                    className={activeTab === 'add' ? 'active' : ''}
                    onClick={() => {
                        setActiveTab('add');
                        setIsEditing(false);
                        setSelectedEp({ title: '', type: 'A' });
                    }}
                >
                    {isEditing ? "Edit EP" : "Add EP"}
                </button>
                <button
                    className={activeTab === 'list' ? 'active' : ''}
                    onClick={() => setActiveTab('list')}
                >
                    EPs
                </button>
            </div>
            {activeTab === 'add' ? (
                <div className="comb-form">
                    <form onSubmit={registerEp} className='form-element'>
                        <div className="comb-form-grid">
                            <label>
                    
                                <input
                                    type='text'
                                    name='title'
                                    placeholder='Title'
                                    value={selectedEp.title}
                                    onChange={(e) => setSelectedEp({ ...selectedEp, title: e.target.value })}
                                    required
                                />
                            </label>
                            <label>
                         
                                <select 
                                    name='type'
                                    value={selectedEp.type}
                                    onChange={(e) => setSelectedEp({ ...selectedEp, type: e.target.value })}
                                >
                                    <option value="A">Arts</option>
                                    <option value="C">Clubs</option>
                                    <option value="S">Sports</option>
                                    <option value="SC">Sciences</option>
                                    <option value="P">Professional</option>
                                </select>
                            </label>
                        </div>
                        <div className="submit-container">
                            <button type="submit">{isEditing ? "Update" : "Save"}</button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="list-container">
                <div className="submitted-jobs">
                    {currentEps.map((ep) => (
                        <div key={ep.id} className="post-item" onClick={() => handleEditEp(ep)}>
                            <p>{ep.title} - {ep.type}</p>
                            {(auth.user.is_crc || auth.user.is_superuser) && (
                                <button onClick={() => handleDelete(ep.id)} className="comb-delete-button">
                                 Delete
                                </button>
                            )}
                        </div>
                    ))}
</div>
<div className="eps-pagination">
                    <ReactPaginate
                        previousLabel={'<'}
                        nextLabel={'>'}
                        breakLabel={'...'}
                        pageCount={Math.ceil(eps.length / epsPerPage)}
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
