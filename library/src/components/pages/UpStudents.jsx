import React, { useState} from 'react';
import Dropzone from "react-dropzone"; 
import axios from 'axios';
import useAuth from '../../hooks/useAuth';
import baseUrl from '../../api/baseUrl';

export default function UpStudents() {
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

      const response = await axios.post(baseUrl+"/excel-students-upload/",
          formData,{
              headers: {
                  "Authorization": 'Bearer ' + String(auth.accessToken),
                  "Content-Type": 'multipart/form-data'
              },
              withCredentials:true 
          }
          )
          setMsg(response.data['msg'])
          if(response.data["error"]){
            console.log(response.data)
            setMsg("There are problem in your data")
          }
          /* .catch((error) => {
            console.error('Error uploading file:', error);
          }); */
     
          }catch(err){
              console.log(err);
          }
        }
  }

  const handleFileUpload2 = async (files) => {
    if (files.length > 0) {
    try{
      let formData = new FormData();
      
      formData.append('file', files[0]);

      const response = await axios.post(baseUrl+"/excel-alumni-upload/",
          formData,{
              headers: {
                  "Authorization": 'Bearer ' + String(auth.accessToken),
                  "Content-Type": 'multipart/form-data'
              },
              withCredentials:true 
          }
          )
          setMsg(response.data['msg'])
          console.log(response.data)
          if(response.data["error"]){
            console.log(response.data)
            setMsg("There are problem in your data")
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
        <h1>Bulk Students</h1>
              
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
        <h1>Bulk Alumni</h1>
              
        <div>
            <Dropzone onDrop={handleFileUpload2} multiple={false}> 
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

