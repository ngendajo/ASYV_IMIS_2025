import React, {useState, useEffect} from 'react'
import { useParams } from "react-router-dom";
import moment from 'moment';
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';
import baseUrl from "../../api/baseUrl";

export default function ReturnBook() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const params = useParams();
    let {auth} = useAuth();
    const [returnDate, setReturnDate] = useState(new Date()); // Fixed typo
    const [isLoading, setIsLoading] = useState(false);

    // Remove the unnecessary setInterval - set return date once when component mounts
    useEffect(() => {
        setReturnDate(new Date());
    }, []);
  
    useEffect(() => {
        const getData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                console.log('Making API request to:', baseUrl + '/issue-book-detail/' + params.id);
                console.log('Auth token:', auth.accessToken ? 'Present' : 'Missing');
                
                const response = await axios.get(baseUrl + '/issue-book-detail/' + params.id, {
                    headers: {
                        "Authorization": 'Bearer ' + String(auth.accessToken)
                    },
                    withCredentials: true 
                });
                
                console.log('Full API Response:', response);
                console.log('Response data:', response.data);
                console.log('Response data type:', typeof response.data);
                
                // Check different possible response structures
                if (response.data.results) {
                    console.log('Using response.data.results:', response.data.results);
                    setData(response.data.results);
                } else if (response.data) {
                    console.log('Using response.data directly:', response.data);
                    setData(response.data);
                } else {
                    console.log('No data found in response');
                    setData(null);
                }
                
            } catch(err) {
                console.log('API Error:', err);
                console.log('Error response:', err.response?.data);
                console.log('Error status:', err.response?.status);
                setError(err.message || 'Failed to load book details');
                setData(null);
            } finally {
                setLoading(false);
            }
        }
    
        if (auth.accessToken && params.id) {
            getData();
        } else {
            console.log('Missing auth token or params.id');
            setLoading(false);
            setError('Missing authentication or book ID');
        }
    }, [auth, params, navigate]);

    const confirmReturn = async (id) => {
        setIsLoading(true);
        try {
            // Format date properly for backend
            const formattedDate = moment(returnDate).format('M/D/YYYY HH:mm');
            
            const response = await axios.patch(baseUrl + '/issue/' + id + "/",
                JSON.stringify({
                    returndate: formattedDate // Use formatted date string
                }),
                {
                    headers: { 
                        "Authorization": 'Bearer ' + String(auth.accessToken),
                        'Content-Type': 'application/json' 
                    },
                    withCredentials: true
                }
            );
            
            alert("Book Returned Successfully");
            console.log(response.data);
            navigate("/issued");
        } catch(err) {
            console.log(err);
            alert("Error returning book. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    // Debug: Log data changes
    useEffect(() => {
        console.log('Data changed:', data);
    }, [data]);

    return (
        <center className='formelement'>
            <h2>Return a Book</h2>
            <h3>{moment(returnDate).format("Do MMMM YYYY, h:mm:ss a")}</h3>
            {loading ? (
                <div>
                    <p>Loading book details...</p>
                </div>
            ) : error ? (
                <div>
                    <p style={{color: 'red'}}>Error: {error}</p>
                    <p>Check the console for more details.</p>
                </div>
            ) : data && Object.keys(data).length > 0 ? (
                <div>
                    <p><strong>Student: </strong>{data.first_name} {data.rwandan_name}</p>
                    <p>
                        <strong>From</strong> {data.grade_name} <strong>Grade</strong> {data.family_name} <strong>Family</strong> {data.combination_name} <strong>Class</strong>
                    </p>
                    <p>
                        <strong>Book returned: </strong>{data.book_name} {data.author_name} <strong>Author, from</strong> {data.category_name} <strong>Category</strong>
                    </p>
                    <p><strong>Issued on </strong>{moment(data.issuedate, "M/D/YYYY HH:mm").format("Do MMMM YYYY, h:mm:ss a")}</p>

                    {data.returndate === "Not yet Returned" ? (
                        <label htmlFor="loginbutton">
                            <button 
                                onClick={() => confirmReturn(data.issue_id)} 
                                className='submitbuton'
                                disabled={isLoading}
                            >
                                {isLoading ? 'Processing...' : 'Save Return a Book'}
                            </button>
                        </label>
                    ) : (
                        <p><strong>Returned on </strong>{moment(data.returndate, "M/D/YYYY HH:mm").format("Do MMMM YYYY, h:mm:ss a")}</p>
                    )}
                </div>
            ) : (
                <div>
                    <p>No book details found.</p>
                    <p>Data received: {JSON.stringify(data, null, 2)}</p>
                </div>
            )}
        
            <label htmlFor="create new">
                <Link to="/issued" className="forgetpass">Go Back!</Link>
            </label> 
        </center>
    )
}