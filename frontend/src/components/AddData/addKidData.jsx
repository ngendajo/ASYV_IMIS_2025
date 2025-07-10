import React, { useState } from 'react';
import axios from 'axios';
import baseUrl from '../../api/baseUrl'; // adjust this path as needed

const AddStudents = () => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [showSingleStudentForm, setShowSingleStudentForm] = useState(false);
  const [cityOther, setCityOther] = useState(false);
  const [countryOther, setCountryOther] = useState(false);

  const initialFormData = {
    username: '',
    registration_number: '',
    first_name: '',
    rwandan_name: '',
    gender: '',
    date_of_birth: '',
    phone: '',
    alternate_phone: '',
    email: '',
    alternate_email: '',
    password: '',
    confirm_password: '',
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
  const [excelFiles, setExcelFiles] = useState({
    marks: null,
    combination: null,
    leap: null,
    employment: null,
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
    if (!formData.username || !formData.password || formData.password !== formData.confirm_password) {
      alert("Please fill all required fields and ensure passwords match.");
      return;
    }
  
    // Handle city and country override
    const city = formData.current_city === "other" ? formData.other_city : formData.current_city;
    const country = formData.current_country === "other" ? formData.other_country : formData.current_country;
  
    const payload = {
      ...formData,
      current_city: city,
      current_country: country
    };
  
    try {
      const res = await axios.post(`${baseUrl}/api/kid/`, payload);
      alert("Student added successfully!");
      setFormData(initialFormData); // reset form if needed
    } catch (err) {
      console.error(err);
      alert("Failed to add student.");
    }
}

  return (
        <div className="form-section">
          {/* Bulk Upload Options */}
          <div className="excel-upload-section">
            <h4>Bulk Upload Options</h4>

            {/* 1. Upload Basic Student Info */}
            <div className="upload-block">
              <label className="required">Upload Students Excel File</label>
              <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
              <button onClick={handleUpload}>Upload Basic Info</button>
              <a href="/templates/students_template.xlsx" download className="download-template">
                Download Template
              </a>
              {uploadStatus && <p>{uploadStatus}</p>}
            </div>

            {/* 2. Upload Marks */}
            <div className="upload-block">
              <label className="required">Upload Marks Excel File</label>
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
              <label className="required">Upload Combination Excel File</label>
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
              <label className="required">Upload LEAP Excel File</label>
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
              <label className="required">Upload Employment Excel File</label>
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
              <label className="required">Upload Further Education Excel File</label>
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
                <input type="text" />

                <label className="required">Registration Number</label>
                <input type="text" />

                <label className="required">First Name</label>
                <input type="text" />

                <label className="required">Rwandan Name</label>
                <input type="text" />

                <label className="required">Gender</label>
                <select>
                  <option value="">Select</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>

                <label>Date of Birth</label>
                <input type="date" />

                <label>Phone</label>
                <input type="tel" />

                <label>Alternate Phone</label>
                <input type="tel" />

                <label>Email</label>
                <input type="email" />

                <label>Alternate Email</label>
                <input type="email" />

                <label className="required">Password</label>
                <input type="password" />

                <label className="required">Confirm Password</label>
                <input type="password" />

                <label className="required">Family</label>
                <select>
                  <option value="">Select family</option>
                  <option value="1">Family 1</option>
                  <option value="2">Family 2</option>
                </select>

                <label>Graduation Status</label>
                <input type="text" />

                <label>Origin District</label>
                <select>
                  <option value="">Select</option>
                  <option value="bugesera">Bugesera</option>
                  <option value="nyarugenge">Nyarugenge</option>
                </select>

                <label>Origin Sector</label>
                <select>
                  <option value="">Select</option>
                  <option value="kacyiru">Kacyiru</option>
                  <option value="nyamirambo">Nyamirambo</option>
                </select>

                <label>Current City</label>
                <select onChange={(e) => setCityOther(e.target.value === "other")}>
                  <option value="">Select</option>
                  <option value="kigali">Kigali</option>
                  <option value="huye">Huye</option>
                  <option value="other">Other</option>
                </select>
                {cityOther && <input type="text" placeholder="Enter city" />}

                <label>Current Country</label>
                <select onChange={(e) => setCountryOther(e.target.value === "other")}>
                  <option value="">Select</option>
                  <option value="rwanda">Rwanda</option>
                  <option value="uganda">Uganda</option>
                  <option value="other">Other</option>
                </select>
                {countryOther && <input type="text" placeholder="Enter country" />}

                <label>Health Issue</label>
                <input type="text" />

                <label>Marital Status</label>
                <select>
                  <option value="">Single</option>
                  <option value="1">Married</option>
                  <option value="2">Divorced</option>
                  <option value="3">Widowed</option>
                </select>

                <label>Life Status</label>
                <input type="text" />

                <label>Has Children?</label>
                <select>
                  <option value="">Select</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>

                <label>National Exam Score</label>
                <input type="number" />

                <label>Max National Exam Score</label>
                <input type="number" />

                <label>Mention</label>
                <input type="text" />
              <button onClick={handleAddStudent}>Add Student</button>
            </div>
          )}
        </div>
        </div>
  )}

export default AddStudents;
