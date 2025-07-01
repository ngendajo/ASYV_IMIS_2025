import React from 'react';

const DistributionList = ({ title, distribution, showZero = false }) => {
  if (!distribution || Object.keys(distribution).length === 0) {
    return <p>No data available.</p>;
  }

  // Convert to array, filter, then sort descending by count
  const sortedEntries = Object.entries(distribution)
    .filter(([_, value]) => showZero || value.count > 0)
    .sort(([, a], [, b]) => b.count - a.count);

  return (
    <div>
      {title && <h3>{title}</h3>}
      <ul>
        {sortedEntries.map(([category, { count }]) => (
          <li key={category}>
            <strong>{category}</strong>: {count}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DistributionList;
