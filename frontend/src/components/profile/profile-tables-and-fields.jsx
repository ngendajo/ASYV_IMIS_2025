import React from 'react';

const safeValue = (val) => (val === null || val === undefined || val === '' ? 'Not Found' : val);

// Helper to get nested values by path (string or array)
const getNestedValue = (obj, path) => {
  if (!obj || !path) return undefined;
  if (typeof path === 'string') path = path.split('.');
  return path.reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

// Render a table (desktop) and field list (mobile) with optional editing
const ProfileTableAndFields = ({
  data,
  setData,
  fields,
  editing = false,
  dropdownOptions = {},
  isAcademicSection = false,
  isEmploymentSection = false,
  onFieldChange,
  customLabels = {}, // e.g. functions for label overrides like getLevelLabel etc.
}) => {
  const handleChange = (index, field, value) => {
    if (onFieldChange) {
      onFieldChange(index, field, value);
      return;
    }
    const updatedData = [...data];
    updatedData[index] = { ...updatedData[index], [field]: value };
    setData(updatedData);
  };

  return (
    <>
      {/* Desktop Table */}
      <div className="profile-table desktop-only">
        <table className="fixed-table">
          <thead>
            <tr>{fields.map((f, i) => <th key={i}>{f.label}</th>)}</tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr key={i}>
                {fields.map((f, j) => {
                  let val = f.path
                    ? getNestedValue(item, f.path)
                    : typeof f.value === 'function'
                    ? f.value(item)
                    : item[f.value];

                  // Apply custom label function
                  if (customLabels[f.value]) {
                    val = customLabels[f.value](val);
                  }

                  // EDIT MODE
                  if (editing) {
                    if (f.dropdownKey && dropdownOptions[f.dropdownKey]) {
                      return (
                        <td key={j}>
                          <select
                            value={val ?? ''}
                            onChange={(e) =>
                              handleChange(i, f.path || f.value, e.target.value)
                            }
                          >
                            <option value="" disabled>
                              Select...
                            </option>
                            {dropdownOptions[f.dropdownKey].map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </td>
                      );
                    }

                    return (
                      <td key={j}>
                        <input
                          type={f.type || 'text'}
                          value={val ?? ''}
                          onChange={(e) =>
                            handleChange(i, f.path || f.value, e.target.value)
                          }
                          disabled={isAcademicSection && f.value === 'country'}
                        />
                      </td>
                    );
                  }

                  // VIEW MODE — convert ID to label if dropdownKey is set
                  if (!editing && f.dropdownKey && dropdownOptions[f.dropdownKey]) {
                    const match = dropdownOptions[f.dropdownKey].find(
                      (opt) => opt.value === val
                    );
                    val = match ? match.label : safeValue(val);
                  }

                  return <td key={j}>{safeValue(val)}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view fields */}
      <div className="profile-fields mobile-only">
        {data.map((item, i) => (
          <div key={i} className="entry-block">
            {fields.map((f, j) => {
              let val = f.path
                ? getNestedValue(item, f.path)
                : typeof f.value === 'function'
                ? f.value(item)
                : item[f.value];

              let displayVal = safeValue(val);

              if (customLabels[f.value]) {
                displayVal = customLabels[f.value](val);
              } else if (!editing && f.dropdownKey && dropdownOptions[f.dropdownKey]) {
                const match = dropdownOptions[f.dropdownKey].find(
                  (opt) => opt.value === val
                );
                displayVal = match ? match.label : safeValue(val);
              }

              return (
                <div key={j} className="field-row">
                  <div className="field-label">{f.label}</div>
                  <div className="field-value">{displayVal}</div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
};

export default ProfileTableAndFields;
