import axios from "axios";
import {React,useState, useEffect} from "react";
import { useParams } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import useAuth from "../../hooks/useAuth";
import { Link,useNavigate } from "react-router-dom";
import baseUrl from "../../api/baseUrl";

export default function EditBook() {
    const {auth} = useAuth();
    const navigate =useNavigate()
    const user= jwtDecode(auth.accessToken);
    const params = useParams();
    const [book_name, setBook_name] = useState('');
    const [categories, setCategories] = useState([]);
    const [category, setCategory] = useState('');
    const [authors, setAuthors] = useState([]);
    const [author, setAuthor] = useState('');
    const [isbnumber, setIsbnumber] = useState('')
    const [number_of_books,setNumber_of_books]=useState('')

    useEffect(() =>{
    
        const getbook = async () =>{
            try{
                const response = await axios.get(baseUrl+'/book/?id='+params.id,{
                    headers: {
                        "Authorization": 'Bearer ' + String(auth.accessToken),
                        "Content-Type": 'multipart/form-data'
                    },
                    withCredentials:true
                });
                let data=response.data;
                if (data && data.length > 0) {
                    setBook_name(data[0].book_name);
                    setIsbnumber(data[0].isbnumber);
                    setNumber_of_books(data[0].number_of_books);
                    setCategory(data[0].category.id);
                    setAuthor(data[0].author.id);
                  } else {
                    console.log("No data")// Handle the case when data is undefined or empty
                  }
            }catch(err) {
                console.log(err);
                //navigate('/error');
            }
        }
    
        getbook();
    
    },[auth,params])
  
    useEffect(() =>{
  
      const getcategories = async () =>{
          try{
              const response = await axios.get(baseUrl+'/category/',{
                  headers: {
                      "Authorization": 'Bearer ' + String(auth.accessToken),
                      "Content-Type": 'multipart/form-data'
                  },
                  withCredentials:true
              });
              setCategories(response.data);
          }catch(err) {
              console.log(err);
          }
      }
    
      getcategories();
    
    },[auth])
  
    useEffect(() =>{
  
      const getauthors = async () =>{
          try{
              const response = await axios.get(baseUrl+'/author/',{
                  headers: {
                      "Authorization": 'Bearer ' + String(auth.accessToken),
                      "Content-Type": 'multipart/form-data'
                  },
                  withCredentials:true
              });
              setAuthors(response.data);
          }catch(err) {
              console.log(err);
          }
      }
    
      getauthors();
    
    },[auth])
    
  let handleSubmit = (e )=> {
    e.preventDefault()
    axios.post(baseUrl+'/book/'+params.id+"/", {
        'book_name':book_name,
        'category':category,
        'author':author,
        'isbnumber':isbnumber,
        'number_of_books':number_of_books
    },
    {
        headers: {
            "Authorization": 'Bearer ' + String(auth.accessToken),
            "Content-Type": 'application/json'
        }
    }
  )
  .then(res =>{
    alert(res.data.book_name+" created successfully")
    navigate('/books')
  })
  .catch(error => alert(error.response.data))
    
  }
  const handleDelete = () => {
        
    axios.delete(baseUrl+'/book/'+params.id+'/delete/',
    {
        headers: {
            "Authorization": 'Bearer ' + String(auth.accessToken),
            "Content-Type": 'application/json'
        }
    }
    ).then(res =>{
        console.log(res)
        navigate('/books')
    })
  };
    return (
      <div className="loginform">
        {user.is_superuser ?
        <Link onClick={handleDelete} className="line" to="#">Delete Grade</Link>:
        <></>
        }
          <h2>Update a Book Form</h2>
          
          <form className='formelement' onSubmit={handleSubmit}>
            <label htmlFor="author">Enter Book Name</label>
            <input 
              className='credentials' 
              type="text"
              id="book"
              autoComplete="off" 
              onChange={(e) => setBook_name(e.target.value)}
              value={book_name}
              required
            />
            <label htmlFor="category">
                      Category
            </label>
            
            <select className='credentials'  name='category'value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="" disabled>select category</option>
                    {categories.map((e,ind) => {
                  return  <option key={ind} value={e.id}>{e.category_name}</option>
                    })}
            </select>
  
            <label htmlFor="author">
                      Author
            </label>
            
            <select className='credentials'  name='author'value={author} onChange={(e) => setAuthor(e.target.value)}>
                <option value="" disabled>select author</option>
                    {authors.map((e,ind) => {
                  return  <option key={ind} value={e.id}>{e.author_name}</option>
                    })}
            </select>
  
            <label htmlFor="isbnumber">ISBN Number</label>
            <input 
              className='credentials' 
              type="text"
              id="isbnumber"
              autoComplete="off" 
              onChange={(e) => setIsbnumber(e.target.value)}
              value={isbnumber}
              required
            />
  
            <label htmlFor="number_of_books">Number of Books</label>
            <input 
              className='credentials' 
              type="text"
              id="number_of_books"
              autoComplete="off" 
              onChange={(e) => setNumber_of_books(e.target.value)}
              value={number_of_books}
              required
            />
  
            <label htmlFor="loginbutton">
              <button className='submitbuton'>Upadate</button> 
            </label>
            <label htmlFor="create new">
              <Link to="/books" className="forgetpass">Go Back!</Link>
            </label>
      
          </form>
         </div>
    )
  }