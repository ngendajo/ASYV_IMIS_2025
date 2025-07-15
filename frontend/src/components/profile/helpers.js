// helpers.js
export const safeValue = (val) => (val === null || val === undefined || val === "") ? "Not Found" : val;

export const getScholarshipLabel = (status) => ({
  F: 'Full',
  P: 'Partial',
  S: 'Self-Sponsor'
}[status] || "");

export const getLevelLabel = (level) => ({
  A1: 'Advanced Diploma of ',
  A0: 'Bachelor in ',
  M: 'Master in ',
  PHD: 'Ph.D. in ',
  C: 'Certificate of '
}[level] || "");

export const getStudyStatusLabel = (status) => ({
  O: 'Ongoing',
  G: 'Graduated',
  S: 'Suspended',
  D: 'Dropped Out'
}[status] || 'NA');

export const getEmploymentStatusLabel = (status) => ({
  F: 'Full-time',
  P: 'Part-time',
  S: 'Self-employed',
  I: 'Intern'
}[status] || 'NA');

export function getNestedValue(obj, path) {
  if (!obj || !path) return undefined;
  if (typeof path === 'string') path = path.split('.');
  return path.reduce((acc, key) => acc && acc[key], obj);
}

export function setNestedValueImmutable(obj, path, value) {
  if (typeof path === 'string') path = path.split('.');
  if (path.length === 0) return value;

  const [key, ...rest] = path;
  return {
    ...obj,
    [key]: rest.length === 0 
      ? value 
      : setNestedValueImmutable(obj?.[key] ?? {}, rest, value)
  };
}
