import React from 'react';

const AreasOfStudyList = ({ data }) => {
  if (!data || data.length === 0) {
    return <p>No data available.</p>;
  }

  // Sort descending by count and take top 10
  const top20 = data
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  return (
    <ul>
      {top20.map(({ area_name, count }) => (
        <li key={area_name}>
          <strong>{area_name}</strong>: {count}
        </li>
      ))}
    </ul>
  );
};

export default AreasOfStudyList;
