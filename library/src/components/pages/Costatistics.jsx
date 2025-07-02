import React, { useState, useEffect} from 'react';
import axios from 'axios';
import baseUrl from "../../api/baseUrl";
import useAuth from "../../hooks/useAuth";
import { fetchGrades } from '../../services/gradeService';

export default function Costatistics() {
  const [selectctedGradeId, setSelectctedGradeId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [grades, setGrades] = useState([]);
  const { auth } = useAuth();
  const [error, setError] = useState(null);

  const handleGradeChange = async(event) => {
    setSelectctedGradeId(event.target.value);
    let gradeId =event.target.value;
    if (!gradeId) {
      setError('Please enter a Grade ID');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios({
        url: `${baseUrl}/students/export/${gradeId}/`,
        method: 'GET',
        responseType: 'blob', // Important for file download
        headers: {
          "Authorization": `Bearer ${String(auth.accessToken)}`,
        },
        withCredentials: true,
      });

      // Create a link element to trigger the download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `student_export_grade_${gradeId}.xlsx`);
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      setError(err.response?.data?.detail || 'Failed to export students. Please check the Grade ID and try again.');
    } finally {
      setIsLoading(false);
    }
    
  };

  useEffect(() => {
    
    // Fetch grades
    fetchGrades(auth).then(response => {
      setGrades(response.data);
  
    });
  }, [auth]);
  return (
    <div>
      <h2>Download Students by grade in Excel</h2>
      {isLoading ? 'Exporting...' : 
      <select 
          value={selectctedGradeId || ''}
          onChange={handleGradeChange}
          style={{
            fontSize: '1.4em',
            fontWeight: 'bold',
            color: '#498160',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            borderBottom: 'none',
            backgroundColor: 'transparent',
            marginLeft: '10px',
            padding: '5px 1px',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="" disabled>Select Grade</option>
          {grades.map((grade) => (
            <option key={grade.id} value={grade.id}>
              {grade.grade_name} {grade.start_year} {grade.end_year}
            </option>
          ))}
        </select>
      }
      {error}
    </div>
  )
}
