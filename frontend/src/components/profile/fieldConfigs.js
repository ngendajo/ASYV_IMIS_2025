export const getPersonalFields = (user) => [
  { label: 'First Name', path: 'basic_information.first_name' },
  { label: 'Rwandan Name', path: 'basic_information.rwandan_name' },
  { label: 'Gender', path: 'basic_information.gender' },
  { label: 'Date of Birth', path: 'basic_information.date_of_birth' },
  {
    label: 'Place of Birth',
    value: (u) => {
      const district = u?.place_of_birth?.origin_district || 'Unknown District';
      const sector = u?.place_of_birth?.origin_sector || 'Unknown Sector';
      return `${district}, ${sector}`;
    }
  }
];

export const getCurrentInfoFields = () => [
  { label: 'Marital Status', path: 'personal_status.marital_status', dropdownKey: 'marital_statuses' },
  { label: 'Children', path: 'personal_status.has_children', dropdownKey: 'children_options' },
  { label: 'City', path: 'current_address.current_district_or_city' },
  { label: 'Country', path: 'current_address.current_county' }
];

export const getAsyvIdentityFields = () => [
  { label: 'Grade', path: 'affiliation.grade_info.grade_id', dropdownKey: 'grades' },
  { label: 'Family', path: 'affiliation.family_id', dropdownKey: 'families' },
  // { label: 'Combination', path: 'academic_combinations.0.combination_id', dropdownKey: 'combinations' }
];

export const getCombinationFieldsByYear = () => [
  { label: 'EY Combination', path: 'academic_combinations.3.combination_id', dropdownKey: 'combinations' },
  { label: 'S4 Combination', path: 'academic_combinations.2.combination_id', dropdownKey: 'combinations' },
  { label: 'S5 Combination', path: 'academic_combinations.1.combination_id', dropdownKey: 'combinations' },
  { label: 'S6 Combination', path: 'academic_combinations.0.combination_id', dropdownKey: 'combinations' }
];

export const getAsyvAcademicFields = () => [
  {
    label: 'S4 Grade',
    value: (u) => u?.academic_combinations?.[2]?.marks
      ? `${u.academic_combinations[2].marks}%`
      : 'N/A'
  },
  {
    label: 'S5 Grade',
    value: (u) => u?.academic_combinations?.[1]?.marks
      ? `${u.academic_combinations[1].marks}%`
      : 'N/A'
  },
  {
    label: 'S6 Grade',
    value: (u) => u?.academic_combinations?.[0]?.marks
      ? `${u.academic_combinations[0].marks}%`
      : 'N/A'
  },
  {
    label: 'National Exam Score',
    value: (u) => {
      const res = u?.national_exam_results;
      return res
        ? `${res.points_achieved ?? '-'} / ${res.maximum_points ?? '-'} (${res.mention ?? 'N/A'})`
        : 'N/A';
    }
  }
];

export const getLeapProgramFields = () => [
  {
    label: 'Leap Program',
    value: (u) =>
      Array.isArray(u?.leap_activities) && u.leap_activities.length > 0
        ? u.leap_activities.map((a) => a?.leap_name || 'Unknown').join(', ')
        : 'Not Found'
  }
];

export const academicFields = [
  { label: 'Level', value: 'level', dropdownKey: 'levels' },
  { label: 'Degree', value: 'degree' },
  { label: 'University', value: 'college', dropdownKey: 'colleges' },
  { label: 'Location', value: 'country' },
  { label: 'Scholarship', value: 'scholarship', dropdownKey: 'scholarship' },
  { label: 'Scholarship Details', value: 'scholarship_details' },
  { label: 'Status', value: 'status', dropdownKey: 'status' }
];

export const employmentFields = [
  { label: 'Title', value: 'title' },
  { label: 'Company', value: 'company' },
  { label: 'Status', value: 'status', dropdownKey: 'employment_status' },
  { label: 'Industry', value: 'industry', dropdownKey: 'industries' },
  { label: 'Start Date', value: 'start_date', type: 'date' },
  { label: 'End Date', value: 'end_date', type: 'date' }
];
