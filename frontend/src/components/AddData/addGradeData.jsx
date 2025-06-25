import React, { useState, useEffect } from 'react';
import axios from 'axios';
import baseUrl from '../../api/baseUrl'; // adjust as needed

const GradeForm = () => {
  const [gradeName, setGradeName] = useState('');
  const [admissionYear, setAdmissionYear] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [families, setFamilies] = useState([
    { family_name: '', family_number: '', mother: '' },
  ]);
  const [mamas, setMamas] = useState([]);

  useEffect(() => {
    axios.get(baseUrl + '/options/mamas/')
      .then(res => setMamas(res.data))
      .catch(err => console.error('Failed to fetch mamas:', err));
  }, []);

  const handleFamilyChange = (index, field, value) => {
    const updated = [...families];
    updated[index][field] = value;
    setFamilies(updated);
  };

  const addFamily = () => {
    setFamilies([...families, { family_name: '', family_number: '', mother: '' }]);
  };

  // Delete family at index
  const deleteFamily = (index) => {
    setFamilies(families.filter((_, i) => i !== index));
  };

  // Reset entire form
  const cancelForm = () => {
    setGradeName('');
    setAdmissionYear('');
    setGraduationYear('');
    setFamilies([{ family_name: '', family_number: '', mother: '' }]);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        grade_name: gradeName,
        admission_year_to_asyv: parseInt(admissionYear),
        graduation_year_to_asyv: parseInt(graduationYear),
        families: families.map(f => ({
          ...f,
          mother: parseInt(f.mother),
        })),
      };

      console.log(payload)

      const res = await axios.post(baseUrl + '/grades/', payload);
      alert('Grade created successfully!');
      console.log(res.data);
      cancelForm(); // optionally reset form after submit
    } catch (err) {
      console.error('Failed to create grade:', err.response?.data || err.message);
      alert('Failed to create grade. Check console for details.');
    }
  };

  return (
    <div>
      <h2>Create Grade</h2>

      <input
        placeholder="Grade Name"
        value={gradeName}
        onChange={e => setGradeName(e.target.value)}
      />
      <input
        placeholder="Admission Year"
        value={admissionYear}
        onChange={e => setAdmissionYear(e.target.value)}
        type="number"
      />
      <input
        placeholder="Graduation Year"
        value={graduationYear}
        onChange={e => setGraduationYear(e.target.value)}
        type="number"
      />

      <h3>Families</h3>
      {families.map((family, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <input
            placeholder="Family Name"
            value={family.family_name}
            onChange={e => handleFamilyChange(i, 'family_name', e.target.value)}
          />
          <input
            placeholder="Family Number"
            value={family.family_number}
            onChange={e => handleFamilyChange(i, 'family_number', e.target.value)}
          />
          <select
            value={family.mother}
            onChange={e => handleFamilyChange(i, 'mother', e.target.value)}
          >
            <option value="">Select Mama</option>
            {mamas.map(mama => (
              <option key={mama.id} value={mama.id}>
                {`${mama.first_name} ${mama.rwandan_name}`}
              </option>
            ))}
          </select>

          <button type="button" onClick={() => deleteFamily(i)} style={{ marginLeft: 8 }}>
            Delete Family
          </button>
        </div>
      ))}

      <button type="button" onClick={addFamily}>Add Another Family</button>

      <div style={{ marginTop: 20 }}>
        <button type="button" onClick={handleSubmit}>Submit Grade & Families</button>
        <button
          type="button"
          onClick={cancelForm}
          style={{ marginLeft: 12, backgroundColor: 'lightgray' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default GradeForm;
