import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CollegesList = ({ data }) => {
  if (!data || data.length === 0) {
    return <p>No colleges data available.</p>;
  }

  // Sort descending by attendance_count
  const sortedData = [...data].sort((a, b) => b.attendance_count - a.attendance_count);

  return (
    <div>
      <h3>Colleges Attended (Most to Least)</h3>

      <ul>
        {sortedData.map(({ college, attendance_count }) => (
          <li key={college}>
            {college}: {attendance_count} attendees
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CollegesList;
