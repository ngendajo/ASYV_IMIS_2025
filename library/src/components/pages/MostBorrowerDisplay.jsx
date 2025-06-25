import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import useAuth from "../../hooks/useAuth";
import baseUrl from "../../api/baseUrl";
import moment from 'moment';
//import DynamicTable from './dinamicTable/DynamicTable';
import ResponsiveTable from './ResponsiveTable';

// Register the plugin
Chart.register(ChartDataLabels);

const MostBorrowerDisplay = ({ start_date, end_date }) => {
  const [data, setData] = useState([]);
  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState([]);
  const [gradeData, setGradeData] = useState([]);
  const [gradeFamilyData, setGradeFamilyData] = useState([]);
  const [gradeCombinationData, setGradeCombinationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  let {auth} = useAuth();
  
  const formatDate = (date) => {
	const newDate = new Date(date);
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const day = String(newDate.getDate()).padStart(2, '0');
    const hours = String(newDate.getHours()).padStart(2, '0');
    const minutes = String(newDate.getMinutes()).padStart(2, '0');
    const seconds = String(newDate.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let url = baseUrl+'/mostborrower/';
        let url1 = baseUrl+'/gborrower/';

        // Check if start_date and end_date props are provided
        if (start_date && end_date) {
            if(end_date<start_date){
                setError("End date is less data start date")
            }else{
                setError("")
                url += `?start_date=${formatDate(start_date)}&end_date=${formatDate(end_date)}`;
                url1 += `?start_date=${formatDate(start_date)}&end_date=${formatDate(end_date)}`;
            }
          
        }
        const response = await axios.get(url,{
            headers: {
                "Authorization": 'Bearer ' + String(auth.accessToken),
                "Content-Type": 'multipart/form-data'
            },
            withCredentials:true 
        });
        const response1 = await axios.get(url1,{
            headers: {
                "Authorization": 'Bearer ' + String(auth.accessToken),
                "Content-Type": 'multipart/form-data'
            },
            withCredentials:true 
        });
        //console.log(response1.data)
        setData2(response1.data);
        setData(response.data);
        var borrowerlist=[]
                var i=1
                response.data.forEach(e=>{
                    borrowerlist.push({
                    No:i,
                    "Last Name":e.last_name,
                    "First Name":e.first_name,
                    "Grade Name":e.grade_name,
                    "Family Name":e.family_name,
                    "issue_count":e.issue_count
                })
                i=i+1
                })
                setData1(borrowerlist);
      } catch (error) {
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [auth,start_date, end_date]);
  const processGradeData = useCallback(() => {
    const gradeMap = {};

    data2.forEach(item => {
      const { grade_name, borrowers, students } = item;
      if (!gradeMap[grade_name]) {
        gradeMap[grade_name] = { students: 0, borrowers: 0 };
      }
      gradeMap[grade_name].students += students;
      gradeMap[grade_name].borrowers += borrowers;
    });

    const gradeDataArray = Object.keys(gradeMap).map(grade => ({
      grade_name: grade,
      students: gradeMap[grade].students,
      borrowers: gradeMap[grade].borrowers,
      percentageBorrowers: Math.round((gradeMap[grade].borrowers / gradeMap[grade].students) * 100)
    }));

    setGradeData(gradeDataArray);
  }, [data2]);

  const processGradeFamilyData = useCallback(() => {
    const gradeFamilyMap = {};

    data2.forEach(item => {
      const { grade_name, family_name, borrowers, students } = item;
      if (!gradeFamilyMap[grade_name]) {
        gradeFamilyMap[grade_name] = {};
      }
      if (!gradeFamilyMap[grade_name][family_name]) {
        gradeFamilyMap[grade_name][family_name] = { students: 0, borrowers: 0 };
      }
      gradeFamilyMap[grade_name][family_name].students += students;
      gradeFamilyMap[grade_name][family_name].borrowers += borrowers;
    });

    const gradeFamilyDataArray = Object.keys(gradeFamilyMap).map(grade => ({
      grade_name: grade,
      families: Object.keys(gradeFamilyMap[grade]).map(family => ({
        family_name: family,
        students: gradeFamilyMap[grade][family].students,
        borrowers: gradeFamilyMap[grade][family].borrowers,
        percentageBorrowers: Math.round((gradeFamilyMap[grade][family].borrowers / gradeFamilyMap[grade][family].students) * 100)
      }))
    }));

    setGradeFamilyData(gradeFamilyDataArray);
  }, [data2]);

  const processGradeCombinationData = useCallback(() => {
    const gradeCombinationMap = {};

    data2.forEach(item => {
      const { grade_name, combination_name, borrowers, students } = item;
      if (!gradeCombinationMap[grade_name]) {
        gradeCombinationMap[grade_name] = {};
      }
      if (!gradeCombinationMap[grade_name][combination_name]) {
        gradeCombinationMap[grade_name][combination_name] = { students: 0, borrowers: 0 };
      }
      gradeCombinationMap[grade_name][combination_name].students += students;
      gradeCombinationMap[grade_name][combination_name].borrowers += borrowers;
    });

    const gradeCombinationDataArray = Object.keys(gradeCombinationMap).map(grade => ({
      grade_name: grade,
      combinations: Object.keys(gradeCombinationMap[grade]).map(combination => ({
        combination_name: combination,
        students: gradeCombinationMap[grade][combination].students,
        borrowers: gradeCombinationMap[grade][combination].borrowers,
        percentageBorrowers: Math.round((gradeCombinationMap[grade][combination].borrowers / gradeCombinationMap[grade][combination].students) * 100)
      }))
    }));

    setGradeCombinationData(gradeCombinationDataArray);
  }, [data2]);

  useEffect(() => {
    if (data2.length > 0) {
      processGradeData();
      processGradeFamilyData();
      processGradeCombinationData();
    }
  }, [data2, processGradeData, processGradeFamilyData, processGradeCombinationData]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
        {start_date && end_date?
            <h2>From {moment(start_date).format("Do MMMM YYYY, h:mm:ss a").toLocaleString()} to {moment(end_date).format("Do MMMM YYYY, h:mm:ss a").toLocaleString()},</h2>:
            <h2>This Month,</h2>
        }
        <ol>
        <h1>Most Borrower Student(s)</h1>
          {data.length===0?
          <h2>No data</h2>:
          <ResponsiveTable data={data1} />
            }
        </ol>
        <h1>Issuing Books Analysis</h1>
        <div className='issuinganalysis-box'>
            <h2>Grade Level</h2>
            <BarChart 
                data={gradeData} 
                title="Grade Data" 
                xKey="grade_name" 
                yKeys={['students', 'borrowers', 'percentageBorrowers']} 
            />
        </div>
        <div className="issuinganalysis">
            
            <div className='issuinganalysis-box'>
                <h2>Family in Grade Level</h2>
                {gradeFamilyData.map(grade => (
                    <div key={grade.grade_name}>
                    <h3>{grade.grade_name}</h3>
                    <BarChart 
                        data={grade.families} 
                        title={`Family Data for ${grade.grade_name}`} 
                        xKey="family_name" 
                        yKeys={['students', 'borrowers', 'percentageBorrowers']} 
                    />
                    </div>
                ))}
            </div>
            <div className='issuinganalysis-box'>
                <h2>Combination in Grade Level</h2>
                {gradeCombinationData.map(grade => (
                    <div key={grade.grade_name}>
                    <h3>{grade.grade_name}</h3>
                    <BarChart 
                        data={grade.combinations} 
                        title={`Combination Data for ${grade.grade_name}`} 
                        xKey="combination_name" 
                        yKeys={['students', 'borrowers', 'percentageBorrowers']} 
                    />
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};
const BarChart = ({ data, title, xKey, yKeys }) => {
    const hexColors = [
        '#498160', '#6d5736', '#f49c46'
        // Add more colors if needed
      ];
      const hexColors2 = [
        '#957967','#d8b040'
        // Add more colors if needed
      ];
    const chartData = {
      labels: data.map(item => item[xKey]),
      datasets: yKeys.map((key, index) => ({
        label: key,
        data: data.map(item => item[key]),
        backgroundColor: hexColors[index % hexColors.length], // Adding transparency with '99' for 60%
      borderColor: hexColors[index % hexColors2.length],
        borderWidth: 1,
      }))
    };
  
    const options = {
      plugins: {
        datalabels: {
          anchor: 'end',
          align: 'top',
          color: '#000',
          font: {
            weight: 'bold'
          },
          formatter: (value, context) => {
            if (context.dataset.label === 'percentageBorrowers') {
              return value + '%'; // Append '%' to the value
            }
            else {
              return value ; // Append 'borrowers' to the value
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };
  
    return (
      <div>
        <h4>{title}</h4>
        <Bar data={chartData} options={options} />
      </div>
    );
  }
export default MostBorrowerDisplay;
