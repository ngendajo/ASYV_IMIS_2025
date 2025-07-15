import React, { useState, useEffect, useMemo } from 'react';
import baseUrl from "../../api/baseUrl";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import './profile-card.css';
import ChangePasswordModal from '../home/change_password';
import VerifyCurrentPasswordModal from './verify-password';
import ContactCard from '../../components/profile/contact-card';


const safeValue = (val) => {
  if (val === null || val === undefined || val === "") return "Not Found";
  return val;
};
const getScholarshipLabel = (status) => {
  switch (status) {
    case 'F': 
      return 'Full' ;
    case 'P': 
      return 'Partial';
    case 'S': 
      return 'Self-Sponsor';
    default: 
      return ""
  }
}
const getLevelLabel = (level) => {
    switch (level) {
      case 'A1':
        return 'Advanced Diploma of ';
      case 'A0':
        return 'Bachelor in ';
      case 'M':
        return 'Master in ';
      case 'PHD':
          return 'Ph.D. in ';
      case 'C':
          return 'Certificate of ';
      default:
        return '';
    }
  };
const getStudyStatusLabel = (status) => {
  switch (status) {
    case 'O':
      return 'Ongoing';
    case 'G':
      return 'Graduated';
    case 'S':
      return 'Suspended';
    case 'D':
      return 'Dropped Out';
    default:
      return 'NA';
  }
};

const getEmploymentStatusLabel = (status) => {
  switch (status) {
    case 'F':
      return 'Full-time';
    case 'P':
      return 'Part-time';
    case 'S':
      return 'Self-employed';
    case 'I':
      return 'Intern';
    default:
      return 'NA';
  }
};

