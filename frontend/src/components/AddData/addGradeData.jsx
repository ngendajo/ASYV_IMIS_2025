import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import baseUrl from '../../api/baseUrl';

const GradeForm = ({ item, onSuccess, onCancel }) => {
  const [gradeName, setGradeName] = useState('');
  const [admissionYear, setAdmissionYear] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [families, setFamilies] = useState([
    { family_name: '', family_number: '', mother: '' },
  ]);
  const [mamas, setMamas] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Fetch mama options
  useEffect(() => {
    axios.get(baseUrl + '/options/mamas/')
      .then(res => setMamas(res.data))
      .catch(err => console.error('Failed to fetch mamas:', err));
  }, []);

  // Load item data when editing
  useEffect(() => {
    if (item) {
      setGradeName(item.grade_name || '');
      setAdmissionYear(item.admission_year_to_asyv || '');
      setGraduationYear(item.graduation_year_to_asyv || '');
      setFamilies(item.families || [{ family_name: '', family_number: '', mother: '' }]);
    }
  }, [item]);

  const handleFamilyChange = (index, field, value) => {
    const updated = [...families];
    updated[index][field] = value;
    setFamilies(updated);
  };

  const addFamily = () => {
    setFamilies([...families, { family_name: '', family_number: '', mother: '' }]);
  };

  const deleteFamily = (index) => {
    setFamilies(families.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setGradeName('');
    setAdmissionYear('');
    setGraduationYear('');
    setFamilies([{ family_name: '', family_number: '', mother: '' }]);
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    const payload = {
      grade_name: gradeName,
      admission_year_to_asyv: parseInt(admissionYear),
      graduation_year_to_asyv: parseInt(graduationYear),
      families: families.map(f => ({
        ...f,
        mother: parseInt(f.mother),
      })),
    };

    try {
      if (item?.id) {
        await axios.put(`${baseUrl}/grades/${item.id}/`, payload);
      } else {
        await axios.post(baseUrl + '/grades/', payload);
      }

      if (onSuccess) onSuccess();
      resetForm();
    } catch (err) {
      console.error('Failed to submit grade:', err.response?.data || err.message);
      alert('Submission failed. Check the console for details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="data-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <h2>{item ? 'Edit Grade' : 'Create Grade'}</h2>

      <input
        placeholder="Grade Name"
        value={gradeName}
        onChange={e => setGradeName(e.target.value)}
        required
      />
      <input
        placeholder="Admission Year"
        value={admissionYear}
        onChange={e => setAdmissionYear(e.target.value)}
        type="number"
        required
      />
      <input
        placeholder="Graduation Year"
        value={graduationYear}
        onChange={e => setGraduationYear(e.target.value)}
        type="number"
        required
      />

      <h3>Families</h3>
      {families.map((family, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <input
            placeholder="Family Name"
            value={family.family_name}
            onChange={e => handleFamilyChange(i, 'family_name', e.target.value)}
            required
          />
          <input
            placeholder="Family Number"
            value={family.family_number}
            onChange={e => handleFamilyChange(i, 'family_number', e.target.value)}
            required
          />
          <select
            value={family.mother}
            onChange={e => handleFamilyChange(i, 'mother', e.target.value)}
            required
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
        <button type="submit" disabled={submitting}>
          {item ? 'Update Grade' : 'Submit Grade & Families'}
        </button>
        {item && (
          <button
            type="button"
            onClick={() => {
              resetForm();
              if (onCancel) onCancel();
            }}
            style={{ marginLeft: 12, backgroundColor: 'lightgray' }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default GradeForm;
