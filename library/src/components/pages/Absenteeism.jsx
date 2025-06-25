import React, {useState, useEffect} from 'react'
import { utils, writeFile } from 'xlsx'; 
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import baseUrl from "../../api/baseUrl";
import DynamicTable from "./dinamicTable/DynamicTable";

export default function Absenteeism() {
    const [data, setData] = useState([]);
    const [late, setLate] = useState([]);
    const [grade_students, setGrade_students] = useState([]);
    const [filtered_data, setFiltered_data] = useState([]);
    const [latefiltered_data, setLatefiltered_data] = useState([]);
    const [general_data, setGeneral_data] = useState([]);
    const [general_report, setGeneral_report] = useState([]);
    const [grandTotalGirls, setGrandTotalGirls] = useState("");
    const [grandTotalBoys, setGrandTotalBoys] = useState("");
    const [grandTotal, setGrandTotal] = useState("");
    const [cgrandTotalGirls, setCgrandTotalGirls] = useState("");
    const [cgrandTotalBoys, setCgrandTotalBoys] = useState("");
    const [cgrandTotal, setCgrandTotal] = useState("");
    let {auth} = useAuth();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const calculateCounts = (filtered) => {
    const counts = {};
  
    filtered.forEach((student) => {
      const { grade_name, gender, end_academic_year } = student;
      if (!counts[grade_name]) {
        counts[grade_name] = { boys: 0, girls: 0, end_academic_year };
      }
      if (gender === 'M') {
        counts[grade_name].boys += 1;
      } else if (gender === 'F') {
        counts[grade_name].girls += 1;
      }
    });
    let student_data = Object.entries(counts)
    .map(([grade_name, { boys, girls, end_academic_year }]) => ({
      grade_name,
      boys,
      girls,
      total: boys + girls,
      end_academic_year,
    }))
    .sort((a, b) => a.end_academic_year - b.end_academic_year);
    setGrandTotalGirls(student_data.reduce((sum, row) => sum + row.girls, 0))
    setGrandTotalBoys(student_data.reduce((sum, row) => sum + row.boys, 0))
    setGrandTotal((student_data.reduce((sum, row) => sum + row.girls, 0))+(student_data.reduce((sum, row) => sum + row.boys, 0)))
    
    const mergedArray = student_data.map(item1 => {
        const item2 = grade_students.find(item => item.grade_name === item1.grade_name);
        return { ...item1, ...(item2 || {}) };
    });
    setCgrandTotalGirls(grade_students.reduce((sum, row) => sum + row.cgirls, 0))
    setCgrandTotalBoys(grade_students.reduce((sum, row) => sum + row.cboys, 0))
    setCgrandTotal((grade_students.reduce((sum, row) => sum + row.cgirls, 0))+(grade_students.reduce((sum, row) => sum + row.cboys, 0)))
    setGeneral_report(mergedArray)
};



    useEffect(() =>{
      const getGradeData = async () => {
        try {
            const response = await axios.get(baseUrl + '/students/', {
                headers: {
                    "Authorization": 'Bearer ' + String(auth.accessToken),
                    "Content-Type": 'application/json'  // Use JSON as content type
                },
                withCredentials: true
            });
    
            // Access the 'data' field in the response, which contains the array of students
            const gradeCountsArray = Object.entries(
                response.data.reduce((acc, student) => {
                    const grade = student.grade_name;
                    const gender = student.gender; // Assuming 'gender' field is available
    
                    // Initialize the grade entry if not already present
                    if (!acc[grade]) {
                        acc[grade] = { ctotal: 0, cboys: 0, cgirls: 0 };
                    }
    
                    // Update the total count and gender-specific counts
                    acc[grade].ctotal += 1;
                    if (gender === 'M') {
                        acc[grade].cboys += 1;
                    } else if (gender === 'F') {
                        acc[grade].cgirls += 1;
                    }
    
                    return acc;
                }, {})
            ).map(([grade_name, counts]) => ({
                grade_name, 
                ctotal: counts.ctotal, 
                cboys: counts.cboys, 
                cgirls: counts.cgirls
            }));
            setGrade_students(gradeCountsArray)
        } catch (err) {
            console.log(err);
            // navigate('/error');
        }
    };
    

    getGradeData();
    
        const getData = async () =>{
            try{
                const response = await axios.get(baseUrl+'/attendances/',{
                    headers: {
                        "Authorization": 'Bearer ' + String(auth.accessToken),
                        "Content-Type": 'multipart/form-data'
                    },
                    withCredentials:true 
                });
                var data = response.data;
                var organized_data = [];
                var processed = {};

                data.forEach(record => {
                    // Define the key as a combination of studentid and date
                    let key = `${record['studentid']}_${record['date']}`;

                    // Check if the key is already processed
                    if (!(key in processed)) {
                        // Initialize a new record for this student and date
                        let row = {
                            "date": record['date'],
                            "studentid": record['studentid'],
                            "name": (record['student_last_name'] + " " + record['student_first_name'])
                                .split(' ')
                                .map(name => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase())
                                .join(' '),
                            "gender": record['gender'],
                            "family_name": record['family_name'],
                            "grade_name": record['grade_name'],
                            "end_academic_year": record['end_academic_year'],
                            "combination_name": record['combination_name'],
                            "comment": record['comment'],
                            "id": record['id'],
                            // Initialize 7 period keys with empty values
                            "period_1": " ",
                            "period_2": " ",
                            "period_3": " ",
                            "period_4": " ",
                            "period_5": " ",
                            "period_6": " ",
                            "period_7": " ",
                            // Initialize hasAbsent to false
                            "hasAbsent": false
                        };
                        // Add the record to organized_data and mark it as processed
                        organized_data.push(row);
                        processed[key] = row;
                    }

                    // Map the staff details to the corresponding period key (period_1, period_2, etc.)
                    let period_key = `period_${record['period']}`; // Create the period key (e.g., 'period_1')
                    let periodValue = (record['status']).split(' ').map(name => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()).join(' ') + " Taken By (" + record['staff_last_name'] + " " + record['staff_first_name'] + ")";
                    processed[key][period_key] = periodValue;

                    // Check if the period value contains the word "absent" and update hasAbsent
                    if (record['status']==="absent") {
                        processed[key]["hasAbsent"] = true;
                    }
                });

                // Set the final data
                // Split organized_data based on hasAbsent value
                var dataWithAbsent = organized_data.filter(record => record.hasAbsent);
                var dataWithoutAbsent = organized_data.filter(record => !record.hasAbsent);

                // Set data with hasAbsent: true in setData and others in setLate
                setData(dataWithAbsent);
                setLate(dataWithoutAbsent);

            }catch(err) {
                console.log(err);
                //navigate('/error');
            }
        }
        getData();
    
    },[auth])
    //console.log(data)
    //console.log(late)
    // Function to filter today's data
  const filterToday = () => {
    const today = new Date().toISOString().split('T')[0]; // Format 'YYYY-MM-DD'
    const filtered = data.filter(item => item.date === today);
    const latefiltered = late.filter(item => item.date === today);
    setFiltered_data(filtered);
    setLatefiltered_data(latefiltered)
    generalData(filtered);
  };

  const addComment =(params)=> {
    console.log("Add comment to: "+params)
  };

  const filterWeek = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday of the current week

    const startOfWeekString = startOfWeek.toISOString().split('T')[0]; // Format 'YYYY-MM-DD'
    const todayString = today.toISOString().split('T')[0];

    const filtered = data.filter(
      item => item.date >= startOfWeekString && item.date <= todayString
    );
    const latefiltered = late.filter(
      item => item.date >= startOfWeekString && item.date <= todayString
    );

    setFiltered_data(filtered);
    setLatefiltered_data(latefiltered)
    generalData(filtered);
  };

  const filterMonth = () => {
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7); // Get the current year and month in 'YYYY-MM' format

    const filtered = data.filter(
      item => item.date.slice(0, 7) === currentMonth
    );
    const latefiltered = late.filter(
      item => item.date.slice(0, 7) === currentMonth
    );
    setFiltered_data(filtered);
    setLatefiltered_data(latefiltered)
    generalData(filtered);
  };

    // Function to filter data between custom start and end dates
  const filterCustomDateRange = () => {
    if (startDate && endDate) {
      const filtered = data.filter(
        item => item.date >= startDate && item.date <= endDate
      );
      const latefiltered = late.filter(
        item => item.date >= startDate && item.date <= endDate
      );
      setFiltered_data(filtered);
      setLatefiltered_data(latefiltered)
      generalData(filtered);
    }
  };
  const generalData = (filtered) => {
    let studentCountArray = []; // To store the count of each student as an array
    let id = 1;

    filtered.forEach(record => {
        let studentid = record['studentid'];

        // Find if the student already exists in the array
        let student = studentCountArray.find(s => s.studentid === studentid);

        if (student) {
            // If student exists, increment the count
            student.count++;
        } else {
            // If student is encountered for the first time, add a new entry
            studentCountArray.push({
                "#": id++, // Assigning a sequential ID
                "studentid": studentid,
                "name": record['name'],
                "gender": record['gender'],
                "grade_name": record['grade_name'],
                "end_academic_year": record['end_academic_year'],
                "combination_name": record['combination_name'],
                "family_name": record['family_name'],
                "count": 1 // Start count at 1
            });
        }
    });

    // Sort the studentCountArray by count in descending order
    studentCountArray.sort((a, b) => b.count - a.count);

    // Set the sorted data
    setGeneral_data(studentCountArray);
    calculateCounts(studentCountArray);
};
  const downloadData = () => {
    // Prepare data for export
    const data = filtered_data.map((item, index) => ([
      `${index + 1}.`,                           // No.
      item.date,                                 // Date
      item.studentid,                            // Student ID
      item.name,  // Name
      item.grade_name,                           // Grade
      item.family_name,                          // Family Name
      item.combination_name,                     // Combination
      item.comment, 
      item.period_1,
      item.period_2,
      item.period_3,
      item.period_4,
      item.period_5,
      item.period_6,
      item.period_7
    ]));

    // Add headers for the columns
    const headers = [
      "No", "Date", "Student ID", "Name", "Grade", "Family Name", "Combination","Comment",
      "Period 1", "Period 2", "Period 3", "Period 4", "Period 5", "Period 6", "Period 7"
    ];

    // Create a new worksheet with the data and headers
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
      const exportToExcel = () => {
        // Prepare data for Absenteeism section
        const absenteeismData = general_report.map(({ grade_name, girls, cgirls, boys, cboys, total, ctotal }) => ({
          Type: 'Absenteeism',
          Grade: grade_name ==="Intwali"?"S6":grade_name==="Ishami"?"S5":grade_name==="Ijabo"?"S4":"EY",
          Girls: girls,
          GirlsPercent: ((girls * 100) / cgirls).toFixed(1) + '%',
          Boys: boys,
          BoysPercent: ((boys * 100) / cboys).toFixed(1) + '%',
          Total: total,
          TotalPercent: ((total * 100) / ctotal).toFixed(1) + '%',
          TotalGirls: cgirls,
          TotalBoys: cboys,
          TotalAllStudents: ctotal,
        }));
    
        // Prepare data for the grand total in the Absenteeism section
        absenteeismData.push({
          Type: 'Absenteeism',
          Grade: 'Total',
          Girls: grandTotalGirls,
          GirlsPercent: (grandTotalGirls * 100 / cgrandTotalGirls).toFixed(1) + '%',
          Boys: grandTotalBoys,
          BoysPercent: (grandTotalBoys * 100 / cgrandTotalBoys).toFixed(1) + '%',
          Total: grandTotal,
          TotalPercent: (grandTotal * 100 / cgrandTotal).toFixed(1) + '%',
          TotalGirls: cgrandTotalGirls,
          TotalBoys: cgrandTotalBoys,
          TotalAllStudents: cgrandTotal,
        });
    
        // Prepare data for Attendance section
        const attendanceData = general_report.map(({ grade_name, girls, cgirls, boys, cboys, total, ctotal }) => ({
          Type: 'Attendance',
          Grade: grade_name ==="Intwali"?"S6":grade_name==="Ishami"?"S5":grade_name==="Ijabo"?"S4":"EY",
          Girls: cgirls - girls,
          GirlsPercent: (((cgirls - girls) * 100) / cgirls).toFixed(1) + '%',
          Boys: cboys - boys,
          BoysPercent: (((cboys - boys) * 100) / cboys).toFixed(1) + '%',
          Total: ctotal - total,
          TotalPercent: (((ctotal - total) * 100) / ctotal).toFixed(1) + '%',
        }));
    
        // Prepare data for the grand total in the Attendance section
        attendanceData.push({
          Type: 'Attendance',
          Grade: 'Total',
          Girls: cgrandTotalGirls - grandTotalGirls,
          GirlsPercent: ((cgrandTotalGirls - grandTotalGirls) * 100 / cgrandTotalGirls).toFixed(1) + '%',
          Boys: cgrandTotalBoys - grandTotalBoys,
          BoysPercent: ((cgrandTotalBoys - grandTotalBoys) * 100 / cgrandTotalBoys).toFixed(1) + '%',
          Total: cgrandTotal - grandTotal,
          TotalPercent: ((cgrandTotal - grandTotal) * 100 / cgrandTotal).toFixed(1) + '%',
        });
    
        // Combine Absenteeism and Attendance data
        const combinedData = [...absenteeismData, ...attendanceData];
    
        // Create a new worksheet
        const ws = utils.json_to_sheet(combinedData);
    
        // Create a new workbook and append the worksheet
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, 'General Absenteeism Report');
    
        // Write the workbook to a file
        writeFile(wb, 'General_Absenteeism_Report.xlsx');
      };
  return (
    <div> 
        <center><h1>Absenteeism</h1></center>
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
        {general_data.length > 0 ? (
    <>
        <center>
            <h2>General Absenteeism Report</h2>
            <button 
              style={{ ...buttonStyles.common, ...buttonStyles.today }} 
              onClick={exportToExcel}>Download Excel
            </button>
            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Grade</th>
                        <th>Girls</th>
                        <th>%</th>
                        <th>Boys</th>
                        <th>%</th>
                        <th>Total</th>
                        <th>%</th>
                        <th>Total Girls</th>
                        <th>Total Boys</th>
                        <th>Total All Students</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Absenteeism Header Row */}
                    <tr>
                        <td rowSpan="6">Absenteeism</td>
                    </tr>
                    {general_report.map(({ grade_name, girls, cgirls, boys, cboys, total, ctotal }) => (
                        <tr key={grade_name}>
                            <td>{grade_name === "Intwali" ? "S6" : grade_name === "Ishami" ? "S5" : grade_name === "Ijabo" ? "S4" : "EY"}</td>
                            <td>{girls}</td>
                            <td>{cgirls ? ((girls * 100) / cgirls).toFixed(1) : "0"}%</td>
                            <td>{boys}</td>
                            <td>{cboys ? ((boys * 100) / cboys).toFixed(1) : "0"}%</td>
                            <td>{total}</td>
                            <td>{ctotal ? ((total * 100) / ctotal).toFixed(1) : "0"}%</td>
                            <td>{cgirls}</td>
                            <td>{cboys}</td>
                            <td>{ctotal}</td>
                        </tr>
                    ))}
                    {/* Grand Total Row for Absenteeism */}
                    <tr>
                        <td><strong>Total</strong></td>
                        <td><strong>{grandTotalGirls}</strong></td>
                        <td><strong>{cgrandTotalGirls ? ((grandTotalGirls * 100) / cgrandTotalGirls).toFixed(1) : "0"}%</strong></td>
                        <td><strong>{grandTotalBoys}</strong></td>
                        <td><strong>{cgrandTotalBoys ? ((grandTotalBoys * 100) / cgrandTotalBoys).toFixed(1) : "0"}%</strong></td>
                        <td><strong>{grandTotal}</strong></td>
                        <td><strong>{cgrandTotal ? ((grandTotal * 100) / cgrandTotal).toFixed(1) : "0"}%</strong></td>
                        <td><strong>{cgrandTotalGirls}</strong></td>
                        <td><strong>{cgrandTotalBoys}</strong></td>
                        <td><strong>{cgrandTotal}</strong></td>
                    </tr>
                    {/* Attendance Header Row */}
                    <tr>
                        <td rowSpan="6">Attendance</td>
                    </tr>
                    {general_report.map(({ grade_name, girls, cgirls, boys, cboys, total, ctotal }) => (
                        <tr key={`attendance-${grade_name}`}>
                            <td>{grade_name === "Intwali" ? "S6" : grade_name === "Ishami" ? "S5" : grade_name === "Ijabo" ? "S4" : "EY"}</td>
                            <td>{cgirls - girls}</td>
                            <td>{cgirls ? (((cgirls - girls) * 100) / cgirls).toFixed(1) : "0"}%</td>
                            <td>{cboys - boys}</td>
                            <td>{cboys ? (((cboys - boys) * 100) / cboys).toFixed(1) : "0"}%</td>
                            <td>{ctotal - total}</td>
                            <td>{ctotal ? (((ctotal - total) * 100) / ctotal).toFixed(1) : "0"}%</td>
                        </tr>
                    ))}
                    {/* Grand Total Row for Attendance */}
                    <tr>
                        <td><strong>Total</strong></td>
                        <td><strong>{cgrandTotalGirls - grandTotalGirls}</strong></td>
                        <td><strong>{cgrandTotalGirls ? (((cgrandTotalGirls - grandTotalGirls) * 100) / cgrandTotalGirls).toFixed(1) : "0"}%</strong></td>
                        <td><strong>{cgrandTotalBoys - grandTotalBoys}</strong></td>
                        <td><strong>{cgrandTotalBoys ? (((cgrandTotalBoys - grandTotalBoys) * 100) / cgrandTotalBoys).toFixed(1) : "0"}%</strong></td>
                        <td><strong>{cgrandTotal - grandTotal}</strong></td>
                        <td><strong>{cgrandTotal ? (((cgrandTotal - grandTotal) * 100) / cgrandTotal).toFixed(1) : "0"}%</strong></td>
                    </tr>
                </tbody>
            </table>
        </center>
        <DynamicTable 
            mockdata={general_data.map(({ count, grade_name, combination_name, end_academic_year, ...rest }) => ({
                ...rest,
                Class: grade_name === "Intwali" ? `S6_${(combination_name.match(/\(([^)]+)\)/) || [])[1]?.trim() || combination_name}` : 
                       grade_name === "Ishami" ? `S5_${(combination_name.match(/\(([^)]+)\)/) || [])[1]?.trim() || combination_name}` : 
                       grade_name === "Ijabo" ? `S4_${(combination_name.match(/\(([^)]+)\)/) || [])[1]?.trim() || combination_name}` : 
                       combination_name,
                count
            }))} 
        />
    </>
) : (
    <p>No data available</p>
)}

        
        {filtered_data.length > 0 ? (
            <>
                <h2>By Date</h2>
                <button
                        style={{ ...buttonStyles.common, ...buttonStyles.today }}
                        onClick={downloadData}
                    >
                        Download Data
                </button>
                
                <DynamicTable 
                  mockdata={filtered_data.map(({ id,hasAbsent,comment,period_1,period_2,period_3,period_4,period_5,period_6,period_7 ,grade_name, combination_name, end_academic_year, ...rest }) => ({
                    ...rest,
                    Class: grade_name === "Intwali" ? `S6_${(combination_name.match(/\(([^)]+)\)/) || [])[1]?.trim() || combination_name}`: 
                          grade_name === "Ishami" ? `S5_${(combination_name.match(/\(([^)]+)\)/) || [])[1]?.trim() || combination_name}` : 
                          grade_name === "Ijabo" ? `S4_${(combination_name.match(/\(([^)]+)\)/) || [])[1]?.trim() || combination_name}` : 
                          combination_name,
                    comment:auth.user.is_librarian || auth.user.is_superuser
                                    ? (
                                        <span onClick={() => addComment(id)}>
                                            {comment === "absent" ? "" :comment}
                                            <p>Add</p>
                                        </span>
                                    )
                                    : comment === "absent"
                                    ? ""
                                    : comment,
                    period_1,period_2,period_3,period_4,period_5,period_6,period_7 // Ensure this property is included
                  }))} 
                />
                <h2>Late Students</h2>
                {latefiltered_data.length>0?
                  (
                    <DynamicTable 
                      mockdata={latefiltered_data.map(({ end_academic_year, ...rest }) => rest)} 
                    />
                
                  ):(<p>Not late students</p>)
              
                }
                
          </>
        ) : (
          <p>Click on Desired Data.</p>
        )}
        
    </div>
  )
}
