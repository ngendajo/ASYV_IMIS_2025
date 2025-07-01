import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import axios from 'axios';
import baseUrl from '../../api/baseUrl';
import CollegesList from './college-list';
import EmploymentDistribution from './employment-distribution';
import DistributionList from './industry-distribution';
import "./alumni-trends.css";

import OutcomeSummaryGrid from './outcome-summary';
import AlumniLocationMap from './alumni-location';
import CollegesByCountry from './college-list';

// Helper functions (logic unchanged)
const aggregateDistributions = (dataArray, key) => {
  const agg = {};
  dataArray.forEach(item => {
    const dist = item[key];
    if (dist) {
      Object.entries(dist).forEach(([category, val]) => {
        if (!agg[category]) {
          agg[category] = { count: 0, percent: 0 };
        }
        agg[category].count += val.count || 0;
        agg[category].percent += val.percent || 0;
      });
    }
  });
  return agg;
};

const aggregateCollegesByCountry = (dataArray) => {
  const agg = {};

  dataArray.forEach(item => {
    const countries = item.most_attended_colleges;
    if (countries) {
      // countries is an object with country keys
      Object.entries(countries).forEach(([country, collegeList]) => {
        if (!agg[country]) {
          agg[country] = {};
        }
        collegeList.forEach(({ college, attendance_count }) => {
          if (!agg[country][college]) {
            agg[country][college] = 0;
          }
          agg[country][college] += attendance_count || 0;
        });
      });
    }
  });

  // Convert nested objects to arrays
  const formatted = {};
  Object.entries(agg).forEach(([country, collegesObj]) => {
    formatted[country] = Object.entries(collegesObj).map(([college, attendance_count]) => ({
      college,
      attendance_count,
    }));
  });

  return formatted;
};

