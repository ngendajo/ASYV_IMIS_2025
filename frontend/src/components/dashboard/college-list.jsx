import React from 'react';

const CollegesByCountry = ({ collegesByCountry }) => {
  if (!collegesByCountry || Object.keys(collegesByCountry).length === 0) {
    return <p>No college attendance data available.</p>;
  }

  // Sort colleges per country by attendance_count descending
  const countriesSorted = Object.entries(collegesByCountry).map(([country, colleges]) => {
    const sortedColleges = colleges
      .slice()
      .sort((a, b) => b.attendance_count - a.attendance_count);
    return { country, colleges: sortedColleges };
  });

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
      {countriesSorted.map(({ country, colleges }) => (
        <div key={country} style={{ marginBottom: '2rem' }}>
          <h4>{country}</h4>
          <div
            style={{
              maxHeight: '180px', // Enough for header + ~3 rows
              overflowY: 'auto',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: '400px',
              }}
            >
              <thead
                style={{
                  position: 'sticky',
                  top: 0,
                  backgroundColor: '#fff',
                  zIndex: 1,
                }}
              >
                <tr>
                  <th
                    style={{
                      textAlign: 'left',
                      borderBottom: '1px solid #ccc',
                      padding: '0.3rem',
                      backgroundColor: '#f9f9f9',
                    }}
                  >
                    College
                  </th>
                  <th
                    style={{
                      textAlign: 'left',
                      borderBottom: '1px solid #ccc',
                      padding: '0.3rem',
                      backgroundColor: '#f9f9f9',
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
        </div>
      ))}
    </div>
  );
};

export default CollegesByCountry;