function computeAcademicYear(level, graduationYear) {
  const levelOffsets = {
    S6: 0,
    S5: 1,
    S4: 2,
    EY: 3
  };

  return graduationYear - levelOffsets[level];
}
const ProfileCardSection = ({
  title,
  children,
  isEditing,
  onToggleEdit,
  onCancelEdit,
  canEdit = true,
  onAddRow
}) => (
  <div className={`profile-whitecard ${isEditing ? 'edit-mode' : ''}`}>
    <h2 className="profile-section-title">{title}</h2>
    <div className="scroll-wrapper">{children}</div>
    {canEdit && (
      <div className="profile-button-group">
        {isEditing && onAddRow && (
          <button className={title.includes("Academic") ? "addStudy" : "addJob"} onClick={onAddRow}>Add New</button>
        )}
        {isEditing && (
          <button className="cancel" onClick={onCancelEdit}>Cancel</button>
        )}
        <button className="change" onClick={onToggleEdit}>{isEditing ? "Save" : "Edit"}</button>
      </div>
    )}
  </div>
);
const ProfileCard = ({ propId }) => {
  const [dropdownOptions, setDropdownOptions] = useState({
    marital_statuses: [],
    children_options: [],
    levels: [],
    colleges: [],
    combiantions: [], 
    grades: [], 
    leaps: [], 
    families: [],
    industries: [],
    status:[],
    employment_status:[], 
    scholarship:[],
  });
  const { auth } = useAuth();
  const [userId, setUserId] = useState(propId || auth.user?.id);
  const [user, setUser] = useState(null);
  const [study, setStudy] = useState([]);
  const [employment, setEmployment] = useState([]);
  const [kid_id, setKid_id] = useState();
  const [editState, setEditState] = useState({ current: false, academic: false, employment: false });

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [verifiedCurrentPassword, setVerifiedCurrentPassword] = useState('');
 
  const [originalUser, setOriginalUser] = useState(null);
  const [editUser, setEditUser] = useState(user ? {...user} : {});;

  const [originalStudy, setOriginalStudy] = useState([]);
  const [originalEmployment, setOriginalEmployment] = useState([]);


  const handleVerifyPassword = async (password) => {
    try {
      // Try logging in with the current password to verify
      await axios.post(`${baseUrl}/token/`, {
        username: user?.basic_information?.email,
        password: password,
      });
  
      setVerifiedCurrentPassword(password);
      setShowVerifyModal(false);
      setShowPasswordModal(true);
    } catch (error) {
      alert("Verification failed: Incorrect password.");
    }
  };
  
  const handlePasswordChange = async (currentPassword, newPassword) => {
    try {
      await axios.post(`${baseUrl}/changepassword/`, {
        current_password: currentPassword,
        new_password: newPassword,
      }, {
        headers: {
          Authorization: 'Bearer ' + auth.accessToken,
          'Content-Type': 'application/json',
        },
        withCredentials: true
      });
  
      alert("Password changed successfully!");
      setShowPasswordModal(false);
    } catch (err) {
      console.error("Password change failed", err);
      alert("Failed to change password.");
    }
  };
  
  console.log(userId)

  const fetchData = async () => {
    try {
      const [userRes, dropdownRes] = await Promise.all([
        axios.get(`${baseUrl}/kid/${userId}`, {
          headers: { Authorization: 'Bearer ' + String(auth.accessToken) },
          withCredentials: true
        }),
        axios.get(`${baseUrl}/options/all-dropdowns/`, {
          headers: { Authorization: 'Bearer ' + String(auth.accessToken) },
          withCredentials: true
        })
      ]);
  
      let fetchedUser = userRes.data;
  
      if (Array.isArray(fetchedUser.academic_combinations)) {
        fetchedUser.academic_combinations = fetchedUser.academic_combinations
          .slice()
          .sort((a, b) => b.academic_year - a.academic_year);
      } else {
        fetchedUser.academic_combinations = [];
      }
  
      while (fetchedUser.academic_combinations.length < 4) {
        fetchedUser.academic_combinations.unshift({ combination_id: "" });
      }

      fetchedUser.leap_activities = mapLeapActivitiesWithIds(fetchedUser.leap_activities || [], dropdownRes.data.leaps);
  
      setUser(fetchedUser);
      setOriginalUser(fetchedUser);
      setKid_id(fetchedUser.basic_information?.kid_id);
      setDropdownOptions(dropdownRes.data);
      
      return fetchedUser; // So it can be reused after save
    } catch (err) {
      console.error("Failed to fetch user or dropdowns:", err);
    }
  };

  const sortStudyLevel = (studies) => {
    const levelOrder = { C: 1, A1: 2, A0: 3, M: 4, PHD: 5 };
    return studies.sort((a, b) => {
      const levelComparison = levelOrder[a.level] - levelOrder[b.level];
      return levelComparison !== 0 ? levelComparison : a.degree.localeCompare(b.degree);
    });
  };

  const getStudy = async () => {
    try {
      const response = await axios.get(`${baseUrl}/alumni-academic/?id=${userId}`, {
        headers: { Authorization: 'Bearer ' + String(auth.accessToken), "Content-Type": 'multipart/form-data' },
        withCredentials: true
      });
      const studies = response.data.map(element => ({
        id: element.id,
        alumn: element.alumn,
        level: element.level,
        degree: element.degree,
        college: element.college,
        country: element.location,
        scholarship: element.scholarship,
        scholarship_details: element.scholarship_details,
        status: element.status
      }));
      console.log("studies", studies)
      setStudy(sortStudyLevel(studies));
      setOriginalStudy(sortStudyLevel(studies)); 
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (userId) getStudy();
  }, [auth, userId]);

  const sortJobDate = (jobs) => {
    return jobs.sort((a, b) => {
      if (a.end_date !== b.end_date) {
        if (a.end_date === "") return 1;
        if (b.end_date === "") return -1;
        return new Date(a.end_date) - new Date(b.end_date);
      }
      return new Date(a.start_date) - new Date(b.start_date);
    });
  };

  const getEmployment = async () => {
    try {
      const response = await axios.get(`${baseUrl}/alumni-employment/?id=${userId}`, {
        headers: { Authorization: 'Bearer ' + String(auth.accessToken), "Content-Type": 'multipart/form-data' },
        withCredentials: true
      });
      const jobs = response.data.map(element => ({
        id: element.id,
        alumn: element.alumn,
        title: element.title,
        status: element.status,
        company: element.company,
        industry: element.industry,
        start_date: element.start_date,
        end_date: element.end_date,
        on_going: element.end_date === ""
      }));
      setEmployment(sortJobDate(jobs));
      setOriginalEmployment(sortJobDate(jobs));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    console.log("Received userId:", userId);
    fetchData();
  }, [auth, userId]);

  useEffect(() => {
    console.log("user data updated", user);
  }, [user]);

  useEffect(() => {
    if (userId) getEmployment();
  }, [auth, userId]);
//Edit employment data
  const saveEmploymentData = async () => {
    console.log("called api to save employment data")
    console.log("Data sent to backend:", {
      employment: employment
    });
    try {
      await axios.put(`${baseUrl}/alumni-employment/?id=${userId}`, {
        employment: employment
      }, {
        headers: {
          Authorization: 'Bearer ' + String(auth.accessToken),
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      alert('Employment data saved!');
      setOriginalEmployment(employment);
      getEmployment();
    } catch (error) {
      console.error(error);
      alert('Failed to save employment data.');
    }
  };
  //Edit academic data
  const saveStudyData = async () => {
    console.log("called api to save academics data")
    console.log("Data sent to backend:", {
      academic: study
    });
    try {
      await axios.put(`${baseUrl}/alumni-academic/?id=${userId}`, {
        academic: study
      }, {
        headers: {
          Authorization: 'Bearer ' + String(auth.accessToken),
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      alert('Academic data saved!');
      setOriginalStudy(study);
      getStudy();
    } catch (error) {
      console.error(error);
      alert('Failed to save academic data.');
    }
  };
//Edit current info
const saveKidInfo = async (dataToSave) => {
  try {
    const res = await axios.put(`${baseUrl}/kid/${userId}/`, dataToSave, {
      headers: {
        Authorization: 'Bearer ' + String(auth.accessToken),
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });

    const updatedUser = res.data;
    alert('Kid info saved!');
    return updatedUser; // Return the updated user from the server
  } catch (err) {
    console.error(err);
    alert('Failed to save Kid info.');
    throw err;
  }
};

  const collegeLookup = Object.fromEntries(
    dropdownOptions.colleges.map(c => [c.value, c.location])
  );
  //console.log(collegeLookup);
  

  function getNestedValue(obj, path) {
    if (!obj || !path) return undefined;
    if (typeof path === 'string') {
      path = path.split('.');
    }
    return path.reduce((acc, key) => acc && acc[key], obj);
  }
  
  function setNestedValueImmutable(obj, path, value) {
    if (typeof path === 'string') {
      path = path.split('.');
    }
    
    if (path.length === 0) {
      console.log('Reached leaf path, setting value:', value);
      return value;
    }
      
    const [key, ...rest] = path;
    console.log('Current key:', key, 'Remaining path:', rest, 'Current obj value:', obj[key]);

    const updated = {
      ...obj,
      [key]: rest.length === 0 
        ? value 
        : setNestedValueImmutable(obj?.[key] ?? {}, rest, value)
    };
  
    console.log('Returning updated object at key:', key, updated);
  
    return updated;
  }
  
  const mapLeapActivitiesWithIds = (leapActivities, leapsDropdown) => {
    return leapActivities.map(a => {
      const found = leapsDropdown.find(l => l.label === a.leap_name);
      return {
        leap_id: found ? found.value : null,
        leap_name: a.leap_name
      };
    }).filter(a => a.leap_id !== null);
  };
  
  const renderSection = (
    data,
    setData,
    fields,
    editing = false,
    isEmploymentSection = false,
    isAcademicSection = false
  ) => (
    <>
      <div className="profile-table desktop-only">
        <table className="fixed-table">
          <thead>
            <tr>{fields.map((f, i) => <th key={i}>{f.label}</th>)}</tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr key={i}>
                {fields.map((f, j) => {
                  let val = f.path
                    ? getNestedValue(item, f.path)
                    : typeof f.value === 'function'
                      ? f.value(item)
                      : item[f.value];
  
                  if (typeof val === 'boolean') {
                    val = val ? 'Yes' : 'No';
                  }

                  // Handle multi-select dropdown
                  if (editing && f.isMultiSelect && dropdownOptions[f.dropdownKey]) {
                    const selectedValues = val || [];

                    return (
                      <td key={j}>
                        <select
                          multiple
                          value={val ?? []}
                          onChange={(e) => {
                            const selectedValues = Array.from(e.target.selectedOptions, opt => Number(opt.value));
                            const updatedItem = f.path
                              ? setNestedValueImmutable(item, f.path, selectedValues)
                              : { ...item, [f.value]: selectedValues };

                            const updatedData = [...data];
                            updatedData[i] = updatedItem;
                            setData(updatedData);
                          }}
                          style={{ width: "100%" }}
                        >
                          {dropdownOptions[f.dropdownKey].map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    );
                  }
  
                  if (editing && f.dropdownKey && dropdownOptions[f.dropdownKey]) {
                    return (
                      <td key={j}>
                        <select
                          value={String(val ?? "")}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            console.log('New value from input:', newValue);
                            console.log('Original item:', item);
                            let updatedItem = f.path
                              ? setNestedValueImmutable(item, f.path, newValue)
                              : { ...item, [f.value]: newValue };
                              console.log('Updated item after setNestedValueImmutable:', updatedItem);
                            // Special handling: update location when college changes
                            if (isAcademicSection && f.value === 'college') {
                              console.log(dropdownOptions.colleges)
                              const locationInfo = collegeLookup[newValue];
                              updatedItem = { ...updatedItem, location: locationInfo || "" };
                            }
  
                            const updatedData = [...data];
                            updatedData[i] = updatedItem;
                            console.log('Updated data array:', updatedData);
                            setData(updatedData);
                          }}
                          style={{ width: "100%" }}
                        >
                          <option value="" disabled>Select...</option>
                          {dropdownOptions[f.dropdownKey].map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </td>
                    );
                  }
  
                  if (isAcademicSection && f.value === 'country') {
                    return <td key={j}>{val || '-'}</td>;
                  }
  
                  if (editing) {
                    return (
                      <td key={j}>
                        <input
                          type={f.type || "text"}
                          value={val ?? ""}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            const updatedItem = f.path
                              ? setNestedValueImmutable(item, f.path, newValue)
                              : { ...item, [f.value]: newValue };
  
                            const updatedData = [...data];
                            updatedData[i] = updatedItem;
                            setData(updatedData);
                          }}
                          style={{ width: "100%" }}
                          disabled={isAcademicSection && f.value === 'country'}
                        />
                      </td>
                    );
                  }

                  if (!editing) {
                    if (f.dropdownKey === 'leaps') {
                      return (
                        <td key={j}>
                          {val && val.length > 0
                            ? val.map(id => dropdownOptions.leaps.find(opt => String(opt.value) === id)?.label)
                                 .filter(Boolean)
                                 .join(", ")
                            : 'None'}
                        </td>
                      );
                    }
                  }
  
                  return (
                    <td key={j}>
                      {isEmploymentSection && f.value === 'status' ? (
                        getEmploymentStatusLabel(val)
                      ) : isAcademicSection && f.value === 'college' ? (
                        dropdownOptions.colleges.find(opt => String(opt.value) === String(val))?.label ?? val
                      ) : isAcademicSection && f.value === 'level' ? (
                        getLevelLabel(val)
                      ) : isAcademicSection && f.value === 'status' ? (
                        getStudyStatusLabel(val)
                      ) : isAcademicSection && f.value === 'scholarship' ? (
                        getScholarshipLabel(val)
                      ) : (
                        f.dropdownKey && dropdownOptions[f.dropdownKey]
                          ? dropdownOptions[f.dropdownKey].find(opt => String(opt.value) === String(val))?.label ?? safeValue(val)
                          : safeValue(val)
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  
      <div className="profile-fields">
        {data.map((item, i) => (
          <div key={i} className="entry-block">
            {fields.map((f, j) => {
              const val = f.path
                ? getNestedValue(item, f.path)
                : typeof f.value === 'function'
                  ? f.value(item)
                  : item[f.value];
  
              return (
                <div key={j} className="field-row">
                  <div className="field-label">{f.label}</div>
                  <div className="field-value">
                    {editing && f.dropdownKey && dropdownOptions[f.dropdownKey] ? (
                      <select
                        value={val ?? ""}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          let updatedItem = f.path
                            ? setNestedValueImmutable(item, f.path, newValue)
                            : { ...item, [f.value]: newValue };
  
                          if (isAcademicSection && f.value === 'college') {
                            const locationInfo = collegeLookup[newValue];
                            updatedItem = { ...updatedItem, location: locationInfo?.location || "" };
                          }
  
                          const updatedData = [...data];
                          updatedData[i] = updatedItem;
                          setData(updatedData);
                        }}
                      >
                        <option value="" disabled>Select...</option>
                        {dropdownOptions[f.dropdownKey].map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : editing && !(isAcademicSection && f.value === 'country') ? (
                      <input
                        type={f.type || "text"}
                        value={val ?? ""}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          const updatedItem = f.path
                            ? setNestedValueImmutable(item, f.path, newValue)
                            : { ...item, [f.value]: newValue };
  
                          const updatedData = [...data];
                          updatedData[i] = updatedItem;
                          setData(updatedData);
                        }}
                      />
                    ) : (
                      isEmploymentSection && f.value === 'status' ? (
                        getEmploymentStatusLabel(val)
                      ) : isAcademicSection && f.value === 'college' ? (
                        dropdownOptions.colleges.find(opt => String(opt.value) === String(val))?.label ?? val
                      ) : isAcademicSection && f.value === 'level' ? (
                        getLevelLabel(val)
                      ) : isAcademicSection && f.value === 'status' ? (
                        getStudyStatusLabel(val)
                      ) : isAcademicSection && f.value === 'scholarship' ? (
                        getScholarshipLabel(val)
                      ) : (
                        f.dropdownKey && dropdownOptions[f.dropdownKey]
                          ? dropdownOptions[f.dropdownKey].find(opt => String(opt.value) === String(val))?.label ?? safeValue(val)
                          : safeValue(val)
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
  

  const personalFields =  user ? [
    { label: 'First Name', path: 'basic_information.first_name'},
    { label: 'Rwandan Name', path: 'basic_information.rwandan_name' },
    { label: 'Gender', path: 'basic_information.gender' },
    { label: 'Date of Birth', path: 'basic_information.date_of_birth'},
    { label: 'Place of Birth', value: u => `${u.place_of_birth?.origin_district}, ${u.place_of_birth?.origin_sector}` }
  ]  : [] ;
  const currentInfoFields = user ? [
    { label: 'Marital Status', path: 'personal_status.marital_status', dropdownKey: 'marital_statuses' },
    { label: 'Children', path: 'personal_status.has_children', dropdownKey: 'children_options' },
    { label: 'City', path: 'current_address.current_district_or_city' },
    { label: 'Country', path: 'current_address.current_county' }
  ] : [];
  const asyvIdentityFields =  user ? [
    { label: 'Grade', path: 'affiliation.grade_info.grade_id', dropdownKey: "grades"},
    { label: 'Family', path: 'affiliation.family_id', dropdownKey: "families" },
  ] : [];
  const academicYears = [
    { label: 'EY Combination', index: 3 },
    { label: 'S4 Combination', index: 2 },
    { label: 'S5 Combination', index: 1 },
    { label: 'S6 Combination', index: 0 }
  ];
  const combinationFields = user ? academicYears.map(({ label, index }) => ({
    label,
    value: (u) => u.academic_combinations?.[index]?.combination_id || "",
    dropdownKey: 'combinations',
    get path() {
      return `academic_combinations.${index}.combination_id`;
    }
  })) : [];
  const asyvAcademicFields = user ? [
    { label: 'S4 Grade', value: u => u.academic_combinations?.[2]?.marks + '%' },
    { label: 'S5 Grade', value: u => u.academic_combinations?.[1]?.marks + '%' },
    { label: 'S6 Grade', value: u => u.academic_combinations?.[0]?.marks + '%' },
    { label: 'National Exam Score', value: u => `${u.national_exam_results?.points_achieved}/${u.national_exam_results?.maximum_points} (${u.national_exam_results?.mention})` }
  ] : [];
  const leapProgramFields = user ? [
    {
      label: 'Leap Activities',
      // value returns array of leap ids for multi-select
      value: u => u.leap_activities?.map(a => a.leap_id.toString()) || [],
      dropdownKey: 'leaps',
      isMultiSelect: true
    }
  ] : [];
  const academicFields = [
    { label: 'Level', value: 'level', dropdownKey: 'levels' },
    { label: 'Degree', value: 'degree' },
    { label: 'University', value: 'college', dropdownKey: 'colleges' },
    { label: 'Location', value: 'country' },
    { label: 'Scholarship', value: 'scholarship', dropdownKey: 'scholarship'},
    { label: 'Scholarship Details', value: 'scholarship_details'},
    { label: 'Status', value: 'status', dropdownKey: 'status' }
  ];
  const employmentFields = [
    { label: 'Title', value: 'title' },
    { label: 'Company', value: 'company' },
    { label: 'Status', value: 'status', dropdownKey: 'employment_status'},
    { label: 'Industry', value: 'industry', dropdownKey: 'industries' },
    { label: 'Start Date', value: 'start_date',  type: 'date' },
    { label: 'End Date', value: 'end_date', type: 'date' }
  ];
  
  return (
    <div className="profile-container vertical-cards">
          
      <ProfileCardSection 
        title="Personal Info" canEdit={auth.user?.is_superuser}
        isEditing={editState.info}
        onToggleEdit={() => {
          if (editState.info) {
            saveKidInfo();
          }
          setEditState(prev => ({ ...prev, info: !prev.info }));
        }}
        onCancelEdit={() => {
          setUser(originalUser);
          setEditState(prev => ({ ...prev, info: false }));
        }}>
        {renderSection([user], (newArr) => setUser(newArr[0]), personalFields, editState.info)}
      </ProfileCardSection>
      <ProfileCardSection
        title="Current Info"
        isEditing={editState.current}
        onToggleEdit={() => {
          if (editState.current) {
            saveKidInfo();
          }
          setEditState(prev => ({ ...prev, current: !prev.current }));
        }}
        onCancelEdit={() => {
          setUser(originalUser);
          setEditState(prev => ({ ...prev, current: false }));
        }}
      >
        {renderSection([user], (newArr) => setUser(newArr[0]), currentInfoFields, editState.current)}
      </ProfileCardSection>
      <ProfileCardSection title="ASYV Info" canEdit={auth.user?.is_superuser}
        isEditing={editState.asyv}
        // When entering edit mode:
        onToggleEdit={async () => {
          if (editState.asyv) {
            try {
              await saveKidInfo(editUser);
              await fetchData(); // Refresh after saving
              setEditUser(null);
            } catch (err) {
              console.error("Save failed", err);
            }
          } else {
            // Entering edit mode — make a working copy
            setEditUser(user ? {
              ...user,
              academic_combinations: Array.isArray(user.academic_combinations) 
                ? [...user.academic_combinations] 
                : []
            } : null);
        
            // Ensure 4 slots
            setEditUser(prev => {
              if (!prev) return prev;
              while (prev.academic_combinations.length < 4) {
                prev.academic_combinations.unshift({ combination_id: "" });
              }
              return { ...prev };
            });
          }
        
          setEditState(prev => ({ ...prev, asyv: !prev.asyv }));
        }}
        onCancelEdit={() => {
          setEditUser(null);          // discard changes
          setEditState(prev => ({ ...prev, asyv: false }));
        }}
        >
        {renderSection([editState.asyv ? editUser : user],
  (newArr) => editState.asyv ? setEditUser(newArr[0]) : setUser(newArr[0]), asyvIdentityFields, editState.asyv)}
        {renderSection([editState.asyv ? editUser : user],
  (newArr) => editState.asyv ? setEditUser(newArr[0]) : setUser(newArr[0]), asyvAcademicFields, editState.asyv)}
        {renderSection([editState.asyv ? editUser : user],
  (newArr) => editState.asyv ? setEditUser(newArr[0]) : setUser(newArr[0]), combinationFields, editState.asyv)}
        {renderSection([editState.asyv ? editUser : user],
  (newArr) => editState.asyv ? setEditUser(newArr[0]) : setUser(newArr[0]), leapProgramFields, editState.asyv)}
      </ProfileCardSection>
      <ProfileCardSection
        title="Academic Info"
        isEditing={editState.academic}
        onToggleEdit={() => {
          if (editState.academic) {
            saveStudyData();
          }
          setEditState(prev => ({ ...prev, academic: !prev.academic }));
        }}
        onCancelEdit={() => {
          setStudy(originalStudy);
          setEditState(prev => ({ ...prev, academic: false }));
        }}

        onAddRow={() => setStudy(prev => [...prev, {}])}
      >
        {renderSection(study, setStudy, academicFields, editState.academic, false, true)}
      </ProfileCardSection>
      <ProfileCardSection
        title="Employment Info"
        isEditing={editState.employment}
        onToggleEdit={() => {
          if (editState.employment) {
            saveEmploymentData();
          }
          setEditState(prev => ({ ...prev, employment: !prev.employment }));
        }}
        onCancelEdit={() => {
          setEmployment(originalEmployment);
          setEditState(prev => ({ ...prev, employment: false }));
        }}

        onAddRow={() => setEmployment(prev => [...prev, {}])}
      >
        {renderSection(employment, setEmployment, employmentFields, editState.employment, true, false)}
      </ProfileCardSection>
      <button onClick={() => setShowVerifyModal(true)}>Change Password</button>
      {showVerifyModal && (
        <VerifyCurrentPasswordModal
          onVerify={handleVerifyPassword}
          onCancel={() => setShowVerifyModal(false)}
        />
      )}

      {showPasswordModal && (
        <ChangePasswordModal
          onSubmit={(newPassword) => handlePasswordChange(verifiedCurrentPassword, newPassword)}
          onSkip={() => setShowPasswordModal(false)}
        />
      )}

    </div>
  );
};
export default ProfileCard;