const AlumniOutcomesDashboard = () => {
  const [allYears, setAllYears] = useState([]);
  const [data, setData] = useState([]);
  const [summaryData, setSummaryData] = useState({
    total_alumni: 0,
    employment_total: 0,
    employment_percent: 0,
    further_education_total: 0,
    further_education_percent: 0,
  });
  const [selectedYears, setSelectedYears] = useState([]);
  const [alumniLocations, setAlumniLocations] = useState([]);

  const [hasLoadedInitially, setHasLoadedInitially] = useState(false);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const res = await axios.get(`${baseUrl}/alumni-years/`);
        const years = res.data.years || [];
        setAllYears(years);
      } catch (err) {
        console.error('Error fetching all years:', err);
      }
    };
    fetchYears();
  }, []);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        let trendsUrl = `${baseUrl}/alumni-trends/`;
        if (hasLoadedInitially && selectedYears.length > 0) {
          const yearParams = selectedYears.map(y => `year=${y.value}`).join('&');
          trendsUrl += `?${yearParams}`;
        }
  
        const [trendsRes, locationsRes] = await Promise.all([
          axios.get(trendsUrl),
          axios.get(baseUrl + '/alumni-map/')
        ]);
  
        setData(trendsRes.data.yearly_outcomes);
        setSummaryData(trendsRes.data.overall_summary);
        setAlumniLocations(locationsRes.data);
        setHasLoadedInitially(true);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
  
    fetchData();
  }, [selectedYears, hasLoadedInitially]);
  
  const yearOptions = allYears.map(year => ({
    value: year,
    label: year.toString(),
  }));

  const filteredData = selectedYears.length
    ? data.filter(d => selectedYears.some(y => y.value === d.graduation_year))
    : data;

  const collegeData = aggregateCollegesByCountry(filteredData);
  console.log(collegeData);
  const employmentStatusData = aggregateDistributions(filteredData, 'employment_status_distribution');
  const industryData = aggregateDistributions(filteredData, 'industry_distribution');

  const selectedYearsSorted = filteredData
    .map(d => d.graduation_year)
    .sort((a, b) => a - b);

  const metrics = [
    {
      keyCount: "total_alumni", labelCount: "Total Alumni",
      keyPercent: null, labelPercent: null,
    },
    {
      keyCount: "employment_only", labelCount: "Employment Only (Count)",
      keyPercent: "employment_only_percent", labelPercent: "Employment Only (%)",
    },
    {
      keyCount: "further_edu_only", labelCount: "Further Edu Only (Count)",
      keyPercent: "further_edu_only_percent", labelPercent: "Further Edu Only (%)",
    },
    {
      keyCount: "both", labelCount: "Both (Count)",
      keyPercent: "both_percent", labelPercent: "Both (%)",
    },
    {
      keyCount: "neither", labelCount: "Neither (Count)",
      keyPercent: "neither_percent", labelPercent: "Neither (%)",
    },
  ];

  return (
    <div className="trends-wrapper">
      {/* Year Selector */}
      <div className="select-container">
        <label htmlFor="year-select" className="select-label">
          Select Graduation Year(s)
        </label>
        <Select
          inputId="year-select"
          isMulti
          options={yearOptions}
          value={selectedYears}
          onChange={setSelectedYears}
          placeholder="Select one or more years..."
          classNamePrefix="react-select"
          noOptionsMessage={() => "No years available"}
        />
      </div>

      <OutcomeSummaryGrid summary={summaryData} />

      {/* Line Chart */}
      <section aria-label="Alumni outcomes trends">
        <div className="chart-wrapper" role="img" aria-label="Line chart showing employment and education percentages by year">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={filteredData} margin={{ top: 20, right: 40, bottom: 20, left: 0 }}>
              <XAxis dataKey="graduation_year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend verticalAlign="top" height={36} />
              <Line type="monotone" dataKey="employment_only_percent" stroke="#4f81bd" name="Employment Only (%)" strokeWidth={3} />
              <Line type="monotone" dataKey="further_edu_only_percent" stroke="#9bbb59" name="Further Edu Only (%)" strokeWidth={3} />
              <Line type="monotone" dataKey="both_percent" stroke="#ffbb55" name="Both (%)" strokeWidth={3} />
              <Line type="monotone" dataKey="neither_percent" stroke="#e84c3d" name="Neither (%)" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Data Table */}
      <section className="table-section" aria-label="Alumni outcomes data table">
        <div className="scrollable-table-container" tabIndex={0}>
          <table className="trend-table" role="grid" aria-describedby="table-description">
            <caption id="table-description" className="sr-only">
              Alumni outcomes counts and percentages by graduation year
            </caption>
            <thead>
              <tr>
                <th scope="col" className="sticky-col sticky-left">Metric</th>
                {selectedYearsSorted.map(year => (
                  <th key={year} scope="col" className="sticky-col">{year}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.map(metric => (
                <tr key={metric.keyCount} className="hover-row">
                  <th scope="row" className="sticky-col sticky-left metric-label">
                    {metric.labelCount}
                    {metric.labelPercent && <><br />{metric.labelPercent}</>}
                  </th>
                  {selectedYearsSorted.map(year => {
                    const yearData = filteredData.find(d => d.graduation_year === year);
                    return (
                      <td key={year} className="numeric-cell">
                        {yearData ? (
                          <>
                            {metric.keyCount && yearData[metric.keyCount] !== undefined
                              ? yearData[metric.keyCount]
                              : "-"}
                            {metric.keyPercent && yearData[metric.keyPercent] !== undefined && (
                              <div className="percent-text">({yearData[metric.keyPercent]}%)</div>
                            )}
                          </>
                        ) : "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Lists Section */}
      <section className="lists-section">
        <div className="list-card">
          <h2 className="list-title">Colleges Attended by Country</h2>
          <CollegesByCountry collegesByCountry={collegeData} />
        </div>

        <div className="list-card">
          <h2 className="list-title">Employment Status Distribution</h2>
          <EmploymentDistribution distribution={employmentStatusData} />
        </div>

        <div className="list-card">
          <h2 className="list-title">Industry Distribution</h2>
          <DistributionList
            title=""
            distribution={industryData}
            showZero={false}
          />
        </div>
      </section>
    </div>
  );
};

export default AlumniOutcomesDashboard;
