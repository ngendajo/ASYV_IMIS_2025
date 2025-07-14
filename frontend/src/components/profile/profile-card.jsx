import React, { useState } from 'react';
import useProfileData from '../../hooks/useProfileData';
import useAuth from '../../hooks/useAuth';
import './profile-card.css';
import ChangePasswordModal from '../home/change_password';
import VerifyCurrentPasswordModal from './verify-password';
import ProfileCardSection from './profile-card-section';
import renderSection from './render-section';

const ProfileCard = ({ propId }) => {
  const { auth } = useAuth();

  const {
    user, setUser, originalUser,
    study, setStudy, originalStudy,
    employment, setEmployment, originalEmployment,
    dropdownOptions,
    editState, setEditState,
    saveKidInfo, saveStudyData, saveEmploymentData
  } = useProfileData(propId);

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [verifiedCurrentPassword, setVerifiedCurrentPassword] = useState('');

  const cancelEdit = (section) => {
    switch (section) {
      case 'info':
      case 'current':
      case 'asyv':
        setUser(originalUser);
        break;
      case 'academic':
        setStudy(originalStudy);
        break;
      case 'employment':
        setEmployment(originalEmployment);
        break;
    }
    setEditState(prev => ({ ...prev, [section]: false }));
  };

  const toggleEdit = (section, saveFunc) => {
    if (editState[section]) saveFunc();
    setEditState(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (!user) return <div>Loading profile...</div>;

  // Define fields to render
  const safe = (v) => v || 'Not Found';
  const personalFields = [
    { label: 'First Name', path: 'basic_information.first_name' },
    { label: 'Rwandan Name', path: 'basic_information.rwandan_name' },
    { label: 'Gender', path: 'basic_information.gender' },
    { label: 'Date of Birth', path: 'basic_information.date_of_birth' },
    { label: 'Place of Birth', value: u => `${u.place_of_birth?.origin_district}, ${u.place_of_birth?.origin_sector}` }
  ];
  const currentFields = [
    { label: 'Marital Status', path: 'personal_status.marital_status', dropdownKey: 'marital_statuses' },
    { label: 'Children', path: 'personal_status.has_children', dropdownKey: 'children_options' },
    { label: 'City', path: 'current_address.current_district_or_city' },
    { label: 'Country', path: 'current_address.current_county' }
  ];
  const asyvIdentityFields = [
    { label: 'Grade', path: 'affiliation.grade_info.grade_id', dropdownKey: "grades" },
    { label: 'Family', path: 'affiliation.family_id', dropdownKey: "families" },
    { label: 'Combination', path: 'academic_combinations.0.combination_id', dropdownKey: "combinations" }
  ];
  const asyvAcademicFields = [
    { label: 'S4 Grade', value: u => safe(u.academic_combinations?.[2]?.marks) + '%' },
    { label: 'S5 Grade', value: u => safe(u.academic_combinations?.[1]?.marks) + '%' },
    { label: 'S6 Grade', value: u => safe(u.academic_combinations?.[0]?.marks) + '%' },
    {
      label: 'National Exam Score',
      value: u => {
        const r = u.national_exam_results;
        return r ? `${r.points_achieved}/${r.maximum_points} (${r.mention})` : 'Not Found';
      }
    }
  ];
  const leapFields = [
    { label: 'Leap Program', value: u => (u.leap_activities || []).map(a => a.leap_name).join(', ') || 'Not Found' }
  ];

  return (
    <div className="profile-container vertical-cards">

      <ProfileCardSection
        title="Personal Info"
        canEdit={auth.user?.is_superuser}
        isEditing={editState.info}
        onToggleEdit={() => toggleEdit('info', saveKidInfo)}
        onCancelEdit={() => cancelEdit('info')}
      >
        {renderSection(user, setUser, personalFields, editState.info, dropdownOptions)}
      </ProfileCardSection>

      <ProfileCardSection
        title="Current Info"
        isEditing={editState.current}
        onToggleEdit={() => toggleEdit('current', saveKidInfo)}
        onCancelEdit={() => cancelEdit('current')}
      >
        {renderSection(user, setUser, currentFields, editState.current, dropdownOptions)}
      </ProfileCardSection>

      <ProfileCardSection
        title="ASYV Info"
        canEdit={auth.user?.is_superuser}
        isEditing={editState.asyv}
        onToggleEdit={() => toggleEdit('asyv', saveKidInfo)}
        onCancelEdit={() => cancelEdit('asyv')}
      >
        {renderSection(user, setUser, asyvIdentityFields, editState.asyv, dropdownOptions)}
        {renderSection(user, setUser, asyvAcademicFields, editState.asyv, dropdownOptions)}
        {renderSection(user, setUser, leapFields, editState.asyv, dropdownOptions)}
      </ProfileCardSection>

      <ProfileCardSection
        title="Academic Info"
        isEditing={editState.academic}
        onToggleEdit={() => toggleEdit('academic', saveStudyData)}
        onCancelEdit={() => cancelEdit('academic')}
        onAddRow={() => setStudy(prev => [...prev, {}])}
      >
        {renderSection(study, setStudy, [
          { label: 'Level', value: 'level', dropdownKey: 'levels' },
          { label: 'Degree', value: 'degree' },
          { label: 'University', value: 'college', dropdownKey: 'colleges' },
          { label: 'Location', value: 'country' },
          { label: 'Scholarship', value: 'scholarship', dropdownKey: 'scholarship' },
          { label: 'Scholarship Details', value: 'scholarship_details' },
          { label: 'Status', value: 'status', dropdownKey: 'status' }
        ], editState.academic, dropdownOptions, true)}
      </ProfileCardSection>

      <ProfileCardSection
        title="Employment Info"
        isEditing={editState.employment}
        onToggleEdit={() => toggleEdit('employment', saveEmploymentData)}
        onCancelEdit={() => cancelEdit('employment')}
        onAddRow={() => setEmployment(prev => [...prev, {}])}
      >
        {renderSection(employment, setEmployment, [
          { label: 'Title', value: 'title' },
          { label: 'Company', value: 'company' },
          { label: 'Status', value: 'status', dropdownKey: 'employment_status' },
          { label: 'Industry', value: 'industry', dropdownKey: 'industries' },
          { label: 'Start Date', value: 'start_date', type: 'date' },
          { label: 'End Date', value: 'end_date', type: 'date' }
        ], editState.employment, dropdownOptions, false, true)}
      </ProfileCardSection>

      {/* Password change modals omitted here for brevity */}
    </div>
  );
};

export default ProfileCard;
