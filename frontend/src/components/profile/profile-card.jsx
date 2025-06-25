import React, { useState, useEffect, useMemo } from 'react';
import baseUrl from "../../api/baseUrl";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import './profile-card.css';


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
 

  console.log(userId)

  useEffect(() => {
    console.log("Received userId:", userId);
    const fetchData = async () => {
      try {
        const [userRes, dropdownRes] = await Promise.all([
          axios.get(baseUrl + '/kid/' + userId, {
            headers: { Authorization: 'Bearer ' + String(auth.accessToken), "Content-Type": 'multipart/form-data' },
            withCredentials: true
          }),
          axios.get(baseUrl + '/options/all-dropdowns/', { 
            headers: { Authorization: 'Bearer ' + String(auth.accessToken) },
            withCredentials: true
          
          })
        ]);
  
        //setUser_id(auth.user.id);
        setUser(userRes.data);
        setKid_id(userRes.data.basic_information?.kid_id);
        setDropdownOptions(dropdownRes.data); 
  
      } catch (err) {
        console.error(err);
      }
    };
  
    fetchData();
  }, [auth, userId]);

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
      setStudy(sortStudyLevel(studies));
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
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    console.log("user data", user);
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
      getStudy();
    } catch (error) {
      console.error(error);
      alert('Failed to save academic data.');
    }
  };
