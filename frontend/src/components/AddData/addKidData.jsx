import React, { useState, useEffect } from 'react';
import axios from 'axios';
import baseUrl from '../../api/baseUrl'; // adjust this path as needed

const AddStudents = () => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [showSingleStudentForm, setShowSingleStudentForm] = useState(false);
  const [cityOther, setCityOther] = useState(false);
  const [countryOther, setCountryOther] = useState(false);
  const [families, setFamilies] = useState([])

  useEffect(() => {
    axios.get(baseUrl + '/families/')
      .then(res => {
        setFamilies(res.data);
      })
      .catch(err => {
        console.error("Failed to fetch families", err);
      });
  }, []);


  const initialFormData = {
    username: '',
    reg_number: '',
    first_name: '',
    rwandan_name: '',
    gender: '',
    dob: '',
    phone: '',
    phone1: '',
    email: '',
    email1: '',
    password: '',
    password_confirm: '',
    family: '',
    graduation_status: '',
    origin_district: '',
    origin_sector: '',
    current_city: '',
    other_city: '',
    current_country: '',
    other_country: '',
    health_issue: '',
    marital_status: '',
    life_status: '',
    has_children: '',
    points_in_national_exam: '',
    maximum_points_in_national_exam: '',
    mention: ''
  };
  const [formData, setFormData] = useState(initialFormData)
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle boolean conversion for has_children
    if (name === 'has_children') {
      setFormData({ ...formData, [name]: value === 'true' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCityChange = (e) => {
    const value = e.target.value;
    setCityOther(value === 'other');
    setFormData({ ...formData, current_city: value });
  };

  const handleOtherCityChange = (e) => {
    setFormData({ ...formData, other_city: e.target.value });
  };

  const handleCountryChange = (e) => {
    const value = e.target.value;
    setCountryOther(value === 'other');
    setFormData({ ...formData, current_country: value });
  };

  const handleOtherCountryChange = (e) => {
    setFormData({ ...formData, other_country: e.target.value });
  };

  const [excelFiles, setExcelFiles] = useState({
    marks: null,
    employment: null,
    combination: null, 
    leap: null,
    furtherEducation: null,
  });
  
  const handleExcelUpload = (e, type) => {
    setExcelFiles(prev => ({
      ...prev,
      [type]: e.target.files[0]
    }));
  };
  
  const submitExcel = async (type) => {
    if (!excelFiles[type]) {
      alert("Please select a file first.");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", excelFiles[type]);
  
    const endpoints = {
      marks: `${baseUrl}/upload-marks/`,
      combination: `${baseUrl}/upload-combination-xlsx/`,
      leap: `${baseUrl}/upload-leap-xlsx/`,
      employment: `${baseUrl}/upload-employment/`,
      furtherEducation: `${baseUrl}/upload-further-education/`,
    };
  
    try {
      await axios.post(endpoints[type], formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(`${type.toUpperCase()} upload successful!`);
    } catch (err) {
      console.error(err);
      alert(`Failed to upload ${type} file.`);
    }
  };
  

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select an Excel file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadStatus("Uploading...");
      const res = await axios.post(`${baseUrl}/kids-data-upload-xlsx/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadStatus("Upload successful!");
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadStatus("Upload failed. Check console.");
    }
  };

  const handleAddStudent = async () => {
    if (!formData.username || !formData.password || formData.password !== formData.password_confirm) {
      alert("Please fill all required fields and ensure passwords match.");
      return;
    }
  
    // Handle city and country override
    const city = formData.current_city === "other" ? formData.other_city : formData.current_city;
    const country = formData.current_country === "other" ? formData.other_country : formData.current_country;
  
    // Extract user-related fields from formData (adjust keys as needed)
    const userPayload = {
      username: formData.username,
      password: formData.password,
      password_confirm: formData.password_confirm,
      email: formData.email,       // example, include email if relevant
      phone: formData.phone,       // etc.
      reg_number: formData.reg_number,
      first_name: formData.first_name,
      rwandan_name: formData.rwandan_name,
      gender: formData.gender,
      is_student: true,
    };
  
    // Extract kid-specific fields from formData
    // For example, reg_number, first_name, rwandan_name, gender, etc.
    const kidPayload = {
      current_district_or_city: city,
      current_county: country,
      origin_district: formData.origin_district, 
      origin_sector: formData.origin_sector,
      marital_status: formData.marital_status, 
      life_status: formData.life_status, 
      has_children: formData.has_children,
      family: parseInt(formData.family),
      graduation_status: formData.graduation_status,
      // add other kid-specific fields here
    };
  
    // Compose final payload with nested user
    const payload = {
      user: userPayload,
      ...kidPayload,
    };

    console.log("paylod kid", payload)
  
    try {
      const res = await axios.post(`${baseUrl}/kids/`, payload);
      alert("Student added successfully!");
      setFormData(initialFormData); // reset form if needed
    } catch (err) {
      console.error(err);
      alert("Failed to add student.");
    }
  };

  const [hasChildren, setHasChildren] = useState(null);

  return (
        <div className="form-section">
          {/* Bulk Upload Options */}
          <div className="excel-upload-section">
            <h4>Bulk Upload Options</h4>

            {/* 1. Upload Basic Student Info */}
            <div className="upload-block">
              <label>Upload Students Excel File</label>
              <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
              <button onClick={handleUpload}>Upload Basic Info</button>
              <a href="/templates/students_template.xlsx" download className="download-template">
                Download Template
              </a>
              {uploadStatus && <p>{uploadStatus}</p>}
            </div>

            {/* 2. Upload Marks */}
            <div className="upload-block">
              <label>Upload Marks Excel File</label>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={(e) => handleExcelUpload(e, 'marks')}
              />
              <button onClick={() => submitExcel('marks')}>Upload Marks</button>
              <a href="/templates/marks_template.xlsx" download className="download-template">
                Download Template
              </a>
            </div>

            {/* 3. Upload Combination */}
            <div className="upload-block">
              <label>Upload Combination Excel File</label>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={(e) => handleExcelUpload(e, 'combination')}
              />
              <button onClick={() => submitExcel('combination')}>Upload Combination</button>
              <a href="/templates/combination_template.xlsx" download className="download-template">
                Download Template
              </a>
            </div>

            {/* 4. Upload LEAP Data */}
            <div className="upload-block">
              <label>Upload LEAP Excel File</label>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={(e) => handleExcelUpload(e, 'leap')}
              />
              <button onClick={() => submitExcel('leap')}>Upload LEAP</button>
              <a href="/templates/leap_template.xlsx" download className="download-template">
                Download Template
              </a>
            </div>

            {/* Employment upload */}
            <div className="upload-block">
              <label>Upload Employment Excel File</label>
              <div className="upload-actions">
                <input type="file" accept=".xlsx, .xls" onChange={(e) => handleExcelUpload(e, 'employment')} />
                <button onClick={() => submitExcel('employment')}>Upload Employment</button>
                <a href="/templates/employment_template.xlsx" download className="download-template">
                  Download Template
                </a>
              </div>
            </div>

            {/* Further Education upload */}
            <div className="upload-block">
              <label>Upload Further Education Excel File</label>
              <div className="upload-actions">
                <input type="file" accept=".xlsx, .xls" onChange={(e) => handleExcelUpload(e, 'furtherEducation')} />
                <button onClick={() => submitExcel('furtherEducation')}>Upload Education</button>
                <a href="/templates/further_education_template.xlsx" download className="download-template">
                  Download Template
                </a>
              </div>
            </div>


            {/* Toggle to Show Single Student Form */}
            <div className="inline-link">
              <p onClick={() => setShowSingleStudentForm(!showSingleStudentForm)}>
                {showSingleStudentForm ? "Hide" : "Or Add One Student"}
              </p>
            </div>

          {/* Optional: add one student manually (optional form stub) */}
          {showSingleStudentForm && (
            <div className="nested-section">
              <p>Single student form goes here…</p>
              <label className="required">Username</label>
                <input 
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}/>

                <label className="required">Registration Number</label>
                <input type="text"
                    name="reg_number"
                    value={formData.reg_number}
                    onChange={handleChange}/>

                <label className="required">First Name</label>
                <input type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}/>

                <label className="required">Rwandan Name</label>
                <input 
                    type="text"
                    name="rwandan_name"
                    value={formData.rwandan_name}
                    onChange={handleChange} />

                <label className="required">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>

                <label>Date of Birth</label>
                <input 
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange} />

                <label className = "required">Phone</label>
                <input 
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange} />

                <label>Alternate Phone</label>
                <input type="tel"
                    name="phone1"
                    value={formData.phone1}
                    onChange={handleChange} />

                <label className = "required">Email</label>
                <input type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}/>

                <label>Alternate Email</label>
                <input type="email"
                        name="email1"
                        value={formData.email1}
                        onChange={handleChange} />

                <label className="required">Password</label>
                <input type="password" 
                        name="password"
                        value={formData.password}
                        onChange={handleChange}/>

                <label className="required">Confirm Password</label>
                <input type="password"
                        name="password_confirm"
                        value={formData.password_confirm}
                        onChange={handleChange} />

                <label>Family</label>
                <select
                    name="family"
                    value={formData.family}
                    onChange={handleChange}>
                  <option value="">Select family</option>
                  {families.map(family => (
                    <option key={family.id} value={family.id}>
                      {family.family_name}
                    </option>
                  ))}
                </select>

                <label>Graduation Status</label>
                <input type="text"
                        name="graduation_status"
                        value={formData.graduation_status}
                        onChange={handleChange} />

                <label className="required">Origin District</label>
                <select
                      name="origin_district"
                      value={formData.origin_district}
                      onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="bugesera">Bugesera</option>
                  <option value="nyarugenge">Nyarugenge</option>
                </select>

                <label className="required">Origin Sector</label>
                <select name="origin_sector"
                        value={formData.origin_sector}
                        onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="kacyiru">Kacyiru</option>
                  <option value="nyamirambo">Nyamirambo</option>
                </select>

                <label className="required">Current City</label>
                <select name="current_city" value={formData.current_city} onChange={handleCityChange}>
                  <option value="">Select</option>
                  <option value="kigali">Kigali</option>
                  <option value="huye">Huye</option>
                  <option value="other">Other</option>
                </select>
                {cityOther && (
                  <input
                    type="text"
                    placeholder="Enter city"
                    name="other_city"
                    value={formData.other_city}
                    onChange={handleOtherCityChange}
                  />
                )}

                <label className="required">Current Country</label>
                      <select
                        name="current_country"
                        value={formData.current_country}
                        onChange={handleCountryChange}
                      >
                        <option value="">Select</option>
                        <option value="rwanda">Rwanda</option>
                        <option value="uganda">Uganda</option>
                        <option value="other">Other</option>
                      </select>

                      {countryOther && (
                        <input
                          type="text"
                          name="other_country"
                          placeholder="Enter country"
                          value={formData.other_country}
                          onChange={handleOtherCountryChange}
                        />
                      )}
                <label>Health Issue</label>
                <input type="text"
                        name="health_status"
                        value={formData.health_issue}
                        onChange={handleChange} />

                <label className="required" >Marital Status</label>
                <select
                    name="marital_status"
                    value={formData.marital_status}
                    onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>

                <label className="required">Life Status</label>
                <input type="text"
                        name="life_status"
                        value={formData.life_status}
                        onChange={handleChange} />

                <label className="required">Has Children?</label>
                <select  name="has_children" onChange={handleChange} value={formData.has_children === null ? '' : formData.has_children.toString()}>
                  <option value="">Select</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>

                <label>National Exam Score</label>
                <input type="number" 
                        name="points_in_national_exam"
                        value={formData.points_in_national_exam}
                        onChange={handleChange}/>

                <label>Max National Exam Score</label>
                <input type="number"
                        name="maximum_points_in_national_exam"
                        value={formData.maximum_points_in_national_exam}
                        onChange={handleChange} />

                <label>Mention</label>
                <input type="text"
                        name="mention"
                        value={formData.mention}
                        onChange={handleChange} />
              <button onClick={handleAddStudent}>Add Student</button>
            </div>
          )}
        </div>
        </div>
  )}

export default AddStudents;
