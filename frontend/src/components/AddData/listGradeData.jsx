import React, { useState, useEffect } from 'react';
import axios from 'axios';
import baseUrl from '../../api/baseUrl'; // adjust as needed

const GradeList = () => {
  const [grades, setGrades] = useState([]);
  const [editingGradeId, setEditingGradeId] = useState(null);
  const [editedGrade, setEditedGrade] = useState({});

  useEffect(() => {
    axios.get(baseUrl + '/grades/')
      .then(res => setGrades(res.data))
      .catch(err => console.error('Error fetching grades:', err));
  }, []);

  const handleEditClick = (grade) => {
    setEditingGradeId(grade.id);
    setEditedGrade({ ...grade });
  };

  const handleCancel = () => {
    setEditingGradeId(null);
    setEditedGrade({});
  };

  const handleSave = () => {
    axios.put(`${baseUrl}/grades/${editingGradeId}/`, editedGrade)
      .then(res => {
        setGrades(grades.map(g => g.id === editingGradeId ? res.data : g));
        setEditingGradeId(null);
      })
      .catch(err => console.error('Error updating grade:', err));
  };

  const handleChange = (field, value) => {
    setEditedGrade(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <h2>All Grades</h2>
      <ul>
        {grades.map(grade => (
          <li key={grade.id}>
            {editingGradeId === grade.id ? (
              <div>
                <input
                  value={editedGrade.grade_name}
                  onChange={e => handleChange('grade_name', e.target.value)}
                />
                <input
                  type="number"
                  value={editedGrade.admission_year_to_asyv}
                  onChange={e => handleChange('admission_year_to_asyv', e.target.value)}
                />
                <input
                  type="number"
                  value={editedGrade.graduation_year_to_asyv}
                  onChange={e => handleChange('graduation_year_to_asyv', e.target.value)}
                />
                <button onClick={handleSave}>Save</button>
                <button onClick={handleCancel}>Cancel</button>
              </div>
            ) : (
              <div>
                <strong>{grade.grade_name}</strong> — {grade.admission_year_to_asyv} to {grade.graduation_year_to_asyv}
                <button onClick={() => handleEditClick(grade)} style={{ marginLeft: 10 }}>
                  Edit
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GradeList;
