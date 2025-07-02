import React from 'react'

export default function ResponsiveTable({data}) {
    if (!data || data.length === 0) {
        return <div>No data available</div>;
      }
    const headers = Object.keys(data[0] || {});

    return (
      <div className="responsivetable-container">
        <table>
          <thead>
            <tr>
              {headers.map(header => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'even-row' : ''}>
                {headers.map((header, colIndex) => (
                  <td key={colIndex} className={row[header]==="Not yet Returned" ? 'invalid' : ''}>{row[header]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
