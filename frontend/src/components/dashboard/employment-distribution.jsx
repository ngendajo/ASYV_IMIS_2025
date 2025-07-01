import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Define some example colors for each category
const COLORS = ['#4f81bd', '#9bbb59', '#ffbb55', '#e84c3d', '#8064a2'];

const EmploymentDistribution = ({ distribution }) => {
  if (!distribution || Object.keys(distribution).length === 0) {
    return <p>No data available.</p>;
  }

  // Convert the object to an array of { name, value } format
  const data = Object.entries(distribution).map(([status, info]) => ({
    name: status,
    value: info.count,
  }));

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value} people`} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EmploymentDistribution;
