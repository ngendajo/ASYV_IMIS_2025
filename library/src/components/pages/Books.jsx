import React, {useState, useEffect} from 'react'
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import { Link } from 'react-router-dom';
import { BiEditAlt } from "react-icons/bi";
import baseUrl from "../../api/baseUrl";
import DynamicTable from "./dinamicTable/DynamicTable";

export default function Books() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingpdf, setLoadingpdf] = useState(false);
    let {auth} = useAuth();

    useEffect(() =>{
    
        const getData = async () =>{
            try{
                const response = await axios.get(baseUrl+'/books/',{
                    headers: {
                        "Authorization": 'Bearer ' + String(auth.accessToken),
                        "Content-Type": 'multipart/form-data'
                    },
                    withCredentials:true 
                });
                var booklist=[]
                var i=1
                setLoading(false);
                response.data.forEach(e=>{
                    booklist.push({
                    No:i,
                    book_name:e.book_name,
                    ISBN_NUMBER:e.isbnumber,
                    Category:e.category_name,
                    Author:e.author_name,
                    Number_of_books:e.number_of_books,
                    Edit:<span>
                        <Link to={`/book/${e.id}`}><BiEditAlt className='icon'/></Link>
                    </span>
                })
                i=i+1
                })
                setData(booklist);
            }catch(err) {
                console.log(err);
                //navigate('/error');
            }
        }
    
        getData();
    
    },[auth])
    const bookReprtpdf = async () => {
      setLoadingpdf(true);
      try {
        const response = await axios.get(baseUrl + '/exportbooks/', {
          headers: {
            "Authorization": 'Bearer ' + String(auth.accessToken),
            "Content-Type": 'application/pdf', // Set correct content type
          },
          responseType: 'blob', // Set response type to blob
          withCredentials: true
        });
    
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'list_of_books.pdf');
        document.body.appendChild(link);
        link.click();
        setLoadingpdf(false);
      } catch (err) {
        console.error('Error exporting books:', err);
        setLoadingpdf(false);
      }
    }
  return (
    <div>
      <center><h2 >Averable Books <button className="prenext" onClick={bookReprtpdf} disabled={loadingpdf}>{loadingpdf ? 'Exporting...' : 'Export Books in PDF'}</button></h2></center>
        {loading ? (
          <p>Loading...</p>
        ) : (
              <DynamicTable mockdata={data} /> 
          )
        }
    </div>
  )
}
