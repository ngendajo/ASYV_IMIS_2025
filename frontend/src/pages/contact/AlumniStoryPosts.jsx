import React, { useState, useEffect } from 'react';
import SearchBar from "../../components/dashboard/search-bar"
import './AlumniStoryPostForm.css';
import AlumniList from '../../components/directory/alumni-list';
import axios from 'axios';
import baseUrl from '../../api/baseUrl';
import baseUrlforImg from '../../api/baseUrlforImg';
import useAuth from '../../hooks/useAuth';
import ReactPaginate from 'react-paginate';

const AlumniStoryPostForm = () => {
    const [selectedAlumni, setSelectedAlumni] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [alumniData, setAlumniData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const { auth } = useAuth();

    const [formData, setFormData] = useState({
        alumn: '',
        title: '',
        description: '',
        media: null,
        draft: false,// not a business
        displayed: false
    });

   
    const [submittedPosts, setSubmittedPosts] = useState([]);
    const [displayedPosts, setDisplayedPosts] = useState([]);
    const [activeTab, setActiveTab] = useState('New Story');

    useEffect(() => {
        const getAlumniUsers = async () => {
            try {
                const response = await axios.get(baseUrl + '/alumnilist/', {
                    headers: {
                        "Authorization": 'Bearer ' + String(auth.accessToken),
                        "Content-Type": 'multipart/form-data'
                    },
                    withCredentials: true
                });
                console.log("response", response.data);
                var alumniList = [];
                response.data.forEach(element => {
                    alumniList.push({
                        id: element.alumn_id,
                        profilePic: baseUrlforImg + "/media/" + element.image_url,
                        email: element.email,
                        firstName: element.first_name,
                        lastName: element.last_name,
                        gradeName:element.grade_name,
                        familyName:element.family_name,
                        combinationName:element.combination_name

                    });
                });
                setAlumniData(alumniList);
            } catch (err) {
                console.log(err);
            }
        };
        getAlumniUsers();
    }, [auth]);


    
        const fetchStories = async () => {
            try {
                const response = await axios.get(baseUrl + '/stories/', {
                    headers: {
                        "Authorization": 'Bearer ' + String(auth.accessToken),
                    },
                    withCredentials: true
                });
                const storiesandbusiness = response.data;

                const stories = storiesandbusiness.filter(story => !story.draft);
                const displayed = stories.filter(story => story.displayed);
              
                setSubmittedPosts(stories);
                setDisplayedPosts(displayed);
            } catch (err) {
                console.error(err);
            }
        };
        fetchStories();

        useEffect(() => {
            fetchStories();
        }, [auth]);

    const filteredAlumni = alumniData
        .filter((alum) => {
            const fullName = `${alum.firstName || ''} ${alum.lastName || ''}`.toLowerCase().trim();
            return fullName.includes(searchTerm.toLowerCase().trim());
        })
        .sort((a, b) => a.lastName.localeCompare(b.lastName));

        const alumniPerPage = 4;
        const offset = currentPage * alumniPerPage;
        const currentAlumni = filteredAlumni.slice(offset, offset + alumniPerPage);

 

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleFileChange = (e) => {
        const { files } = e.target;
        setFormData({
            ...formData,
            media: files[0]
        });
    };

    const handleSubmit = async (e, draftStatus) => {
        e.preventDefault();
        const data = new FormData();
        data.append('alumn', formData.alumn);
        data.append('title', formData.title);
        data.append('description', formData.description);
        if (formData.media) {
            const mediaType = formData.media.type.startsWith('image') ? 'image' : 'video';
            data.append(mediaType, formData.media);
            console.log("mediaType", mediaType);
        }
        data.append('draft', draftStatus);
        data.append('displayed', formData.displayed);

        for (let pair of data.entries()) {
            console.log(`${pair[0]}: ${pair[1]}`);
        }
        try {
            let response;
            console.log("form:", formData);
            if (formData.id) {
                response = await axios.put(`${baseUrl}/stories/${formData.id}/`, data, {
                    headers: {
                        "Authorization": 'Bearer ' + String(auth.accessToken),
                        "Content-Type": 'multipart/form-data'
                    },
                    withCredentials: true
                });
                const updatedStory = response.data;
                if (formData.displayed) {
                    setDisplayedPosts(displayedPosts.map(post => post.id === updatedStory.id ? updatedStory : post));
                } else {
                    setSubmittedPosts(submittedPosts.map(post => post.id === updatedStory.id ? updatedStory : post));
                }
            } else {
                response = await axios.post(baseUrl + '/stories/', data, {
                    headers: {
                        "Authorization": 'Bearer ' + String(auth.accessToken),
                        "Content-Type": 'multipart/form-data'
                    },
                    withCredentials: true
                });
                const newStory = response.data;
                if (formData.displayed) {
                    setDisplayedPosts([...displayedPosts, newStory]);
                    setActiveTab('Submitted Posts');
                } else {
                    setSubmittedPosts([...submittedPosts, newStory]);
                    setActiveTab('Submitted Posts');
                }
            }
            alert("submitted successfully"); } catch (err) {
            console.log(err);
        }
    };

    const handleEditStory = (story) => {
        //selectedAlumni.firstName = story.firstName;
        //console.log("story", story);
        setFormData({
            id: story.id,
            alumn: story.alumn,
            title: story.title,
            description: story.description,
            media: null,
            draft: story.draft,
            displayed: story.displayed
        });
        setSelectedAlumni(alumniData.find(alumni => parseInt(alumni.id) === parseInt(story.alumn)));
        setActiveTab('New Story');
    };

    const handleReset = () => {
        setFormData({
            alumn: '',
            title: '',
            description: '',
            media: null,
            draft: false,// not a business
            displayed: false
        });
        setSelectedAlumni(null);
        alert("Select an Alumni")
    };

    const handleDelete = async (id) => {
        try {
          await axios.delete(baseUrl + '/stories/' + id + '/', {
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

    const renderTabContent = () => {
        switch (activeTab) {
            case 'New Story':
                return (
                    <form onSubmit={(e) => handleSubmit(e, false)}>
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

                            <input
                                type="file"
                                id="media"
                                placeholder="Image or Video"
                                name="media"
                                accept="image/*,video/*"
                                onChange={handleFileChange}
                            />
                        </div>
                        <div className="submit-container">
                            {auth.user.is_crc || auth.user.is_superuser ? (
                                <>
                                     <>
                                <button type="submit" onClick={(e) => handleSubmit(e, false)}>Submit</button>
                                <button type="button" onClick={handleReset}>Reset</button>
                            </>
                                    <div className="story-form-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="displayed"
                                    checked={formData.displayed}
                                    onChange={(e) => setFormData({ ...formData, displayed: e.target.checked })}
                                />
                                Make Displayed
                            </label>
                        </div>
                                </>
                            ) : (
                                <>
                                <button type="submit" onClick={(e) => handleSubmit(e, false)}>Submit</button>
                                <button type="button" onClick={handleReset}>Reset</button>
                            </>
                                
                            )}
                        </div>
                    </form>
                );
            case 'Displayed Posts':
                return (
                    <div className="submitted-posts-list">
                        {displayedPosts.map((post) => (
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

                case 'Submitted Posts':
                    return (
                        <div className="submitted-posts-list">
                            {submittedPosts.map((post) => (
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

    const handlePageClick = ({ selected }) => {
        setCurrentPage(selected);
    };


    return (
        <div className="alumni-story-container">
             <div className="DirectoryList">
            <div className="alumni-list-container">
                <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search alumni..." className="search-bar" />
                <div className="directory">
                    <div className='list' >
                    <AlumniList alumni={currentAlumni} onSelect={(alumni) => {
                        setSelectedAlumni(alumni);
                        setFormData({ ...formData, alumn: alumni.id });
                        console.log("alumn_id", alumni.id);
                    }} />

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
            </div>
            <div className="story-form-container">
            <div className="page-title">
                    {selectedAlumni ? `Write Alumni Story for ${selectedAlumni.firstName} ${selectedAlumni.lastName}  ` : 'Add Alumni Story'}
                </div>
                <div className="story-tabs">
                    <button onClick={() => setActiveTab('New Story')} className={activeTab === 'New Story' ? 'active' : ''}>New Story</button>
                    {(auth.user.is_crc || auth.user.is_superuser) && (
                        <>
                    <button onClick={() => setActiveTab('Submitted Posts')} className={activeTab === 'Submitted Posts' ? 'active' : ''}>Submitted Posts</button>
                    <button onClick={() => setActiveTab('Displayed Posts')} className={activeTab === 'Displayed Posts' ? 'active' : ''}>Displayed Posts</button>

                    </>
                    )}


                </div>
                <div className="tab-content">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default AlumniStoryPostForm;
