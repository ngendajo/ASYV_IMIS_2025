import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const EmploymentDistribution = ({ distribution }) => {
    return (
      <ul>
        {Object.entries(distribution).map(([status, data]) => (
          <li key={status}>
            <strong>{status}</strong>: {data.count}
          </li>
        ))}
      </ul>
    );
  };
export default EmploymentDistribution;
