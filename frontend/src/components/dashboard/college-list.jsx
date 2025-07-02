import React, { useState, useMemo } from 'react';
import './college-list.css';

const CollegesByCountry = ({ collegesByCountry }) => {
  const [selectedCountry, setSelectedCountry] = useState(null);

  const countriesSorted = useMemo(() => {
    if (!collegesByCountry || Object.keys(collegesByCountry).length === 0) return [];
    return Object.entries(collegesByCountry)
      .map(([country, colleges]) => ({
        country,
        totalAttendance: colleges.reduce((sum, c) => sum + c.attendance_count, 0),
        colleges: colleges.slice().sort((a, b) => b.attendance_count - a.attendance_count),
      }))
      .sort((a, b) => b.totalAttendance - a.totalAttendance);
  }, [collegesByCountry]);

  if (countriesSorted.length === 0) {
    return <p className="no-data">No college attendance data available.</p>;
  }

  return (
    <div className="cbc-wrapper">
      {selectedCountry ? (
        <div className="cbc-table-view">
          <button className="cbc-back-button" onClick={() => setSelectedCountry(null)}>
            ← Back to countries
          </button>
          <h4>{selectedCountry}</h4>
          <div className="cbc-table-scroll">
            <table className="cbc-table">
              <thead>
                <tr>
                  <th>College</th>
                  <th>Attendance Count</th>
                </tr>
              </thead>
              <tbody>
                {collegesByCountry[selectedCountry]
                  .slice()
                  .sort((a, b) => b.attendance_count - a.attendance_count)
                  .map(({ college, attendance_count }) => (
                    <tr key={college}>
                      <td>{college}</td>
                      <td>{attendance_count}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="cbc-country-list">
          {countriesSorted.map(({ country, totalAttendance }) => (
            <button
              key={country}
              className="cbc-country-button"
              onClick={() => setSelectedCountry(country)}
            >
              {country} ({totalAttendance})
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollegesByCountry;
