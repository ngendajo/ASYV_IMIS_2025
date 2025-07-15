// render-section.jsx
import React from 'react';
import ProfileTableAndFields from './profile-tables-and-fields';

const renderSection = (
  data,
  setData,
  fields,
  editing = false,
  dropdownOptions = {},
  isAcademicSection = false,
  isEmploymentSection = false
) => {
  // Ensure data is always an array for ProfileTableAndFields
  const dataArr = Array.isArray(data) ? data : [data];

  return (
    <ProfileTableAndFields
      data={dataArr}
      setData={setData}
      fields={fields}
      editing={editing}
      dropdownOptions={dropdownOptions}
      isAcademicSection={isAcademicSection}
      isEmploymentSection={isEmploymentSection}
    />
  );
};

export default renderSection;
