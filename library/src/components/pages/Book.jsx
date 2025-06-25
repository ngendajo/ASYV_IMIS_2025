import axios from "axios";
import {React,useState, useEffect} from "react";
import useAuth from "../../hooks/useAuth";
import { Link,useNavigate } from "react-router-dom";
import baseUrl from "../../api/baseUrl";

export default function Book() {
  const {auth} = useAuth();
  const navigate =useNavigate()
  const [book_name, setBook_name] = useState('');
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [authors, setAuthors] = useState([]);
  const [author, setAuthor] = useState('');
  const [isbnumber, setIsbnumber] = useState('')
  const [number_of_books,setNumber_of_books]=useState('')
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  

  useEffect(() =>{
    
    const getData = async () =>{
        try{
            const response = await axios.get(baseUrl+'/book/',{
                headers: {
                    "Authorization": 'Bearer ' + String(auth.accessToken),
                    "Content-Type": 'multipart/form-data'
                },
                withCredentials:true 
            });
           
            setData(response.data);
        }catch(err) {
            console.log(err);
            //navigate('/error');
        }
    }

    getData();

},[auth])

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
  axios.post(baseUrl+'/book/', {
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
function checkIsbnumber(id){
  setIsbnumber(id)
  setFilteredData(data.filter((item) => {
    // Check if student_info exists and studentid is not null
    if (item.isbnumber) {
      return item.isbnumber.includes(id);
    }
    return false; // Exclude items without student_info or studentid
  }))
}
  return (
    <div className="loginform">
        <h2>Add a new Book Form</h2>
        
        <form className='formelement' onSubmit={handleSubmit}>
          <label htmlFor="book">Enter Book Name</label>
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
            onChange={(e) => checkIsbnumber(e.target.value)}
            value={isbnumber}
            required
          />
          {filteredData.length>0 && isbnumber!==""?
            <p className="invalid">
              {filteredData.map((bo,index)=>(
                <span key={index}>{bo.book_name}, exist with the same ISBNumber:{bo.isbnumber}.</span>
              ))}
            </p>:
            <>
              {isbnumber===""?
                <p className="invalid">
                Enter ISB Number
                </p>:
                <>
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
                    <button className='submitbuton'>Save</button> 
                  </label>
                </>
                
              }
            </>
          }
          
          
          
          <label htmlFor="create new"> 
            <Link to="/authors" className="forgetpass">Go Back!</Link>
          </label>
    
        </form>
       </div>
  )
}
