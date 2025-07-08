import axios from "axios";
import React, { useState, useEffect } from "react";
import moment from 'moment';
import useAuth from "../../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import baseUrl from "../../api/baseUrl";

export default function Issue() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  
  // State variables
  const [bookid, setBookid] = useState('');
  const [filteredData, setFilteredData] = useState(null);
  const [library_number, setLibrary_number] = useState('');
  const [library_numberOptions, setLibrary_numberOptions] = useState([]);
  const [book_name, setBook_name] = useState('');
  const [studentid, setStudentid] = useState('');
  const [isbnumber, setIsbnumber] = useState('');
  const [isbnumberInput, setIsbnumberInput] = useState(''); // For maintaining input value
  const [studentidInput, setStudentidInput] = useState(''); // For maintaining input value
  const [issuedate, setIssuedate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update current time every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      setIssuedate(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Reset book data when student changes
  useEffect(() => {
    if (!studentid) {
      resetBookData();
    }
  }, [studentid]);

  const resetBookData = () => {
    setBookid('');
    setBook_name('');
    setIsbnumber('');
    setIsbnumberInput('');
    setLibrary_number('');
    setLibrary_numberOptions([]);
  };

  const getstudent = async (id) => {
    if (!id.trim()) {
      setStudentid('');
      setFilteredData(null);
      setError('');
      return;
    }

    setStudentid(id);
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`${baseUrl}/kid-books/${id}/`, {
        headers: {
          "Authorization": `Bearer ${auth.accessToken}`,
          "Content-Type": 'application/json'
        },
        withCredentials: true 
      });
      
      setFilteredData(response.data);
    } catch (err) {
      console.error('Error fetching student:', err);
      setError('Student not found or error occurred');
      setFilteredData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentInputChange = (e) => {
    const value = e.target.value;
    setStudentidInput(value);
  };

  const handleStudentInputBlur = (e) => {
    const value = e.target.value;
    getstudent(value);
  };

  const getbook = async (id) => {
    if (!id.trim()) {
      resetBookData();
      return;
    }

    setIsbnumber(id);
    setLoading(true);
    setError('');
    
    try {
      // Fetch book details
      const bookResponse = await axios.get(`${baseUrl}/book/?isbnumber=${id}`, {
        headers: {
          "Authorization": `Bearer ${auth.accessToken}`,
          "Content-Type": 'application/json'
        },
        withCredentials: true
      });

      // Fetch library numbers
      const libraryResponse = await axios.get(`${baseUrl}/library-numbers/${id}/`, {
        headers: {
          "Authorization": `Bearer ${auth.accessToken}`,
          "Content-Type": 'application/json'
        },
        withCredentials: true
      });

      // Process library numbers
      const borrowedLibraryNumbers = [];
      if (libraryResponse.data?.results && Array.isArray(libraryResponse.data.results)) {
        libraryResponse.data.results.forEach(item => {
          if (item.library_number) {
            borrowedLibraryNumbers.push(parseInt(item.library_number, 10));
          }
        });
      }

      const bookData = bookResponse.data;
      if (bookData && bookData.length > 0) {
        const book = bookData[0];
        setBookid(book.id);
        setBook_name(book.book_name);
        
        // Generate available library numbers
        const totalBooks = book.number_of_books;
        const allNumbers = Array.from({ length: totalBooks }, (_, index) => index + 1);
        const availableNumbers = allNumbers.filter(num => !borrowedLibraryNumbers.includes(num));
        
        setLibrary_numberOptions(availableNumbers);
        setLibrary_number(''); // Reset selection
      } else {
        resetBookData();
        setError('Book not found in database');
      }
    } catch (err) {
      console.error('Error fetching book:', err);
      setError('Error fetching book details');
      resetBookData();
    } finally {
      setLoading(false);
    }
  };

  const handleBookInputChange = (e) => {
    const value = e.target.value;
    setIsbnumberInput(value);
  };

  const handleBookInputBlur = (e) => {
    const value = e.target.value;
    getbook(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const borrowerId = e.target.borrower?.value;
    
    // Validation
    if (!bookid || !borrowerId || !library_number || !issuedate) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    
    try {
      await axios.post(`${baseUrl}/issue/`, {
        book: bookid,
        borrower: borrowerId,
        library_number: library_number,
        issuedate: issuedate,
        returndate: "Not yet Returned"
      }, {
        headers: {
          "Authorization": `Bearer ${auth.accessToken}`,
          "Content-Type": 'application/json'
        },
        withCredentials: true
      });
      
      alert("Book issued successfully");
      navigate('/issued');
    } catch (error) {
      console.error('Issue error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to issue book';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const canBorrowBook = () => {
    if (!filteredData) return false;
    
    // Check if student has 2 or more books
    if (filteredData.no_books > 1) return false;
    
    // Check for overdue books
    const hasOverdueBooks = filteredData.issued_books?.some(book => {
      const daysPassed = Math.floor(
        (issuedate.getTime() - new Date(book.issuedate).getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysPassed > 28;
    });
    
    return !hasOverdueBooks;
  };

  const renderStudentInfo = () => {
    if (loading) return <p>Loading student information...</p>;
    
    if (!studentid) return <p className="invalid">Enter a valid student ID</p>;
    
    if (!filteredData) return <p className="invalid">Student not found</p>;

    const student = filteredData;
    
    return (
      <div>
        <label>
          {student.first_name} {student.rwandan_name}, Student ID: {student.reg_number}, 
          From {student.grade_name} Grade, {student.family_name} Family, {student.combination_name} Class
          <input type="hidden" name="borrower" value={student.user_id} />
        </label>
        
        <label className="invalid">Number of Books you have: {student.no_books}</label>

        {student.no_books > 0 && (
          <div className="invalid">
            {student.issued_books?.map((book, index) => {
              const daysPassed = Math.floor(
                (issuedate.getTime() - new Date(book.issuedate).getTime()) / (1000 * 60 * 60 * 24)
              );
              
              return (
                <div key={index}>
                  {index + 1}. {book.book_name}, ISB: {book.isbnumber}, 
                  Library number: {book.library_number}, 
                  Issued Date: {moment(book.issuedate).format("Do MMMM YYYY, h:mm:ss a")}, 
                  Days passed: {daysPassed}
                </div>
              );
            })}
          </div>
        )}

        {student.no_books > 1 ? (
          <span className="invalid">
            You have <strong>two or more books</strong>. You are not allowed to borrow another book.
          </span>
        ) : (
          <>
            {!canBorrowBook() ? (
              <span className="invalid">You have overdue books</span>
            ) : (
              renderBookSelection()
            )}
          </>
        )}
      </div>
    );
  };

  const renderBookSelection = () => (
    <>
      <label>Enter a Valid ISB Number</label>
      <input
        className="credentials"
        type="text"
        id="book"
        value={isbnumberInput}
        onChange={handleBookInputChange}
        onBlur={handleBookInputBlur}
        autoComplete="off"
        disabled={loading}
        required
      />
      
      {isbnumber && (
        <>
          {library_numberOptions.length > 0 ? (
            <>
              <span>
                {book_name}<br />
                ISB Number: {isbnumber}
              </span>
              <br />
              <select
                className="credentials"
                value={library_number}
                onChange={(e) => setLibrary_number(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select Book Number
                </option>
                {library_numberOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <span className="invalid">
              {book_name ? 'All copies of this book are currently borrowed.' : 'Book not found in database'}
            </span>
          )}
        </>
      )}
    </>
  );

  const isFormValid = () => {
    return bookid && library_number && filteredData?.user_id && canBorrowBook();
  };

  return (
    <div className="loginform">
      <h2>Issue a New Book Form</h2>
      <p>Current Date and Time: {moment(issuedate).format("Do MMMM YYYY, h:mm:ss a")}</p>
      
      {error && <p className="error">{error}</p>}
      
      <form className="formelement" onSubmit={handleSubmit}>
        <label htmlFor="studentid">Enter Student ID</label>
        <input 
          className="credentials" 
          type="text"
          id="studentid"
          value={studentidInput}
          onChange={handleStudentInputChange}
          onBlur={handleStudentInputBlur}
          autoComplete="off" 
          disabled={loading}
          required
        />
        
        <div>
          {renderStudentInfo()}
        </div>

        {isFormValid() && (
          <label htmlFor="submitbutton">
            <button 
              className="submitbuton" 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button> 
          </label>
        )}
        
        <label htmlFor="goback"> 
          <Link to="/issued" className="forgetpass">Go Back!</Link>
        </label>
      </form>
    </div>
  );
}