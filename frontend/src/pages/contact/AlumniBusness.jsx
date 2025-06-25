import React, { useState, useEffect } from 'react';
import SearchBar from "../../components/dashboard/search-bar";
import './AlumniStoryPostForm.css';
import AlumniList from '../../components/directory/alumni-list';
import axios from 'axios';
import baseUrl from '../../api/baseUrl';
import useAuth from '../../hooks/useAuth';
import ReactPaginate from 'react-paginate';

export default function AlumniBusiness() {
    const [selectedAlumni, setSelectedAlumni] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredAlumni, setFilteredAlumni] = useState('');
    const [currentAlumni, setcCurrentAlumni] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const { auth } = useAuth();

    const [formData, setFormData] = useState({
        alumn: [],
        title: '',
        description: '',
        image: '',
        video: '',
        displayed: false,
        createdat: new Date().toISOString(),
    });

    const [submittedPosts, setSubmittedPosts] = useState([]);
    const [displayedPosts, setDisplayedPosts] = useState([]);
    const [activeTab, setActiveTab] = useState('New Business');
    const [showImageInput, setShowImageInput] = useState(false); // Track image input visibility
    const [showVideoInput, setShowVideoInput] = useState(false); // Track video input visibility

    const alumniPerPage = 4;
    const offset = currentPage * alumniPerPage;

    useEffect(() => {
        const getAlumniUsers = async () => {
            try {
                const response = await axios.get(baseUrl + '/alumnidata/?search='+searchTerm, {
                    headers: {
                        "Authorization": 'Bearer ' + String(auth.accessToken),
                    },
                    withCredentials: true,
                });
                setFilteredAlumni(response.data)
                const currentAlumni = response.data.slice(offset, offset + alumniPerPage);
                            
                setcCurrentAlumni(currentAlumni);
            } catch (err) {
                console.log(err);
            }
        };
        getAlumniUsers();
    }, [auth,offset,searchTerm]);

    const fetchStories = async () => {
        try {
            const response = await axios.get(baseUrl + '/alumni-business/', {
                headers: {
                    "Authorization": 'Bearer ' + String(auth.accessToken),
                },
                withCredentials: true,
            });
            const stories = response.data;
            const displayed = stories.filter((story) => story.displayed);
            setSubmittedPosts(stories);
            setDisplayedPosts(displayed);
            console.log(stories)
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchStories();
    }, [auth]);

    /* const filteredAlumni = currentAlumni
        .filter((alum) => {
            const fullName = `${alum.firstName || ''} ${alum.lastName || ''}`.toLowerCase().trim();
            return fullName.includes(searchTerm.toLowerCase().trim());
        })
        .sort((a, b) => a.lastName.localeCompare(b.lastName)); */


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };
    const handleSelectAlumni = (alumni) => {
        setSelectedAlumni((prev) => {
            const isSelected = prev.find((alum) => alum.id === alumni.id);
            const updatedSelection = isSelected ? prev.filter((alum) => alum.id !== alumni.id) : [...prev, alumni];
            setFormData({
                ...formData,
                alumn: updatedSelection.map((alum) => alum.id),
            });
            return updatedSelection;
        });
    };
    //console.log("SelectedAlumni",selectedAlumni,"FormData",formData)
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Create a timestamp in the format YYYYMMDDHHMMSS
            const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
            
            // Generate a new filename with timestamp
            const newFileName = `${timestamp}_${file.name}`;
            
            // Create a new file with the modified name and the same file contents
            const renamedFile = new File([file], newFileName, {
                type: file.type,
                lastModified: file.lastModified,
            });

            // Determine the appropriate field based on file type
            const fieldName = file.type.startsWith("image") ? "image" : "video";

            // Update formData with the renamed file
            setFormData({
                ...formData,
                [fieldName]: renamedFile,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation checks
        const errors = [];
        
        if (!formData.title.trim()) {
            errors.push("Title is required");
        }
        
        if (!formData.description.trim()) {
            errors.push("Description is required");
        }
        
        if (formData.alumn.length === 0) {
            errors.push("Please select at least one alumnus");
        }
        
        // If there are any errors, show alert and stop submission
        if (errors.length > 0) {
            alert(errors.join("\n"));
            return;
        }
    
        try {
            // Create a new FormData object to prepare for file upload
            const formDataToSend = new FormData();
            let alumn = formData.alumn.map(Number);
            //console.log(alumn)
            // Append each field in formData to formDataToSend
            formDataToSend.append("title", formData.title.trim());
            formDataToSend.append("description", formData.description.trim());
            formDataToSend.append("displayed", formData.displayed);
            formDataToSend.append("createdat", formData.createdat);
            formDataToSend.append("alumn", alumn);
            
            // Append image and video files only if they exist
            if (formData.image) {
                formDataToSend.append("image", formData.image);
            }
            
            if (formData.video) {
                formDataToSend.append("video", formData.video);
            }
            
            if(formData.id){
                // Send the formDataToSend object in the request
                const response = await axios.put(baseUrl + '/alumni-business/'+formData.id+'/', formDataToSend, {
                    headers: {
                        "Authorization": 'Bearer ' + String(auth.accessToken),
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: true,
                });
                console.log(response.data)
                const updatedStory = response.data;
                if (formData.displayed) {
                    setDisplayedPosts(displayedPosts.map(post => post.id === updatedStory.id ? updatedStory : post));
                } else {
                    setSubmittedPosts(submittedPosts.map(post => post.id === updatedStory.id ? updatedStory : post));
                }
        
            }else{
                // Send the formDataToSend object in the request
                const response = await axios.post(baseUrl + '/alumni-business/', formDataToSend, {
                    headers: {
                        "Authorization": 'Bearer ' + String(auth.accessToken),
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: true,
                });
        
                const newStory = response.data;
                console.log(response.data)
                // Update posts based on the displayed status
                if (formData.displayed) {
                    setDisplayedPosts([...displayedPosts, newStory]);
                } else {
                    setSubmittedPosts([...submittedPosts, newStory]);
                }
            }
            
            // Reset form data
            setFormData({
                alumn: [],
                title: '',
                description: '',
                image: '',
                video: '',
                displayed: false,
                createdat: new Date().toISOString(),
            });
            
            setSelectedAlumni({});
            alert("Submitted successfully");
            setActiveTab('Submitted Business');
        } catch (err) {
            console.error(err);
            alert("An error occurred while submitting the business story");
        }
    };
    const handleDelete = async (id) => {
        try {
          await axios.delete(baseUrl + '/alumni-business/' + id + '/', {
            headers: {
              "Authorization": 'Bearer ' + String(auth.accessToken),
              "Content-Type": 'application/json'
            }
          });
          fetchStories();
          alert("Deleted successfully");
        } catch (err) {
          console.log(err.response);
        }
      };
    

    const handlePageClick = ({ selected }) => {
        setCurrentPage(selected);
    };
    const handleEditStory = (story) => {
        // Transform the data to use firstName and lastName
        const transformedAlumni = story.alumn_details.map(alumni => ({
            ...alumni,
            firstName: alumni.first_name,
            lastName: alumni.last_name,
            // Remove the original first_name and last_name keys
            first_name: undefined,
            last_name: undefined
        }));
    
        // Set the transformed alumni details
        setSelectedAlumni(transformedAlumni);
        console.log("selectedAlumni", story.alumn_details);
        setFormData({
            id: story.id,
            alumn: story.alumn,
            title: story.title,
            description: story.description,
            image: story.image,
            video: story.video,
            displayed: story.displayed,
            createdat: new Date().toISOString(),
        });
        setActiveTab('New Business');
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'New Business':
                return (
                    <form onSubmit={handleSubmit}>
                        <div className="story-form-group">
                            <input
                                type="text"
                                id="title"
                                name="title"
                                placeholder="Title"
                                value={formData.title}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="story-form-group">
                            <textarea
                                id="description"
                                name="description"
                                placeholder="Description" 
                                value={formData.description}
                                onChange={handleInputChange}
                            ></textarea>
                        </div>
                        <div className="story-form-group media-option">
                        <div className="submit-container">
                            <button type="button" onClick={() => setShowImageInput(!showImageInput)}>
                                {showImageInput ? 'Hide Image Input' : 'Add Image'}
                            </button>
                        </div>
                            
                            {showImageInput && (
                                <input
                                    type="file"
                                    id="image"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            )}
                            <div className="submit-container">
                                <button type="button" onClick={() => setShowVideoInput(!showVideoInput)}>
                                    {showVideoInput ? 'Hide Video Input' : 'Add Video'}
                                </button>
                            </div>
                            
                            {showVideoInput && (
                                <input
                                    type="text"
                                    id="video"
                                    name="video"
                                    placeholder="Video Link"
                                    value={formData.video}
                                    onChange={handleInputChange}
                                />
                            )}
                        </div>
                        <div className="submit-container">
                            
                            <label>
                                <input
                                    type="checkbox"
                                    name="displayed"
                                    checked={formData.displayed}
                                    onChange={(e) => setFormData({ ...formData, displayed: e.target.checked })}
                                />
                                Make Displayed
                            </label>
                            <button type="submit">Submit</button>
                        </div>
                    </form>
                );
            case 'Submitted Business':
                return (
                        <div className="submitted-posts-list">
                            {submittedPosts.map((post) => (
                                <div key={post.id} className="post-item">
                                    <p onClick={() => handleEditStory(post)}>{post.title}</p>
                                    {(auth.user.is_crc || auth.user.is_superuser) && (
                                    <button onClick={() => handleDelete(post.id)} className="story-delete-button">
                                        Delete
                                    </button> 
                                            )}
                                </div>
                            ))}
                    </div>
                );
            case 'Displayed Business':
                return (
                    <div className="submitted-posts-list">
                        {displayedPosts.map((post) => (
                            <div key={post.id} className="post-item" onClick={() => handleEditStory(post)}>
                                <p>{post.title}</p>
                                {(auth.user.is_crc || auth.user.is_superuser) && (
                                <button onClick={() => handleDelete(post.id)} className="story-delete-button">
                                    Delete
                                </button>
                                )}
                            </div>
                        ))}
                    </div>
                );
            default:
                return null;
        }
    };

    const removeAlumni = (id) => {
        setSelectedAlumni(selectedAlumni.filter(alum => alum.id !== id));
    };
    return (
        <div className="alumni-story-container">
            <div className="DirectoryList">
                <div className="alumni-list-container">
                    <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search alumni..." />
                    <div className='list' >
                        <AlumniList alumni={currentAlumni} onSelect={handleSelectAlumni} />
                    </div>
                    
                    <div className='alu-paginate'>
                        <ReactPaginate
                            previousLabel={'<'}
                            nextLabel={'>'}
                            breakLabel={'...'}
                            pageCount={Math.ceil(filteredAlumni.length / alumniPerPage)}
                            marginPagesDisplayed={1}
                            pageRangeDisplayed={3}
                            onPageChange={handlePageClick}
                            containerClassName={'alu-pagination'}
                            activeClassName={'active'}
                        />

                    </div>
                </div>
            </div>
            <div className="story-form-container">
                <div className="page-title">
                    {selectedAlumni.length > 0 ? (
                        <>
                            <span>Write Alumni Business for </span>
                            {selectedAlumni.map((alum, index) => (
                                <span key={alum.id}>
                                    {alum.firstName} {alum.lastName}
                                    <button onClick={() => removeAlumni(alum.id)} style={{ marginLeft: '5px' }}>X</button>
                                    {index < selectedAlumni.length - 1 && ', '}
                                </span>
                            ))}
                        </>
                    ) : (
                        <span>Select Alumni</span>
                    )}
                </div>
                <div className="story-tabs">
                    <button
                        className={activeTab === 'New Business' ? 'active' : ''}
                        onClick={() => setActiveTab('New Business')}
                    >
                        New Business
                    </button>
                    <button
                        className={activeTab === 'Submitted Business' ? 'active' : ''}
                        onClick={() => setActiveTab('Submitted Business')}
                    >
                        Submitted Business
                    </button>
                    <button
                        className={activeTab === 'Displayed Business' ? 'active' : ''}
                        onClick={() => setActiveTab('Displayed Business')}
                    >
                        Displayed Business
                    </button>
                </div>
                <div className="tab-content">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
}
