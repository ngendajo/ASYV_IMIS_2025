import React from 'react';

const AreasOfStudyList = ({ data }) => {
  if (!data || data.length === 0) {
    return <p>No data available.</p>;
  }

  return (
    <ul>
      {data.map(({ area_name, count }) => (
        <li key={area_name}>
          {area_name}: {count}
        </li>
      ))}
    </ul>
  );
};

export default AreasOfStudyList;
