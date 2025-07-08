import React, { useState } from 'react';
import './filter-panel.css';

const FilterPanel = ({ filters, filterUI, toggleCheckbox, applyFilters }) => {
  const [searchInputs, setSearchInputs] = useState({});

  const clearGroup = (key) => {
    toggleCheckbox(key, '__CLEAR_ALL__');
  };

  const clearAll = () => {
    Object.keys(filterUI).forEach(key => toggleCheckbox(key, '__CLEAR_ALL__'));
    setSearchInputs({}); // reset searches too
  };

  const handleSearchChange = (key, value) => {
    setSearchInputs((prev) => ({
      ...prev,
      [key]: value.toLowerCase()
    }));
  };

  const renderFilterGroup = (title, items, key, labelFn, valueFn) => {
    const searchValue = searchInputs[key] || '';
    const filteredItems = items.filter(item =>
      labelFn(item).toLowerCase().includes(searchValue)
    );

    return (
      <div className="filter-group">
        <div className="filter-group-header">
          <p><strong>{title}</strong></p>
          <button className="clear-link" onClick={() => clearGroup(key)}>Clear</button>
        </div>
        <input
          type="text"
          className="filter-search-input"
          placeholder={`Search ${title.toLowerCase()}...`}
          value={searchInputs[key] || ''}
          onChange={(e) => handleSearchChange(key, e.target.value)}
        />
        <div className="filter-items-scroll">
          {filteredItems.map((item, index) => {
            const label = labelFn(item);
            const value = valueFn(item);
            const isChecked = filterUI[key].includes(value);
            return (
              <label key={index}>
                <input
                  type="checkbox"
                  value={value}
                  checked={isChecked}
                  onChange={() => toggleCheckbox(key, value)}
                />
                {label}
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="filter-panel-wrapper">
      <div className="filter-panel-grid">
        {renderFilterGroup("Gender", filters.gender, "gender",
          g => g === "M" ? "Male" : g === "F" ? "Female" : g,
          g => g)}

        {renderFilterGroup("Graduation Year", filters.graduation_year, "graduation_year",
          item => `${item.grade_name} (${item.graduation_year_to_asyv})`,
          item => String(item.graduation_year_to_asyv))}

        {renderFilterGroup("Family", filters.family, "family",
          f => f.family_name,
          f => f.id)}

        {renderFilterGroup("Combination", filters.combination, "combination",
          c => c.combination__combination_name,
          c => c.combination_id)}

        {renderFilterGroup("Industry", filters.industry, "industry",
          i => i,
          i => i)}

        {renderFilterGroup("College", filters.college, "college",
          c => c.college__college_name,
          c => c.college__college_name)}
      </div>

      <div className="apply-button-wrapper">
        <button className="clear-all-button" onClick={clearAll}>Clear All Filters</button>
        <button className="apply-button" onClick={applyFilters}>Apply Filters</button>
      </div>
    </div>
  );
};

export default FilterPanel;
