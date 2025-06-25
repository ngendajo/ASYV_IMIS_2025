import React from 'react';
import "./search-bar.css";

const SearchBar = ({ value, onChange, placeholder, per }) => {
  const inputStyle = {
    width: per ? `${per}%` : '45%', // Set width based on per prop or default to 100%
  };

  return ( 
    <input
      type="text"
      placeholder={placeholder || "Search..."}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="search-bar"
      style={inputStyle}
    />
  );
};

export default SearchBar;