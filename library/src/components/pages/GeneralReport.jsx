import React, {useState, useEffect} from 'react'
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import baseUrl from "../../api/baseUrl";
import { utils, writeFile } from 'xlsx'; 
import { fetchStudentsPerGrade } from '../../services/generalReportServices';
import DynamicTable from "./dinamicTable/DynamicTable";
import './AttendanceTable.css'; 

export default function GeneralReport() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [title, setTitle] = useState('');
    const [data, setData] = useState([]);
    const [studentsPerGrade, setStudentsPerGrade]=useState([])
    const [late, setLate] = useState([]);
    const [generalList, setGeneralList] = useState([]);
    const [generalReports, setGeneralReports] = useState([]);
    let {auth} = useAuth();
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
          justifyContent: 'space-around', // Spacing between buttons
          alignItems: 'center', // Align items in the center vertically
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
        today: {
          backgroundColor: '#002F6C',
        },
        thisWeek: {
          backgroundColor: '#47805F',
        },
        thisMonth: {
          backgroundColor: '#F49B45',
        },
        custom: {
          backgroundColor: '#002F6C', // You can change this color if you prefer
        },
      };
      useEffect(() => {
        fetchStudentsPerGrade(auth)
            .then(response => {
                // Transform the data by mapping over it and updating grade_name
                const transformedData = response.data.data.map(item => ({
                ...item,
                grade_name: getGrade(item.grade_name)
                }));
                setStudentsPerGrade(transformedData);
            });
    }, [auth]);

    const gradeOrder = ["EY", "S4", "S5", "S6"]; // Define the custom order

