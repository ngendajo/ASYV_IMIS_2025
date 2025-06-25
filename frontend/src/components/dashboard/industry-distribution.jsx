import React from 'react';

const DistributionList = ({ title, distribution, showZero = false }) => (
    <div>
      <h3>{title}</h3>
      <ul>
        {Object.entries(distribution)
          .filter(([_, value]) => showZero || value.count > 0)
          .map(([category, { count, percent }]) => (
            <li key={category}>
              <strong>{category}</strong>: {count} 
            </li>
          ))}
      </ul>
    </div>
  );

  export default DistributionList;