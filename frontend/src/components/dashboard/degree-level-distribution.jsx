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

const degreeLevelNames = {
  A0: "Bachelor",
  A1: "Advanced Diploma",
  M: "Master",
  C: "Certificate",
  PHD: "PHD",
};

const DegreeLevelDistribution = ({ distribution }) => {
  if (!distribution || distribution.length === 0) {
    return <p>No data available.</p>;
  }

  // Calculate total count
  const total = distribution.reduce((sum, item) => sum + item.count, 0);

  // Map distribution to chart data with name and percent
  const dataWithPercent = distribution.map(({ degree_level, count }) => ({
    name: degreeLevelNames[degree_level] || degree_level,
    value: count,
    percent: ((count / total) * 100).toFixed(1), // one decimal place
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
            outerRadius={90}
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

export default DegreeLevelDistribution;
