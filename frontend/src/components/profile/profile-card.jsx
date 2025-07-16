import React, { useState, useEffect } from 'react';
import axios from 'axios';
import baseUrl from '../../api/baseUrl';
import useAuth from '../../hooks/useAuth';
import './profile-card.css';

import ChangePasswordFlow from './ChangePasswordFlow';
import FieldRenderer from './FieldRenderer';
import ProfileCardSection from './ProfileCardSection';
import {
  safeValue,
  getNestedValue,
  setNestedValueImmutable
} from './helpers';

import {
  getPersonalFields,
  getCurrentInfoFields,
  getAsyvIdentityFields,
  getAsyvAcademicFields,
  getLeapProgramFields,
  getCombinationFieldsByYear,
  academicFields,
  employmentFields
} from './fieldConfigs';


const ProfileCard = ({ propId }) => {
  const { auth } = useAuth();
  const [userId, setUserId] = useState(propId || auth.user?.id);
  const [user, setUser] = useState(null);
  const [study, setStudy] = useState([]);
  const [employment, setEmployment] = useState([]);
  const [editState, setEditState] = useState({ info: false, current: false, asyv: false, academic: false, employment: false });

  const [originalUser, setOriginalUser] = useState(null);
  const [originalStudy, setOriginalStudy] = useState([]);
  const [originalEmployment, setOriginalEmployment] = useState([]);

  const [dropdownOptions, setDropdownOptions] = useState({
    marital_statuses: [], children_options: [], levels: [], colleges: [], combinations: [],
    grades: [], leaps: [], families: [], industries: [], status: [], employment_status: [], scholarship: []
  });
  
  const normalizeAcademicCombinations = (combinations) => {
    const levelOrder = ['S6', 'S5', 'S4', 'EY'];
  
    const levelMap = {
      S6: { level: 'S6', combination_id: '' },
      S5: { level: 'S5', combination_id: '' },
      S4: { level: 'S4', combination_id: '' },
      EY: { level: 'EY', combination_id: '' }
    };
  
    combinations.forEach(c => {
      if (levelMap[c.level]) {
        levelMap[c.level] = { ...c };
      }
    });
  
    return levelOrder.map(level => levelMap[level]);
  };
  

  const fetchUserData = async () => {
    try {
      const [userRes, dropdownRes] = await Promise.all([
        axios.get(`${baseUrl}/kid/${userId}`, {
          headers: { Authorization: 'Bearer ' + auth.accessToken },
          withCredentials: true
        }),
        axios.get(`${baseUrl}/options/all-dropdowns/`, {
          headers: { Authorization: 'Bearer ' + auth.accessToken },
          withCredentials: true
        })
      ]);

      const res = userRes.data?.national_exam_results || {};
      userRes.data.national_exam_results_text = res.points_achieved
        ? `${res.points_achieved} / ${res.maximum_points} (${res.mention})`
        : '';

      const normalizedUser = {
        ...userRes.data,
        academic_combinations: normalizeAcademicCombinations(userRes.data.academic_combinations || [])
      };
  
      setUser(normalizedUser);
      setOriginalUser(normalizedUser);
      setDropdownOptions(dropdownRes.data);
      console.log("leap dropdowns", dropdownOptions.leaps)
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudy = async () => {
    try {
      const res = await axios.get(`${baseUrl}/alumni-academic/?id=${userId}`, {
        headers: { Authorization: 'Bearer ' + auth.accessToken }
      });
      const sorted = res.data.sort((a, b) => {
        const order = { C: 1, A1: 2, A0: 3, M: 4, PHD: 5 };
        return order[a.level] - order[b.level];
      });
      setStudy(sorted);
      setOriginalStudy(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmployment = async () => {
    try {
      const res = await axios.get(`${baseUrl}/alumni-employment/?id=${userId}`, {
        headers: { Authorization: 'Bearer ' + auth.accessToken }
      });
      const sorted = res.data.sort((a, b) => {
        if (!a.end_date) return 1;
        if (!b.end_date) return -1;
        return new Date(a.end_date) - new Date(b.end_date);
      });
      setEmployment(sorted);
      setOriginalEmployment(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  const saveKidInfo = async () => {
    console.log("Updated user info:", user);
  
    const text = user.national_exam_results_text || '';
    const regex = /^(\d+\.?\d*)\s*\/\s*(\d+\.?\d*)\s*\((.+?)\)$/;
    const match = text.match(regex);
  
    const updatedNationalExamResults = match
      ? {
          points_achieved: parseFloat(match[1]),
          maximum_points: parseFloat(match[2]),
          mention: match[3].trim(),
          percentage: (parseFloat(match[1]) / parseFloat(match[2])) * 100
        }
      : {
          points_achieved: null,
          maximum_points: null,
          mention: null,
          percentage: null
        };
  
    const updatedUser = {
      ...user,
      national_exam_results: updatedNationalExamResults
    };
    console.log("exam", updatedNationalExamResults)
  
    try {
      console.log("updated national exam", updatedUser)
      await axios.put(`${baseUrl}/kid/${userId}/`, updatedUser, {
        headers: { Authorization: 'Bearer ' + auth.accessToken }
      });
      alert('Saved!');
      setOriginalUser(updatedUser);
      setUser(updatedUser);
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save.');
    }
  };

  const saveStudyData = async () => {
    try {
      await axios.put(`${baseUrl}/alumni-academic/?id=${userId}`, {
        academic: study
      }, {
        headers: { Authorization: 'Bearer ' + auth.accessToken }
      });
      alert('Academic data saved!');
      setOriginalStudy(study);
      fetchStudy();
    } catch {
      alert('Failed to save academic data.');
    }
  };

  const saveEmploymentData = async () => {
    try {
      await axios.put(`${baseUrl}/alumni-employment/?id=${userId}`, {
        employment
      }, {
        headers: { Authorization: 'Bearer ' + auth.accessToken }
      });
      alert('Employment data saved!');
      setOriginalEmployment(employment);
      fetchEmployment();
    } catch {
      alert('Failed to save employment data.');
    }
  };

  const collegeLookup = Object.fromEntries(dropdownOptions.colleges.map(c => [c.value, c.location]));

  useEffect(() => {
    if (userId) {
      fetchUserData();
      if (user) {
        const res = user.national_exam_results || {};
        const text = res.points_achieved != null && res.maximum_points != null && res.mention
          ? `${res.points_achieved} / ${res.maximum_points} (${res.mention})`
          : '';
        setUser(prev => ({
          ...prev,
          national_exam_results_text: text,
        }));
      }
      if (user && user.personal_status.graduation_status === 'graduated') {
        fetchStudy();
        fetchEmployment();
      } else {
        setStudy([]);  // clear if not graduated
        setOriginalStudy([]);
        setEmployment([]); 
        setOriginalEmployment([]);
      }
    }
  }, [userId]);

  const isStaff = auth.user?.is_staff || auth.user?.is_superuser;
  const isOwnProfile = auth.user?.id === userId;

  return (
    <div className="profile-container vertical-cards">
      <ProfileCardSection
        title="Personal Info"
        canEdit={auth.user?.is_superuser}
        isEditing={editState.info}
        onToggleEdit={() => {
          if (editState.info) saveKidInfo();
          setEditState(prev => ({ ...prev, info: !prev.info }));
        }}
        onCancelEdit={() => {
          setUser(originalUser);
          setEditState(prev => ({ ...prev, info: false }));
        }}
      >
        <FieldRenderer
          data={[user]} setData={arr => setUser(arr[0])}
          fields={getPersonalFields(user)} editing={editState.info}
          dropdownOptions={dropdownOptions}
        />
      </ProfileCardSection>

      <ProfileCardSection
        title="Current Info"
        isEditing={editState.current}
        onToggleEdit={() => {
          if (editState.current) saveKidInfo();
          setEditState(prev => ({ ...prev, current: !prev.current }));
        }}
        onCancelEdit={() => {
          setUser(originalUser);
          setEditState(prev => ({ ...prev, current: false }));
        }}
      >
        <FieldRenderer
          data={[user]} setData={arr => setUser(arr[0])}
          fields={getCurrentInfoFields(user)} editing={editState.current}
          dropdownOptions={dropdownOptions}
        />
      </ProfileCardSection>

      <ProfileCardSection
        title="ASYV Info"
        canEdit={auth.user?.is_superuser}
        isEditing={editState.asyv}
        onToggleEdit={() => {
          if (editState.asyv) {
            saveKidInfo();
          } else {
            // Ensure academic_combinations has 4 entries (for EY, S4, S5, S6)
            setUser(prev => {
              const updated = { ...prev };
              updated.academic_combinations = Array.isArray(updated.academic_combinations)
                ? [...updated.academic_combinations]
                : [];
        
              while (updated.academic_combinations.length < 4) {
                updated.academic_combinations.unshift({ combination_id: '' });
              }
        
              return updated;
            });
          }
        
          setEditState(prev => ({ ...prev, asyv: !prev.asyv }));
        }}
        onCancelEdit={() => {
          setUser(originalUser); // reset to last saved state
          setEditState(prev => ({ ...prev, asyv: false }));
        }}
      >
        <FieldRenderer
          data={[user]} setData={arr => setUser(arr[0])}
          fields={getAsyvIdentityFields(user)} editing={editState.asyv}
          dropdownOptions={dropdownOptions}
        />
        <FieldRenderer
          data={[user]}
          setData={arr => setUser(arr[0])}
          fields={getAsyvAcademicFields()}
          editing={editState.asyv}
          dropdownOptions={dropdownOptions}
        />
        <FieldRenderer
          data={[user]} setData={arr => setUser(arr[0])}
          fields={getCombinationFieldsByYear()} editing={editState.asyv}
          dropdownOptions={dropdownOptions}
        />
        <FieldRenderer
          data={[user]} setData={arr => setUser(arr[0])}
          fields={getLeapProgramFields(user, dropdownOptions)} editing={editState.asyv}
          dropdownOptions={dropdownOptions}
        />
      </ProfileCardSection>

      <ProfileCardSection
        title="Academic Info"
        isEditing={editState.academic}
        onToggleEdit={() => {
          if (editState.academic) saveStudyData();
          setEditState(prev => ({ ...prev, academic: !prev.academic }));
        }}
        onCancelEdit={() => {
          setStudy(originalStudy);
          setEditState(prev => ({ ...prev, academic: false }));
        }}
        onAddRow={() => setStudy(prev => [...prev, {}])}
      >
        <FieldRenderer
          data={study} setData={setStudy}
          fields={academicFields}
          editing={editState.academic}
          dropdownOptions={dropdownOptions}
          isAcademicSection={true}
          collegeLookup={collegeLookup}
          isStaff={auth.user?.is_staff || auth.user?.is_superuser}
        />
      </ProfileCardSection>

      <ProfileCardSection
        title="Employment Info"
        isEditing={editState.employment}
        onToggleEdit={() => {
          if (editState.employment) saveEmploymentData();
          setEditState(prev => ({ ...prev, employment: !prev.employment }));
        }}
        onCancelEdit={() => {
          setEmployment(originalEmployment);
          setEditState(prev => ({ ...prev, employment: false }));
        }}
        onAddRow={() => setEmployment(prev => [...prev, {}])}
      >
        <FieldRenderer
          data={employment} setData={setEmployment}
          fields={employmentFields}
          editing={editState.employment}
          dropdownOptions={dropdownOptions}
          isEmploymentSection={true}
          isStaff={auth.user?.is_staff || auth.user?.is_superuser}
        />
      </ProfileCardSection>

      {/* Password Section */}
      {isOwnProfile ? (
        <ChangePasswordFlow />
      ) : isStaff ? (
        <button
          type="button"
          className="reset-password-button"
          onClick={() => alert("Reset password functionality not implemented yet.")}
        >
          Reset Password
        </button>
      ) : null}
    </div>
  );
};

export default ProfileCard;
