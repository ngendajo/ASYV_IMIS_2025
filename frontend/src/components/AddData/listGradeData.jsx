import React, { useState, useEffect } from 'react';
import axios from 'axios';
import baseUrl from '../../api/baseUrl'; // adjust as needed

const GradeList = () => {
  const [grades, setGrades] = useState([]);
  const [editingGradeId, setEditingGradeId] = useState(null);
  const [editedGrade, setEditedGrade] = useState({});

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = () => {
    axios.get(baseUrl + '/grades/')
      .then(res => setGrades(res.data))
      .catch(err => console.error('Error fetching grades:', err));
  };

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

  // New function to graduate all kids of a grade
  const graduateKids = async (gradeId) => {
    try {
      const res = await axios.post(`${baseUrl}/grades/${gradeId}/graduate-kids/`);
      alert(res.data.message);
      fetchGrades();  // Refresh the list if needed
    } catch (err) {
      console.error(err);
      alert("Failed to graduate kids.");
    }
  };

  return (
    <div>
      <h2>All Grades</h2>
      <ul>
        {grades.map(grade => (
          <li key={grade.id} style={{ marginBottom: '1rem' }}>
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
                {grade.non_graduated_kids_count > 0 && (
                  <button
                    onClick={() => graduateKids(grade.id)}
                    style={{ marginLeft: 10, backgroundColor: '#4caf50', color: 'white' }}
                  >
                    Mark All Kids as Graduated
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GradeList;
