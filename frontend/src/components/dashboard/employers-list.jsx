import React from 'react';

const TOP_N = 10;

const TopEmployers = ({ data }) => {
  if (!data || data.length === 0) {
    return <p>No employer data available.</p>;
  }

  console.log("provided data", data);

  // Aggregate alumni counts per company
  const agg = {};
  data.forEach(({ company_name, count }) => {
    agg[company_name] = (agg[company_name] || 0) + count;
  });

  console.log("agg", agg);

  // Convert to array and sort descending
  const sorted = Object.entries(agg)
    .map(([company_name, count]) => ({ company_name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, TOP_N);

  if (sorted.length === 0) {
    return <p>No employer data available.</p>;
  }
  console.log("sorted", sorted);

  return (
    <section>
      <ul>
        {sorted.map(({ company_name, count }) => (
          <li key={company_name}>
            <strong>{company_name}</strong>: {count} alumni
          </li>
        ))}
      </ul>
    </section>
  );
};

export default TopEmployers;
