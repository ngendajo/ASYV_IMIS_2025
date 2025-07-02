import React, { useState, useMemo } from 'react';
import useAuth from '../../hooks/useAuth';
import DynamicTable from "../pages/dinamicTable/DynamicTable";
import { fetchEapAttByRangeOfDate } from '../../services/eapAttendanceServices';

export default function EapsReports() {
  const { auth } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [title, setTitle] = useState('');
  const [data, setData] = useState([]);
  const [late, setLate] = useState([]);
  const [generalList, setGeneralList] = useState([]);

  const buttonStyles = {
    input: {
      padding: '10px',
      fontSize: '14px',
      borderRadius: '5px',
      border: '1px solid #ccc',
      marginBottom: '10px',
      width: '200px',
    },
    label: {
      fontSize: '16px',
      marginRight: '10px',
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      margin: '20px 0',
    },
    common: {
      padding: '10px 20px',
      margin: '5px',
      border: 'none',
      borderRadius: '5px',
      color: '#fff',
      cursor: 'pointer',
      fontSize: '16px',
    },
    thisWeek: {
      backgroundColor: '#47805F',
    },
    thisMonth: {
      backgroundColor: '#F49B45',
    },
    custom: {
      backgroundColor: '#002F6C',
    },
  };

  // Function to group data by class_name and date
  const groupData = (data) => {
    return data.reduce((grouped, item) => {
      const key = `${item.class_name}-${item.date}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          class_name: item.class_name,
          date: item.date,
          students_count: {
            total: 0,
            absent: 0,
            late: 0,
            present: 0
          }
        };
      }
      
      grouped[key].students_count.total++;
      
      switch(item.status) {
        case 'absent':
          grouped[key].students_count.absent++;
          break;
        case 'late':
          grouped[key].students_count.late++;
          break;
        case 'present':
        default:
          grouped[key].students_count.present++;
          break;
      }
      
      return grouped;
    }, {});
  };

  // Corrected groupedStudents function
  const groupedStudents = useMemo(() => {
    return (studentData) => {
      const absentStudents = new Map();
      const lateStudents = new Map();

      studentData.forEach(student => {
        const key = `${student.date}-${student.first_name}-${student.last_name}`;

        if (student.status === 'absent') {
          absentStudents.set(key, student);
        } else if (student.status === 'late') {
          lateStudents.set(key, student);
        }
      });

      return {
        absent: Array.from(absentStudents.values()),
        late: Array.from(lateStudents.values())
      };
    };
  }, []);

  const getData = async (date1, date2) => {
    try {
      const response = await fetchEapAttByRangeOfDate(auth, date1, date2);
      
      // Convert grouped object to array for easier rendering
      const groupedData = Object.values(groupData(response.data.data));
      
      // Call groupedStudents function
      const studentGroups = groupedStudents(response.data.data);
      
      // Update state
      setData(studentGroups.absent);
      setLate(studentGroups.late);
      setGeneralList(groupedData);
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      // Uncomment and adjust navigation as needed
      // navigate('/error');
    }
  };

  // Helper function to format dates
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const filterWeek = () => {
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - dayOfWeek + 1); // Adjust to Monday
  
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 4); // Adjust to Friday
  
    const startDateFormatted = formatDate(startOfWeek);
    const endDateFormatted = formatDate(endOfWeek);
  
    setTitle(`This week: ${startDateFormatted} to ${endDateFormatted}`);
    getData(startDateFormatted, endDateFormatted);
  };

  const filterMonth = () => {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
    const startDateFormatted = formatDate(startOfMonth);
    const endDateFormatted = formatDate(endOfMonth);
  
    setTitle(`This month: ${startDateFormatted} to ${endDateFormatted}`);
    getData(startDateFormatted, endDateFormatted);
  };
  
  const filterCustomDateRange = () => {
    if (startDate && endDate) {
      setTitle(`From ${startDate} to ${endDate}`);
      getData(startDate, endDate);
    } else {
      alert("Please select both start and end dates");
    }
  };
  console.log(generalList,data,late)
  return (
    <div>
      <div style={buttonStyles.container}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <button 
            style={{ ...buttonStyles.common, ...buttonStyles.thisWeek }}
            onClick={filterWeek}
          >
            This Week
          </button>
          <button 
            style={{ ...buttonStyles.common, ...buttonStyles.thisMonth }}
            onClick={filterMonth}
          >
            This Month
          </button>
        </div>

        <div>
          <h2>Filter Data by Custom Date Range</h2>
          <div>
            <label style={buttonStyles.label}>
              Start Date:
              <input
                type="date"
                style={buttonStyles.input}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
          </div>

          <div>
            <label style={buttonStyles.label}>
              End Date:
              <input
                type="date"
                style={buttonStyles.input}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
          </div>

          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <button
              style={{ ...buttonStyles.common, ...buttonStyles.custom }}
              onClick={filterCustomDateRange}
            >
              Filter by Date Range
            </button>
          </div>
        </div>
      </div>
      <h2 style={{ textAlign: 'center' }}>{title}</h2>
        {generalList.length>0 ?
          <div>
            <h2>1. General Overview</h2>
            <DynamicTable
              mockdata={generalList.map(
                  ({ class_name, date, students_count}, index) => ({
                      No: index + 1,
                      Date: date,
                      Class: class_name,
                      Absent: students_count.absent,
                      Late: students_count.late,
                  })
              )}
          />
          </div>:<p>Attendance not taken in this period</p>
        }

        {data.length>0 ?
          <div>
            <h2>2. Absence(s) List</h2>
            <DynamicTable
              mockdata={data.map(
                  ({ class_name, date, school_name,first_name,last_name,staff_first_name,staff_last_name,status}, index) => ({
                      No: index + 1,
                      Date: date,
                      Name:`${last_name} ${first_name}`,
                      School: school_name,
                      Class: class_name,
                      TakenBy:`${staff_last_name} ${staff_first_name}`,
                      Status: status
                  })
              )}
          />
          </div>:<p>No Absences in this period</p>
        }
        {late.length>0 ?
          <div>
            <h2>3. List of late comers</h2>
            <DynamicTable
              mockdata={late.map(
                  ({ class_name, date, school_name,first_name,last_name,staff_first_name,staff_last_name,status}, index) => ({
                      No: index + 1,
                      Date: date,
                      Name:`${last_name} ${first_name}`,
                      School: school_name,
                      Class: class_name,
                      TakenBy:`${staff_last_name} ${staff_first_name}`,
                      Status: status
                  })
              )}
          />
          </div>:<p>No Absences in this period</p>
        }
      
    </div>
  );
}