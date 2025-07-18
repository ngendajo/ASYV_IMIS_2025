import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#4f81bd', '#9bbb59', '#ffbb55', '#e84c3d', '#8064a2'];

const EmploymentDistribution = ({ distribution }) => {
  if (!distribution || Object.keys(distribution).length === 0) {
    return <p>No data available.</p>;
  }

  // Convert to array and calculate total count
  const data = Object.entries(distribution).map(([status, info]) => ({
    name: status,
    value: info.count,
  }));
  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  // Add percentage to each entry for use in label and tooltip
  const dataWithPercent = data.map(entry => ({
    ...entry,
    percent: ((entry.value / total) * 100).toFixed(1), // 1 decimal place
  }));

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={dataWithPercent}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, percent }) => `${name}: ${percent}%`}
          >
            {dataWithPercent.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name, props) => {
            const { payload } = props;
            return [`${payload.percent}%`, payload.name];
          }} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EmploymentDistribution;
