import React from 'react';

const CollegesByCountry = ({ collegesByCountry }) => {
  if (!collegesByCountry || Object.keys(collegesByCountry).length === 0) {
    return <p>No college attendance data available.</p>;
  }

  // Prepare all countries with top 3 colleges sorted
  const countriesWithTop3 = Object.entries(collegesByCountry).map(([country, colleges]) => {
    const topColleges = colleges
      .slice()
      .sort((a, b) => b.attendance_count - a.attendance_count)
      .slice(0, 3);
    return { country, colleges: topColleges };
  });

  return (
    <div
      style={{
        maxHeight: '500px',  // container height for vertical scrolling
        overflowY: 'auto',
        padding: '1rem',
        border: '1px solid #ccc',
        borderRadius: '4px',
      }}
    >
      {countriesWithTop3.map(({ country, colleges }) => (
        <div key={country} style={{ marginBottom: '2rem' }}>
          <h4>{country}</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: 'left',
                    borderBottom: '1px solid #ccc',
                    padding: '0.3rem',
                  }}
                >
                  College
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    borderBottom: '1px solid #ccc',
                    padding: '0.3rem',
                  }}
                >
                  Attendance Count
                </th>
              </tr>
            </thead>
            <tbody>
              {colleges.map(({ college, attendance_count }) => (
                <tr key={college}>
                  <td
                    style={{
                      padding: '0.3rem',
                      borderBottom: '1px solid #eee',
                      textAlign: 'left',
                    }}
                  >
                    {college}
                  </td>
                  <td
                    style={{
                      padding: '0.3rem',
                      borderBottom: '1px solid #eee',
                      textAlign: 'left',
                    }}
                  >
                    {attendance_count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default CollegesByCountry;