const combineStats = (gradeStats) => {
  const combined = [];
  
  studentsPerGrade.forEach(student => {
    const matchingStat = gradeStats.find(stat => stat.grade_name === student.grade_name);
    
    combined.push({
      grade: student.grade_name,
      count_Female: matchingStat ? matchingStat.count_Female : 0,
      count_Male: matchingStat ? matchingStat.count_Male : 0,
      total_female: student.total_female,
      total_male: student.total_male,
      total_students: student.total_students
    });
  });

  // Sort based on the defined grade order
  return combined.sort((a, b) => {
    const indexA = gradeOrder.indexOf(a.grade);
    const indexB = gradeOrder.indexOf(b.grade);
    return indexA - indexB;
  });
};

    const getGrade = (grade_name) => {
        const grade = grade_name === "Intwali" ? "S6" :
                      grade_name === "Ishami" ? "S5" :
                      grade_name === "Ijabo" ? "S4" : "EY";
        return grade
      };

      const getClass = (grade_name, combination_name) => {
        const grade =getGrade(grade_name) 
        const comb = (combination_name.match(/\(([^)]+)\)/) || [])[1]?.trim() || combination_name;
        return grade === grade_name ? comb : grade + "_" + comb;
      };
      const groupData = (data) => {
        const grouped = {};
        data.forEach(item => {
            const key = `${item.date}_${item.studentid}_${item.first_name.trim()}_${item.last_name}`;
            if (!grouped[key]) {
                grouped[key] = {
                    combination_name: item.combination_name,
                    date:item.date,
                    family_name:item.family_name,
                    first_name:item.first_name,
                    gender:item.gender==="F"?"Female":"Male",
                    grade_name:item.grade_name,
                    last_name:item.last_name,
                    studentid:item.studentid,
                    activities: []
                };
            }
            grouped[key].activities.push({
                activity: item.activity,
                absenteeism_status: item.absenteeism_status,
                teacher:item.teacher_first_name+" "+item.teacher_last_name
            });
        });
        return Object.values(grouped);
    };
    const separateByAbsenteeismStatus = (data) => {
        const absentData = [];
        const lateData = [];
    
        data.forEach(student => {
            // Separate activities based on absenteeism status
            const absentActivities = student.activities.filter(activity => activity.absenteeism_status === 'absent');
            const lateActivities = student.activities.filter(activity => activity.absenteeism_status === 'late');
    
            if (absentActivities.length > 0) {
                absentData.push({
                    ...student,
                    activities: absentActivities
                });
            }
    
            if (lateActivities.length > 0) {
                lateData.push({
                    ...student,
                    activities: lateActivities
                });
            }
        });
    
        return { absentData, lateData };
    };
    const processGradeStats = (students) => {
        return Object.values(
          students.reduce((acc, student) => {
            const grade = student.grade_name;
            
            if (!acc[grade]) {
              acc[grade] = {
                grade_name: grade,
                count_Female: 0,
                count_Male: 0
              };
            }
            
            acc[grade][`count_${student.gender}`]++;
            return acc;
          }, {})
        ).sort((a, b) => a.grade_name.localeCompare(b.grade_name));
      };
    const groupByStudentId = (data) => {
        const grouped = {};
        let i=0;
        data.forEach(item => {
            const studentId = item.studentid;
            
            if (!grouped[studentId]) {
                grouped[studentId] = {
                    "#":++i,
                    studentid: studentId,
                    last_name: item.last_name.trim(),
                    first_name: item.first_name.trim(),
                    class_name:getClass(item.grade_name,item.combination_name),
                    grade_name:getGrade(item.grade_name),
                    family_name: item.family_name,
                    gender: item.gender,
                    count: 1 // Initialize count to 1 since this student appears at least once
                };
            } else {
                // Increment the count for the student if they already exist in the group
                grouped[studentId].count++;
            }
        });
    
        // Return an array of grouped data
        return Object.values(grouped);
    };
      const getData = async (date1,date2) =>{
        try{
            const response = await axios.get(`${baseUrl}/attendance-report/?date1=${date1}&date2=${date2}`,{
                headers: {
                    "Authorization": 'Bearer ' + String(auth.accessToken),
                    "Content-Type": 'multipart/form-data'
                },
                withCredentials:true 
            });
            const groupedData = groupData(response.data);
            const { absentData, lateData } = separateByAbsenteeismStatus(groupedData);
            const groupedAbsentData = groupByStudentId(absentData);
            const gradeStats = processGradeStats(groupedAbsentData);
            setGeneralReports(combineStats(gradeStats))
            setData(absentData)
            setLate(lateData)
            setGeneralList(groupedAbsentData)

        }catch(err) {
            console.log(err);
            //navigate('/error');
        }
    }
      const filterToday = () => {
        const today = new Date().toISOString().split('T')[0]; // Format 'YYYY-MM-DD'
        setTitle("Today's Report: "+today)
        getData(today,today)
      };
      const filterWeek = () => {
        const currentDate = new Date();
        
        // Get the current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
        const dayOfWeek = currentDate.getDay();
        
        // Calculate the start of the week (Monday)
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - dayOfWeek + 1); // Set to Monday of the current week
      
        // Calculate the end of the week (Friday)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 4); // Add 4 days to get Friday
      
        // Format dates as 'YYYY-MM-DD'
        const formatDate = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };
      
        const startDateFormatted = formatDate(startOfWeek);
        const endDateFormatted = formatDate(endOfWeek);
      
        console.log(`This week (Monday to Friday): ${startDateFormatted} to ${endDateFormatted}`);
        setTitle(`This week (Monday to Friday): ${startDateFormatted} to ${endDateFormatted}`)
        getData(startDateFormatted,endDateFormatted)
      };
      const filterMonth = () => {
        const currentDate = new Date();
      
        // Get the first day of the current month
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      
        // Get the last day of the current month
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0); // Set the day to 0 to get the last day of the previous month
      
        // Format dates as 'YYYY-MM-DD'
        const formatDate = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };
      
        const startDateFormatted = formatDate(startOfMonth);
        const endDateFormatted = formatDate(endOfMonth);
      
        console.log(`This month: ${startDateFormatted} to ${endDateFormatted}`);
        setTitle(`This month: ${startDateFormatted} to ${endDateFormatted}`)
        getData(startDateFormatted,endDateFormatted)
      };
      
      const filterCustomDateRange = () => {
        if (startDate && endDate) {
          console.log(`Custom: ${startDate} to ${endDate}`);
          setTitle(`From ${startDate} to ${endDate}`)
          getData(startDate,endDate)
        } else {
          console.log("Select date");
        }
      };
      const downloadData = () => {
        if (generalList.length === 0) {
            console.error("No data available to export.");
            return;
        }
    
        // Extract headers from the keys of the first object
        const headers = Object.keys(generalList[0]);
    
        // Prepare the data for export
        const data = generalList.map(item => 
            Object.values(item) // Extract values for each row
        );
    
        // Create a new worksheet with headers and data
        const worksheet = utils.aoa_to_sheet([headers, ...data]);
    
        // Create a new workbook and append the worksheet
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "Student Absenteeism Data");
    
        // Create a filename with the current date, time, and nanoseconds
        const now = new Date();
        const currentTime = now.toISOString().replace(/[-:]/g, '').split('.')[0]; // Format: YYYYMMDDTHHMMSS
        const nanoseconds = now.getMilliseconds() * 1000000; // Get nanoseconds
        const fileName = `student_data_${currentTime}_${nanoseconds}.xlsx`;
    
        // Trigger the file download
        writeFile(workbook, fileName);
    };
    const downloadGeneralReports = () => {
        if (generalReports.length === 0) {
            console.error("No data available to export.");
            return;
        }
    
        // Define headers for the table
        const headers = [
            "Department",
            "Grade",
            "Number of girls",
            "Number of boys",
            "Total",
            "%",
            "Total girls",
            "Total boys",
            "Total Number"
        ];
    
        // Prepare data rows for absenteeism
        const absenteeismRows = generalReports.map((row, index) => [
            index === 0 ? "LFHS Absenteeism" : "", // Department column
            row.grade,
            row.count_Female || "",
            row.count_Male || "",
            (row.count_Female + row.count_Male) || "",
            row.total_students && row.total_students > 0
                ? `${(((row.count_Female + row.count_Male) / row.total_students) * 100).toFixed(2)}%`
                : "",
            row.total_female || "",
            row.total_male || "",
            row.total_students || ""
        ]);
    
        // Prepare data rows for attendance
        const attendanceRows = generalReports.map((row, index) => [
            index === 0 ? "LFHS Attendance" : "", // Department column
            row.grade,
            (row.total_female - row.count_Female) || "",
            (row.total_male - row.count_Male) || "",
            (row.total_students - (row.count_Female + row.count_Male)) || "",
            row.total_students && row.total_students > 0
                ? `${(((row.total_students - (row.count_Female + row.count_Male)) / row.total_students) * 100).toFixed(2)}%`
                : "",
            "", // Total girls column (not applicable for attendance rows)
            "", // Total boys column (not applicable for attendance rows)
            ""  // Total number column (not applicable for attendance rows)
        ]);
    
        // Combine headers and rows
        const data = [headers, ...absenteeismRows, ...attendanceRows];
    
        // Create a new worksheet with the data
        const worksheet = utils.aoa_to_sheet(data);
    
        // Create a new workbook and append the worksheet
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "General Reports");
    
        // Create a filename with the current date, time, and nanoseconds
        const now = new Date();
        const currentTime = now.toISOString().replace(/[-:]/g, '').split('.')[0]; // Format: YYYYMMDDTHHMMSS
        const nanoseconds = now.getMilliseconds() * 1000000; // Get nanoseconds
        const fileName = `general_reports_${currentTime}_${nanoseconds}.xlsx`;
    
        // Trigger the file download
        writeFile(workbook, fileName);
    };
    
       //console.log("data",generalList,"st",studentsPerGrade) 
  return (
    <div>
        <div style={buttonStyles.container}>
            
            {/* Button to filter today's data */}
            <button
                style={{ ...buttonStyles.common, ...buttonStyles.today }}
                onClick={filterToday}  // Call filterToday on button click
            >
                Today
            </button>
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
            <div>
                <h2>Filter Data by Custom Date Range</h2>

                    {/* Input fields for selecting the start and end dates */}
                    <div>
                        <label style={buttonStyles.label}>
                        Start Date:
                        <input
                            type="date"
                            style={buttonStyles.input}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)} // Update start date
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
                            onChange={(e) => setEndDate(e.target.value)} // Update end date
                        />
                        </label>
                    </div>

                    {/* Button to filter data between the custom date range */}
                    <button
                        style={{ ...buttonStyles.common, ...buttonStyles.custom }}
                        onClick={filterCustomDateRange}  // Call filterCustomDateRange when button is clicked
                    >
                        Filter by Date Range
                    </button>
            </div>
        </div>
        <h2>{title}</h2>
        <div className="attendance-table">
            <h2>1.1 Students Attendance</h2>
            <button 
                style={{ ...buttonStyles.common, ...buttonStyles.today }} 
                onClick={downloadGeneralReports}>
                    Download Report
            </button>
            <table>
                <thead>
                <tr>
                    <th>Department</th>
                    <th>Grade</th>
                    <th>Number of girls</th>
                    <th>Number of boys</th>
                    <th>Total</th>
                    <th>%</th>
                    <th>Total girls</th>
                    <th>Total boys</th>
                    <th>Total Number</th>
                </tr>
                </thead>
                <tbody>
                {/* LFHS attendance section */}
                {
                    generalReports.map((row, index) => (
                        <tr key={index}>
                            {index === 0 && (
                                <td rowSpan={generalReports.length}>
                                LFHS Absenteeism
                                </td>
                            )}
                            <td>{row.grade}</td>
                            <td>{row.count_Female || ""}</td>
                            <td>{row.count_Male || ""}</td>
                            <td>{row.count_Female+row.count_Male || ""}</td>
                            <td className="percentage">
                                {row.total_students && row.total_students > 0
                                ? `${(((row.count_Female + row.count_Male) / row.total_students) * 100).toFixed(2)}%`
                                : ""}
                            </td>
                            <td>{row.total_female || ""}</td>
                            <td>{row.total_male || ""}</td>
                            <td>{row.total_students || ""}</td>
                        </tr>
                        ))
                        
                }
                {
                    generalReports.map((row, index) => (
                        <tr key={index}>
                            {index === 0 && (
                                <td rowSpan={generalReports.length}>
                                LFHS Attendance
                                </td>
                            )}
                            <td>{row.grade}</td>
                            <td>{row.total_female-row.count_Female || ""}</td>
                            <td>{row.total_male-row.count_Male || ""}</td>
                            <td>{row.total_students-(row.count_Female+row.count_Male) || ""}</td>
                            <td className="percentage">
                                {row.total_students && row.total_students > 0
                                ? `${(((row.total_students-(row.count_Female + row.count_Male)) / row.total_students) * 100).toFixed(2)}%`
                                : ""}
                            </td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        ))
                        
                }
                </tbody>
            </table>
            </div>
        <button
                style={{ ...buttonStyles.common, ...buttonStyles.today }}
                onClick={downloadData}
            >
                Download Data
        </button>
        <DynamicTable 
            mockdata={generalList.map(({ grade_name, ...rest }) => rest)} 
        />
        <div>
            <h2>Absenteeism</h2>
        {data.length > 0 ? data.map((st, index) => (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            flexDirection: 'row',
                            fontWeight: 'bold',
                            gap: '10px',
                            borderBottom: '5px solid #ccc',
                            padding: '5px'
                        }}
                    >
                        <div style={{ fontWeight: 'bold', color: '#6d5736' }}>{index + 1}.</div>
                        <div style={{ fontWeight: 'bold', color: '#6d5736' }}>
                            <h3>{st.first_name} {st.last_name}</h3>
                            <p>{st.studentid}</p>
                            <p>{st.gender==="F"?"Female":"Male"}</p>
                            <p>{getClass(st.grade_name,st.combination_name)}</p>
                            <p>{st.date}</p>
                            </div>
                        
                        {st.activities.length > 0 && st.activities.map((sbj, i) => (
                            <div
                                key={i}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center', // Center items within the subject card
                                    textAlign: 'center',   // Center text inside the subject card
                                    gap: '5px',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    backgroundColor: i % 2 === 0 ? '#d8b040' : '#f49c46'
                                }}
                            >
                                <h3 style={{ color: '#498160', margin: '4px 0' }}>{sbj.activity}</h3>
                                <p style={{ fontSize: '14px', color: '#6d5736', margin: '2px 0' }}>
                                    status:{sbj.absenteeism_status} <br/> taken by <br/> {sbj.teacher}
                                </p>
                            </div>
                        ))}
                </div>
                
                
                )) : <p>No Data</p>}
            <h2>Lateness</h2>
        {late.length > 0 ? late.map((st, index) => (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            flexDirection: 'row',
                            fontWeight: 'bold',
                            gap: '10px',
                            borderBottom: '5px solid #ccc',
                            padding: '5px'
                        }}
                    >
                        <div style={{ fontWeight: 'bold', color: '#6d5736' }}>{index + 1}.</div>
                        <div style={{ fontWeight: 'bold', color: '#6d5736' }}>
                            <h3>{st.first_name} {st.last_name}</h3>
                            <p>{st.studentid}</p>
                            <p>{st.gender==="F"?"Female":"Male"}</p>
                            <p>{getClass(st.grade_name,st.combination_name)}</p>
                            <p>{st.date}</p>
                        </div>
                        
                        {st.activities.length > 0 && st.activities.map((sbj, i) => (
                            <div
                                key={i}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center', // Center items within the subject card
                                    textAlign: 'center',   // Center text inside the subject card
                                    gap: '5px',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    backgroundColor: i % 2 === 0 ? '#d8b040' : '#f49c46'
                                }}
                            >
                                <h3 style={{ color: '#498160', margin: '4px 0' }}>{sbj.activity}</h3>
                                <p style={{ fontSize: '14px', color: '#6d5736', margin: '2px 0' }}>
                                    status:{sbj.absenteeism_status} <br/> taken by <br/> {sbj.teacher}
                                </p>
                            </div>
                        ))}
                </div>
                
                
                )) : <p>No Data</p>}
        </div>
    </div>
  )
}
