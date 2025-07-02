import React, { useState} from 'react';
import Dropzone from "react-dropzone"; 
import axios from 'axios';
import useAuth from '../../hooks/useAuth';
import baseUrl from '../../api/baseUrl';

export default function UpIssue() {
 
    const [msg,setMsg]=useState("");
  
    const {auth} = useAuth(); 
    
      /* const exportExcelToUse = async () => {
          const response = await fetch(baseUrl+'/export-excel/');
          const blob = await response.blob();
  
          const url = window.URL.createObjectURL(new Blob([blob]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'bulk_alumni_reg_template.xlsx');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      }; */
 
  const handleFileUpload = async (files) => {
    if (files.length > 0) {
    try{
      let formData = new FormData();
      
      formData.append('file', files[0]);

      const response = await axios.post(baseUrl+"/excel-issue-upload/",
          formData,{
              headers: {
                  "Authorization": 'Bearer ' + String(auth.accessToken),
                  "Content-Type": 'multipart/form-data'
              },
              withCredentials:true 
          }
          )
          console.log(response.data)
          if(response.data["error"]){
            setMsg("There are some problems")
          }
          if(response.data["msg"]){
            setMsg(response.data["msg"])
          }
          /* .catch((error) => {
            console.error('Error uploading file:', error);
          }); */
     
          }catch(err){
              console.log(err);
          }
        }
  }

      
 
  return (
    <div className='formelement'>
      <h1>Bulk Issued Books</h1>
              
      <div>
        <Dropzone onDrop={handleFileUpload} multiple={false}> 
          {({ getRootProps, getInputProps }) => (
          <section>
              <div {...getRootProps({ className: "dropzone" })}>
              <input {...getInputProps()} />
                      
                    <span><strong className="browse">Browse</strong> <strong>a excel .xlsx file</strong><br/> or drag and drop</span>
                
                </div>
            </section>
            )}
        </Dropzone>
      </div>
      <div className="invalid">
        <h2>{msg}</h2>
      </div>
    </div>
  )
}

