import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import baseUrl from '../../api/baseUrl';
import MyDropzone from './MyDropzone';
import { fetchPDFNews, createPDFNews, deletePDFNews } from './pdfNewsService';
import './AddNewsForm.css';

// Form styles
const styles = {
    formContainer: {
        backgroundColor: '#f4f4f4',
        border: '2px solid #6d5736',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '400px',
        margin: 'auto',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
    },
    input: {
        width: '100%',
        padding: '10px',
        margin: '10px 0',
        border: '1px solid #957967',
        borderRadius: '4px',
    },
    fileInput: {
        margin: '10px 0',
    },
    button: {
        backgroundColor: '#498160',
        color: '#fff',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
    buttonHover: {
        backgroundColor: '#6d5736',
    },
    heading: {
        textAlign: 'center',
        color: '#d8b040',
        marginBottom: '20px',
    },
};

// News item styles
const newsStyles = {
    listItem: {
        backgroundColor: '#f4f4f4',
        border: '2px solid #6d5736',
        borderRadius: '8px',
        padding: '15px',
        margin: '10px 0',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        position: 'relative',
    },
    link: {
        color: '#498160',
        textDecoration: 'none',
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#f49c46',
        color: '#fff',
        padding: '5px 10px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
    },
    buttonHover: {
        backgroundColor: '#957967',
    },
};

const NewsForm = () => {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const newsToEdit = location.state?.news;
    const MAX_FILE_SIZE_MB = 200;

    // State management
    const [newsState, setNewsState] = useState({
        title: '',
        description: '',
        id: '',
        displayed: false,
        image: null,
        selectedFiles: undefined,
        file: null,
        activeTab: 'new',
        newsList: [],
        pdfNews: [],
        newsTitle: '',
        message: '',
        messageType: '',
        isButtonHovered: false
    });

    // Helper function to update state
    const updateNewsState = (updates) => {
        setNewsState(prev => ({ ...prev, ...updates }));
    };

    // File handling functions
    const generateFileName = (originalFile) => {
        const now = new Date();
        const dateStr = now.toISOString().replace(/[-:.TZ]/g, '').slice(0, 15);
        const nanoseconds = performance.now().toString().split('.')[1];
        return `pdf_${dateStr}_${nanoseconds}.${originalFile.name.split('.').pop()}`;
    };

    const handleFileChange = (event) => {
        if (event.target.files.length > 0) {
            const originalFile = event.target.files[0];
            const newFileName = generateFileName(originalFile);
            const modifiedFile = new File([originalFile], newFileName, { type: originalFile.type });
            updateNewsState({ selectedFiles: [modifiedFile] });
        }
    };

    const onDrop = (files) => {
        if (files.length > 0) {
            const oversizedFiles = Array.from(files).filter(file => file.size > MAX_FILE_SIZE_MB * 1024 * 1024);
            
            if (oversizedFiles.length > 0) {
                alert("Error: One or more files exceed the 200 MB size limit. Please reduce the size of the image.");
                return; // Exit the function if there are oversized files
            }
    
            updateNewsState({
                selectedFiles: files,
                file: URL.createObjectURL(files[0])
            });
        }
    };

    // API calls
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [newsResponse, pdfNewsResponse] = await Promise.all([
                    axios.get(`${baseUrl}/news`),
                    fetchPDFNews(auth)
                ]);
                
                updateNewsState({
                    newsList: newsResponse.data,
                    pdfNews: pdfNewsResponse.data
                });
            } catch (error) {
                updateNewsState({
                    message: 'Failed to load data',
                    messageType: 'error'
                });
            }
        };

        fetchInitialData();
    }, [auth]);

    useEffect(() => {
        if (newsToEdit) {
            updateNewsState({
                title: newsToEdit.title,
                description: newsToEdit.description,
                image: newsToEdit.image,
                displayed: newsToEdit.displayed,
                id: newsToEdit.id,
                activeTab: 'new'
            });
        }
    }, [newsToEdit]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (!newsState.selectedFiles) {
            updateNewsState({
                message: 'Please select a file',
                messageType: 'error'
            });
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', newsState.title);
            formData.append('description', newsState.description);
            formData.append('date', new Date().toISOString());
            formData.append('pinned', newsState.displayed);
            formData.append('user_id', auth.user.id);
            formData.append('image_url', newsState.selectedFiles[0]);

            const endpoint = newsState.id 
                ? `${baseUrl}/news/${newsState.id}/update/`
                : `${baseUrl}/news/create/`;
            
            const method = newsState.id ? 'put' : 'post';

            await axios[method](endpoint, formData, {
                headers: {
                    "Authorization": `Bearer ${auth.accessToken}`,
                    "Content-Type": 'multipart/form-data'
                },
                withCredentials: true
            });

            const newsResponse = await axios.get(`${baseUrl}/news`);
            updateNewsState({
                newsList: newsResponse.data,
                message: 'News updated successfully',
                messageType: 'success',
                activeTab: 'submitted'
            });
        } catch (error) {
            updateNewsState({
                message: 'Failed to save news',
                messageType: 'error'
            });
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${baseUrl}/news/${id}/delete`, {
                headers: {
                    "Authorization": `Bearer ${auth.accessToken}`,
                    "Content-Type": 'application/json'
                }
            });
            
            const newsResponse = await axios.get(`${baseUrl}/news`);
            updateNewsState({
                newsList: newsResponse.data,
                message: 'News deleted successfully',
                messageType: 'success'
            });
        } catch (error) {
            updateNewsState({
                message: 'Failed to delete news',
                messageType: 'error'
            });
        }
    };

    const handlePDFDelete = async (id) => {
        try {
            await deletePDFNews(id, auth);
            const pdfNewsResponse = await fetchPDFNews(auth);
            updateNewsState({
                pdfNews: pdfNewsResponse.data,
                message: 'PDF news deleted successfully',
                messageType: 'success'
            });
        } catch (error) {
            updateNewsState({
                message: 'Failed to delete PDF news',
                messageType: 'error'
            });
        }
    };

    const handlePDFUpload = async () => {
        if (!newsState.selectedFiles || !newsState.newsTitle) {
            updateNewsState({
                message: 'Please provide a title and select a PDF file',
                messageType: 'error'
            });
            return;
        }

        const formData = new FormData();
        formData.append('title', newsState.newsTitle);
        formData.append('pdf_file', newsState.selectedFiles[0]);

        try {
            await createPDFNews(formData, auth);
            const pdfNewsResponse = await fetchPDFNews(auth);
            updateNewsState({
                pdfNews: pdfNewsResponse.data,
                newsTitle: '',
                selectedFiles: undefined,
                message: 'PDF uploaded successfully',
                messageType: 'success'
            });
        } catch (error) {
            updateNewsState({
                message: 'Failed to upload PDF',
                messageType: 'error'
            });
        }
    };

    const renderNotification = () => {
        if (!newsState.message) return null;
        
        const notificationStyle = {
            padding: '10px',
            margin: '10px 0',
            borderRadius: '5px',
            color: newsState.messageType === 'success' ? 'green' : 'red',
            border: `1px solid ${newsState.messageType === 'success' ? 'green' : 'red'}`
        };
        
        return (
            <div style={notificationStyle}>
                {newsState.message}
            </div>
        );
    };

    return (
        <div className="NewsContainer">
            <div className="news-tabs">
                {['new', 'submitted', 'displayed', 'pdfnews'].map(tab => (
                    <button
                        key={tab}
                        className={newsState.activeTab === tab ? 'active' : ''}
                        onClick={() => updateNewsState({ activeTab: tab })}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>
            
            <button onClick={() => navigate(-1)} className="news-back-button">
                Back &gt;
            </button>

            {/* {renderNotification()} */}

            {newsState.activeTab === 'new' && (
                <div className="news-request-form">
                    <form onSubmit={handleSubmit}>
                        <div className="news-request-form-grid">
                            <input
                                type="text"
                                placeholder="News Title"
                                value={newsState.title}
                                onChange={(e) => updateNewsState({ title: e.target.value })}
                                required
                            />
                            <MyDropzone onDrop={onDrop} />
                        </div>
                        <textarea
                            placeholder="News Description"
                            value={newsState.description}
                            onChange={(e) => updateNewsState({ description: e.target.value })}
                            required
                        />
                        <label>
                            Displayed:
                            <input
                                type="checkbox"
                                checked={newsState.displayed}
                                onChange={(e) => updateNewsState({ displayed: e.target.checked })}
                            />
                        </label>
                        <button type="submit">Submit</button>
                    </form>
                </div>
            )}

            {(newsState.activeTab === 'submitted' || newsState.activeTab === 'displayed') && (
                <div className="submitted-news">
                    <div className="submitted-news-list">
                        {newsState.newsList
                            .filter(post => newsState.activeTab === 'submitted' || post.pinned)
                            .map((post) => (
                                <div
                                    key={post.id}
                                    style={newsStyles.listItem}
                                    onClick={() => updateNewsState({
                                        title: post.title,
                                        description: post.description,
                                        image: post.image,
                                        displayed: post.displayed,
                                        id: post.id,
                                        activeTab: 'new'
                                    })}
                                >
                                    <span style={newsStyles.link}>{post.title}</span>
                                    {(auth.user.is_crc || auth.user.is_superuser) && (
                                        <button
                                            style={newsStyles.button}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(post.id);
                                            }}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {newsState.activeTab === 'pdfnews' && (
                <div className="pdf-news-section">
                    <h2>News Letters</h2>
                    {(auth.user.is_crc || auth.user.is_superuser) && (
                        <div style={styles.formContainer}>
                            <h2 style={styles.heading}>Upload News Letter</h2>
                            <input
                                type="text"
                                value={newsState.newsTitle}
                                onChange={(e) => updateNewsState({ newsTitle: e.target.value })}
                                placeholder="News Title"
                                style={styles.input}
                            />
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept=".pdf"
                                style={{ ...styles.input, ...styles.fileInput }}
                            />
                            <button
                                style={{
                                    ...styles.button,
                                    ...(newsState.isButtonHovered ? styles.buttonHover : {})
                                }}
                                onMouseEnter={() => updateNewsState({ isButtonHovered: true })}
                                onMouseLeave={() => updateNewsState({ isButtonHovered: false })}
                                onClick={handlePDFUpload}
                            >
                                Upload
                            </button>
                        </div>
                    )}
                    
                    <div className="pdf-list">
                        {newsState.pdfNews.map((news) => (
                            <div
                                key={news.id}
                                style={newsStyles.listItem}
                                onClick={() => window.open(news.pdf_file, '_blank', 'noopener noreferrer')}
                            >
                                <span style={newsStyles.link}>{news.title}</span>
                                {(auth.user.is_crc || auth.user.is_superuser) && (
                                    <button
                                        style={newsStyles.button}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePDFDelete(news.id);
                                        }}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {renderNotification()}
        </div>
    );
};

export default NewsForm;