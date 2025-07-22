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

  useEffect(() => {
    axios.get(baseUrl + '/options/mamas/')
      .then(res => setMamas(res.data))
      .catch(err => console.error('Failed to fetch mamas:', err));
  }, []);

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
      alert('Grade & Families submitted successfully!');
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

      <div className="form-group">
        <label>Grade Name</label>
        <input
          value={gradeName}
          onChange={e => setGradeName(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Admission Year</label>
        <input
          type="number"
          value={admissionYear}
          onChange={e => setAdmissionYear(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Graduation Year</label>
        <input
          type="number"
          value={graduationYear}
          onChange={e => setGraduationYear(e.target.value)}
          required
        />
      </div>

      <h3>Families</h3>
      {families.map((family, i) => (
        <div key={i} className="nested-section">
          <div className="form-group">
            <label>Family Name</label>
            <input
              value={family.family_name}
              onChange={e => handleFamilyChange(i, 'family_name', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Family Number</label>
            <input
              value={family.family_number}
              onChange={e => handleFamilyChange(i, 'family_number', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Mama</label>
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
          </div>

          <button type="button" className="delete-link" onClick={() => deleteFamily(i)}>
            Delete Family
          </button>
        </div>
      ))}

      <button type="button" onClick={addFamily}>
        Add Another Family
      </button>

      <div className="form-actions">
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
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default GradeForm;
