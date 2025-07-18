import React, { useState, useEffect } from 'react';
import axios from 'axios';
import baseUrl from '../../api/baseUrl';

const GradeList = () => {
  const [grades, setGrades] = useState([]);
  const [editingGradeId, setEditingGradeId] = useState(null);
  const [editedGrade, setEditedGrade] = useState({});
  const [editingFamilyId, setEditingFamilyId] = useState(null);
  const [editedFamily, setEditedFamily] = useState({});


  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = () => {
    axios.get(baseUrl + '/grades/')
      .then(res => setGrades(res.data))
      .catch(err => console.error('Error fetching grades:', err));
  };

  const fetchFamiliesForGrade = async (gradeId) => {
    try {
      const res = await axios.get(`${baseUrl}/grades/${gradeId}/families/`);
      setGrades(prev =>
        prev.map(g =>
          g.id === gradeId ? { ...g, families: res.data } : g
        )
      );
    } catch (err) {
      console.error(`Error fetching families for grade ${gradeId}:`, err);
    }
  };
  

  const handleEditClick = (grade) => {
    setEditingGradeId(grade.id);
    setEditedGrade({ ...grade });
    if (!grade.families) {
      fetchFamiliesForGrade(grade.id);
    }
  };

  const handleCancel = () => {
    setEditingGradeId(null);
    setEditedGrade({});
  };

  const handleFamilyEditClick = (family) => {
    setEditingFamilyId(family.id);
    setEditedFamily({ ...family });
  };
  
  const handleFamilyChange = (field, value) => {
    setEditedFamily(prev => ({ ...prev, [field]: value }));
  };
  
  const handleFamilyCancel = () => {
    setEditingFamilyId(null);
    setEditedFamily({});
  };
  
  const handleFamilySave = async (gradeId) => {
    try {
      const res = await axios.put(`${baseUrl}/families/${editingFamilyId}/`, editedFamily);
      setGrades(prev =>
        prev.map(g =>
          g.id === gradeId
            ? {
                ...g,
                families: g.families.map(f =>
                  f.id === editingFamilyId ? res.data : f
                ),
              }
            : g
        )
      );
      handleFamilyCancel();
    } catch (err) {
      console.error("Error updating family:", err);
    }
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

  const graduateKids = async (gradeId) => {
    try {
      const res = await axios.put(`${baseUrl}/grades/${gradeId}/graduate-kids/`);
      alert(res.data.message);
      fetchGrades();
    } catch (err) {
      console.error(err);
      alert("Failed to graduate kids.");
    }
  };

  return (
    <div className="section-content">
      <ul className="data-list">
        {grades.map(grade => (
          <li key={grade.id} className="data-list-item">
            {editingGradeId === grade.id ? (
              <div className="data-form" style={{ gap: "10px" }}>
                <div className="form-group">
                  <label>Grade Name</label>
                  <input
                    value={editedGrade.grade_name}
                    onChange={e => handleChange('grade_name', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Admission Year</label>
                  <input
                    type="number"
                    value={editedGrade.admission_year_to_asyv}
                    onChange={e => handleChange('admission_year_to_asyv', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Graduation Year</label>
                  <input
                    type="number"
                    value={editedGrade.graduation_year_to_asyv}
                    onChange={e => handleChange('graduation_year_to_asyv', e.target.value)}
                  />
                </div>
  
                <div className="form-actions">
                  <button type="button" onClick={handleSave}>Save</button>
                  <button type="button" onClick={handleCancel}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <strong>{grade.grade_name}</strong> — {grade.admission_year_to_asyv} to {grade.graduation_year_to_asyv}
                </div>
  
                <div className="data-list-actions">
                  <button onClick={() => handleEditClick(grade)}>Edit</button>
                  {grade.non_graduated_kids_count > 0 && (
                    <button
                      onClick={() => {
                        const confirmed = window.confirm("Are you sure you want to graduate all kids in this grade?");
                        if (confirmed) graduateKids(grade.id);
                      }}
                    >
                      Mark All Kids as Graduated
                    </button>
                  )}
                </div>
  
                {/* Nested families display with editing */}
                {grade.families && grade.families.length > 0 && (
                  <ul className="nested-family-list">
                    {grade.families.map(family => (
                      <li key={family.id}>
                        {editingFamilyId === family.id ? (
                          <>
                            <input
                              value={editedFamily.family_name}
                              onChange={(e) => handleFamilyChange('family_name', e.target.value)}
                            />
                            <button onClick={() => handleFamilySave(grade.id)}>Save</button>
                            <button onClick={handleFamilyCancel}>Cancel</button>
                          </>
                        ) : (
                          <>
                            {family.family_name}
                            <button className="family-edit" onClick={() => handleFamilyEditClick(family)}>Edit</button>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};  

export default GradeList;
