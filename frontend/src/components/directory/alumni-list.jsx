// src/components/directory/alumni-list.jsx
import React from 'react';
import './alumni-list.css';

const AlumniList = ({ alumni, onSelect }) => {
  return (
    <>
      {/* Desktop Table Layout */}
      <div className='desktop-table-wrapper'>
      <table className="desktop-table alumni-table">
        <thead>
          <tr>
            <th>Photo</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Grade</th>
            <th>Family</th>
            <th>Combination</th>
            <th>Job Title</th>
          </tr>
        </thead>
        <tbody>
          {alumni.map((alum, index) => (
            <tr
              key={alum.user_id}
              onClick={() => onSelect(alum)}
              className="table-row"
           
            >
              <td>
                <img src={alum.profilePic} alt="Profile" className="alumni-pic-table" />
              </td>
              <td>{alum.firstName}</td>
              <td>{alum.lastName}</td>
              <td>{alum.gradeName}</td>
              <td>{alum.familyName}</td>
              <td>{alum.combinationName}</td>
              <td>{alum.employment}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {/* Mobile Layout */}
      <div className="mobile-list alumni-list">
        {alumni.map((alum, index) => (
          <div
            key={alum.user_id}
            className="alumni-item"
            onClick={() => onSelect(alum)}
           
          >
            <img src={alum.profilePic} alt="Profile" className="alumni-pic" />
            <div className="alumni-name">
              {alum.firstName} {alum.lastName}
              <br />
              ({alum.gradeName} - {alum.familyName} - {alum.combinationName})
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default AlumniList;
