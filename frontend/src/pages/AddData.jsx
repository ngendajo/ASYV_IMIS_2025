import React, { useState, useEffect } from "react";
import "./AddData.css";
import baseUrl from "../api/baseUrl";
import axios from "../api/axios";
import GradeForm from "../components/AddData/addGradeData";
import GradeList from "../components/AddData/listGradeData";
import AddStudents from "../components/AddData/addKidData";
import AddStaff from "../components/AddData/addStaffData";

const AddData = () => {
  const [expanded, setExpanded] = useState(null);
  const [showSingleStudentForm, setShowSingleStudentForm] = useState(false);
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [positionFlags, setPositionFlags] = useState({
    is_crc: false,
    is_teacher: false,
    is_librarian: false,
    is_mama: false,
  });

  const [cityOther, setCityOther] = useState(false);
  const [countryOther, setCountryOther] = useState(false);

  const toggleSection = (section) => {
    if (expanded === section) {
      setExpanded(null);
      if (section === "students") setShowSingleStudentForm(false);
    } else {
      setExpanded(section);
    }
  };

  const handlePositionChange = (value) => {
    setPositionFlags({
      is_crc: value === "crc",
      is_teacher: value === "teacher",
      is_librarian: value === "librarian",
      is_mama: value === "mother",
    });
  };

  return (
    <div className="add-data-container">
      <h1 className="page-title">Add Data</h1>

      {/* Add Grade & Families */}
      <div className="white-card">
        <div className="section-header" onClick={() => toggleSection("grade")}>
          <h2>Add Grade & Families</h2>
          <span>{expanded === "grade" ? "▲" : "▼"}</span>
        </div>
        {expanded === "grade" && (
        <GradeForm /> 
        )}
      </div>

      {/* Add Students (Bulk + One) */}
      <div className="white-card">
        <div className="section-header" onClick={() => toggleSection("students")}>
          <h2>Add Students</h2>
          <span>{expanded === "students" ? "▲" : "▼"}</span>
        </div>
        {expanded === "students" && (
          <AddStudents />
        )}
      </div>

      {/* Add Staff */}
      <div className="white-card">
        <div className="section-header" onClick={() => toggleSection("staff")}>
          <h2>Add Staff Account</h2>
          <span>{expanded === "staff" ? "▲" : "▼"}</span>
        </div>
        {expanded === "staff" && (
          <AddStaff />
        )}
      </div>
    </div>
  );
};


export default AddData;

