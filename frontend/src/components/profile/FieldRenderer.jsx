import React from 'react';
import Select from 'react-select';

import {
  getNestedValue,
  setNestedValueImmutable,
  safeValue,
  getLevelLabel,
  getScholarshipLabel,
  getStudyStatusLabel,
  getEmploymentStatusLabel
} from './helpers';

const FieldRenderer = ({
  data,
  setData,
  fields,
  editing,
  dropdownOptions,
  isEmploymentSection = false,
  isAcademicSection = false,
  collegeLookup = {},
  isStaff = false,
  onDelete,
}) => {
  // Determine if delete button should show
  const canDelete = editing && isStaff && (isAcademicSection || isEmploymentSection);

  // Handler for deleting a row
  const handleDelete = async (index) => {
    const itemToDelete = data[index];
  
    console.log("id of record", itemToDelete.id)
    if (itemToDelete.id && typeof onDelete === 'function') {
      const confirmed = window.confirm("Are you sure you want to delete this entry?");
      if (!confirmed) return;
  
      const success = await onDelete(itemToDelete.id);
      if (success) {
        const newData = [...data];
        newData.splice(index, 1);
        setData(newData);
      } else {
        alert("Failed to delete entry.");
      }
    } else {
      // Unsaved new row, remove locally
      const newData = [...data];
      newData.splice(index, 1);
      setData(newData);
    }
  };

  return (
    <>
      {/* Desktop table view */}
      <div className="profile-table desktop-only">
        <table className="fixed-table">
          <thead>
            <tr>
              {fields.map((f, i) => <th key={i}>{f.label}</th>)}
              {canDelete && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr key={i}>
                {fields.map((f, j) => {
                  let val = f.getValue ? f.getValue(item) : (
                    f.path ? getNestedValue(item, f.path) : (typeof f.value === 'function' ? f.value(item) : item[f.value])
                  );
                
                  if (typeof val === 'boolean') val = val ? 'Yes' : 'No';

                  if (editing && f.dropdownKey && dropdownOptions[f.dropdownKey]) {
                    return (
                      <td key={j}>

                    {f.isMulti ? (() => {
                      // Normalize options values to numbers if needed
                      const normalizedOptions = (dropdownOptions[f.dropdownKey] || []).map(opt => ({
                        ...opt,
                        value: typeof opt.value === 'string' ? Number(opt.value) : opt.value,
                      }));

                      // Normalize current value array to numbers too
                      const valueArray = Array.isArray(val)
                        ? val.map(v => {
                            const normalized = typeof v === 'string' ? Number(v) : v;
                            return normalized;
                          })
                        : [];
    
                      // Filter selected options based on normalized values
                      const selectedOptions = normalizedOptions.filter(opt => valueArray.includes(opt.value));

                      return (
                        <Select
                          isMulti
                          options={normalizedOptions}
                          value={selectedOptions}
                          onChange={(selected) => {
                            const selectedValues = selected ? selected.map(opt => opt.value) : [];
                            console.log('📝 Selected values from onChange:', selectedValues);

                            const updatedItem = f.setValue
                              ? f.setValue(item, selectedValues)
                              : { ...item, [f.value]: selectedValues };

                            console.log('Updated item:', updatedItem);

                            const updatedData = [...data];
                            updatedData[i] = updatedItem;
                            setData(updatedData);
                          }}
                          placeholder="Select..."
                          menuPortalTarget={document.body} // ⬅️ This ensures it's rendered in the body
                          menuPosition="absolute"          // ⬅️ Required for proper absolute positioning
                          styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        />
                      );
                    })() : (
                        <select
                          value={String(val ?? "")}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            let updatedItem = f.path
                              ? setNestedValueImmutable(item, f.path, newValue)
                              : { ...item, [f.value]: newValue };

                            if (isAcademicSection && f.value === 'college') {
                              const locationInfo = collegeLookup[newValue];
                              console.log("trying to find college location for", newValue, locationInfo)
                              updatedItem = { ...updatedItem, location: locationInfo || "" };
                            }

                            const updatedData = [...data];
                            updatedData[i] = updatedItem;
                            setData(updatedData);
                          }}
                        >
                          <option value="" disabled>Select...</option>
                          {dropdownOptions[f.dropdownKey].map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      )}
                      </td>
                    );
                  }

                  if (editing && !(isAcademicSection && f.value === 'country')) {
                    return (
                      <td key={j}>
                        <input
                          type={f.type || 'text'}
                          value={val ?? ""}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            let updatedItem;

                            if (typeof f.onSave === 'function') {
                              updatedItem = f.onSave(newValue, item);
                            } else if (f.path) {
                              updatedItem = setNestedValueImmutable(item, f.path, newValue);
                            } else {
                              updatedItem = { ...item, [f.value]: newValue };
                            }

                            const updatedData = [...data];
                            updatedData[i] = updatedItem;
                            setData(updatedData);
                          }}
                        />
                      </td>
                    );
                  }

                  // Read-only display
                  return (
                    <td key={j}>
                      {isEmploymentSection && f.value === 'status' ? (
                        getEmploymentStatusLabel(val)
                      ) : isAcademicSection && f.value === 'college' ? (
                        dropdownOptions.colleges.find(opt => String(opt.value) === String(val))?.label ?? val
                      ) : isAcademicSection && f.value === 'level' ? (
                        getLevelLabel(val)
                      ) : isAcademicSection && f.value === 'status' ? (
                        getStudyStatusLabel(val)
                      ) : isAcademicSection && f.value === 'scholarship' ? (
                        getScholarshipLabel(val)
                      ) : (
                       // 🧠 Final fallback for dropdown/multi-select
                          f.dropdownKey && dropdownOptions[f.dropdownKey]
                          ? Array.isArray(val)
                            ? val
                                .map(v => {
                                  const match = dropdownOptions[f.dropdownKey].find(
                                    opt => Number(opt.value) === Number(v)
                                  );
                                  return match ? match.label : v;
                                })
                                .join(', ')
                            : dropdownOptions[f.dropdownKey].find(opt => String(opt.value) === String(val))?.label ?? safeValue(val)
                          : f.suffix
                          ? `${typeof val === 'number' ? val.toFixed(2) : safeValue(val)}${f.suffix}`
                          : safeValue(val)
                      )}
                    </td>
                  );
                })}
                {canDelete && (
                  <td>
                    <button
                      type="button"
                      className="delete-row-button"
                      onClick={() => handleDelete(i)}
                      aria-label="Delete row"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked view */}
      <div className="profile-fields">
        {data.map((item, i) => (
          <div key={i} className="entry-block">
            {fields.map((f, j) => {
              const val = f.path
                ? getNestedValue(item, f.path)
                : typeof f.value === 'function'
                  ? f.value(item)
                  : item[f.value];

              return (
                <div key={j} className="field-row">
                  <div className="field-label">{f.label}</div>
                  <div className="field-value">
                    {editing && f.dropdownKey && dropdownOptions[f.dropdownKey] ? (
                      <select
                        value={val ?? ""}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          let updatedItem = f.path
                            ? setNestedValueImmutable(item, f.path, newValue)
                            : { ...item, [f.value]: newValue };

                          if (isAcademicSection && f.value === 'college') {
                            const locationInfo = collegeLookup[newValue];
                            updatedItem = { ...updatedItem, location: locationInfo || "" };
                          }

                          const updatedData = [...data];
                          updatedData[i] = updatedItem;
                          setData(updatedData);
                        }}
                      >
                        <option value="" disabled>Select...</option>
                        {dropdownOptions[f.dropdownKey].map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : editing && !(isAcademicSection && f.value === 'country') ? (
                      <input
                        type={f.type || 'text'}
                        value={val ?? ""}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          let updatedItem;

                          if (typeof f.onSave === 'function') {
                            updatedItem = f.onSave(newValue, item);
                          } else if (f.path) {
                            updatedItem = setNestedValueImmutable(item, f.path, newValue);
                          } else {
                            updatedItem = { ...item, [f.value]: newValue };
                          }

                          const updatedData = [...data];
                          updatedData[i] = updatedItem;
                          setData(updatedData);
                        }}
                      />
                    ) : (
                      isEmploymentSection && f.value === 'status' ? (
                        getEmploymentStatusLabel(val)
                      ) : isAcademicSection && f.value === 'college' ? (
                        dropdownOptions.colleges.find(opt => String(opt.value) === String(val))?.label ?? val
                      ) : isAcademicSection && f.value === 'level' ? (
                        getLevelLabel(val)
                      ) : isAcademicSection && f.value === 'status' ? (
                        getStudyStatusLabel(val)
                      ) : isAcademicSection && f.value === 'scholarship' ? (
                        getScholarshipLabel(val)
                      ) : (
                        f.dropdownKey && dropdownOptions[f.dropdownKey]
                          ? dropdownOptions[f.dropdownKey].find(opt => String(opt.value) === String(val))?.label ?? safeValue(val)
                          : f.suffix
                          ? `${typeof val === 'number' ? val.toFixed(2) : safeValue(val)}${f.suffix}`
                          : safeValue(val)
                      )
                    )}
                  </div>
                </div>
              );
            })}

            {canDelete && (
              <button
                type="button"
                className="delete-row-button mobile-delete-button"
                onClick={() => handleDelete(i)}
                aria-label="Delete row"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default FieldRenderer;