//Edit current info
  const saveKidInfo = async () => {
    console.log(user);
    try {
      await axios.put(`${baseUrl}/kid/${userId}/`, user, {
        headers: {
          Authorization: 'Bearer ' + String(auth.accessToken),
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      alert('Kid info saved!');
    } catch (err) {
      console.error(err);
      alert('Failed to save Kid info.');
    }
  };

  const collegeLookup = Object.fromEntries(
    dropdownOptions.colleges.map(c => [c.value, c.location])
  );
  //console.log(collegeLookup);

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((o, key) => o?.[key], obj);
  };
  
  const setNestedValue = (obj, path, value) => {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const nested = keys.reduce((o, k) => o[k] = o[k] || {}, obj);
    nested[lastKey] = value;
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
                  
                  if (editing && f.dropdownKey && dropdownOptions[f.dropdownKey]) {
                    return (
                      <td key={j}>
                        <select
                          value={val ?? ""}
                          onChange={(e) => {
                            const updated = [...data];
                            const itemCopy = { ...updated[i] };
                            const newValue = e.target.value;
  
                            if (f.path) {
                              setNestedValue(itemCopy, f.path, newValue);
                            } else {
                              itemCopy[f.value] = newValue;
                            }
  
                            // Special handling: update location when college changes
                            if (isAcademicSection && f.value === 'college') {
                              const locationInfo = collegeLookup[newValue];
                              setNestedValue(itemCopy, 'location', locationInfo?.location || "");
                            }
  
                            updated[i] = itemCopy;
                            setData(updated);
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
                            const updated = [...data];
                            const itemCopy = { ...updated[i] };
                            const newValue = e.target.value;
  
                            if (f.path) {
                              setNestedValue(itemCopy, f.path, newValue);
                            } else {
                              itemCopy[f.value] = newValue;
                            }
  
                            updated[i] = itemCopy;
                            setData(updated);
                          }}
                          style={{ width: "100%" }}
                          disabled={isAcademicSection && f.value === 'country'}
                        />
                      </td>
                    );
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
                        safeValue(val)
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  
      <div className="profile-fields mobile-only">
        <thead>
          <tr>{fields.map((f, i) => <th key={i}>{f.label}</th>)}</tr>
        </thead>
        {data.map((item, i) => (
          <div key={i} className="entry-block">
            {fields.map((f, j) => {
              const val = f.path
                ? getNestedValue(item, f.path)
                : typeof f.value === 'function'
                ? f.value(item)
                : item[f.value];
  
              if (editing && f.dropdownKey && dropdownOptions[f.dropdownKey]) {
                return (
                  <div key={j}>
                    <select
                      value={val ?? ""}
                      onChange={(e) => {
                        const updated = [...data];
                        const itemCopy = { ...updated[i] };
                        const newValue = e.target.value;

                        if (f.path) {
                          setNestedValue(itemCopy, f.path, newValue);
                        } else {
                          itemCopy[f.value] = newValue;
                        }

                        // Special handling: update location when college changes
                        if (isAcademicSection && f.value === 'college') {
                          const locationInfo = collegeLookup[newValue];
                          setNestedValue(itemCopy, 'location', locationInfo?.location || "");
                        }

                        updated[i] = itemCopy;
                        setData(updated);
                      }}
                      style={{ width: "100%" }}
                    >
                      <option value="" disabled>Select...</option>
                      {dropdownOptions[f.dropdownKey].map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                );
              }
  
              if (isAcademicSection && f.value === 'country') {
                return <div key={j}>{val || '-'}</div>;
              }
  
              if (editing) {
                return (
                  <td key={j}>
                    <input
                      type={f.type || "text"}
                      value={val ?? ""}
                      onChange={(e) => {
                        const updated = [...data];
                        const itemCopy = { ...updated[i] };
                        const newValue = e.target.value;

                        if (f.path) {
                          setNestedValue(itemCopy, f.path, newValue);
                        } else {
                          itemCopy[f.value] = newValue;
                        }

                        updated[i] = itemCopy;
                        setData(updated);
                      }}
                      style={{ width: "100%" }}
                      disabled={isAcademicSection && f.value === 'country'}
                    />
                  </td>
                );
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
                    safeValue(val)
                  )}
                </td>
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
    { label: 'Grade', value: u => u.affiliation?.grade_info?.grade_name },
    { label: 'Family', value: u => u.affiliation?.family_name },
    { label: 'Combination', value: u => u.academic_combinations?.[0]?.combination_name }
  ] : [];
  const asyvAcademicFields = user ? [
    { label: 'S4 Grade', value: u => u.academic_combinations?.[2]?.marks + '%' },
    { label: 'S5 Grade', value: u => u.academic_combinations?.[1]?.marks + '%' },
    { label: 'S6 Grade', value: u => u.academic_combinations?.[0]?.marks + '%' },
    { label: 'National Exam Score', value: u => `${u.national_exam_results?.points_achieved}/${u.national_exam_results?.maximum_points} (${u.national_exam_results?.mention})` }
  ] : [];
  const leapProgramFields = user ? [
    { label: 'Leap Program', value: u => u.leap_activities?.map((a) => `${a.leap_name}`).join(", ") || 'Not Found' }
  ] : [];
  const academicFields = [
    { label: 'Level', value: 'level', dropdownKey: 'levels' },
    { label: 'Degree', value: 'degree' },
    { label: 'University', value: 'college', dropdownKey: 'colleges' , allowCustom: true},
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
        onCancelEdit={() => setEditState(prev => ({ ...prev, info: false }))}>
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
        onCancelEdit={() => setEditState(prev => ({ ...prev, current: false }))}
      >
        {renderSection([user], (newArr) => setUser(newArr[0]), currentInfoFields, editState.current)}
      </ProfileCardSection>
      <ProfileCardSection title="ASYV Info" canEdit={auth.user?.is_superuser}
        isEditing={editState.asyv}
        onToggleEdit={() => {
          if (editState.asyv) {
            saveKidInfo();
          }
          setEditState(prev => ({ ...prev, asyv: !prev.asyv }));
        }}
        onCancelEdit={() => setEditState(prev => ({ ...prev, asyv: false }))}>
        {renderSection([user], (newArr) => setUser(newArr[0]), asyvIdentityFields, editState.asyv)}
        {renderSection([user], (newArr) => setUser(newArr[0]), asyvAcademicFields, editState.asyv)}
        {renderSection([user], (newArr) => setUser(newArr[0]), leapProgramFields, editState.asyv)}
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
        onCancelEdit={() => setEditState(prev => ({ ...prev, academic: false }))}
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
        onCancelEdit={() => setEditState(prev => ({ ...prev, employment: false }))}
        onAddRow={() => setEmployment(prev => [...prev, {}])}
      >
        {renderSection(employment, setEmployment, employmentFields, editState.employment, true, false)}
      </ProfileCardSection>
    </div>
  );
};
export default ProfileCard;