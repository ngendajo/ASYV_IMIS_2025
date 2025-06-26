
import React, { useState, useEffect, useRef, useCallback } from 'react';
import AlumniList from '../../components/directory/alumni-list';
import AlumniDetail from '../../components/directory/alumni-detail.jsx';
import SearchBar from '../../components/dashboard/search-bar';
import './AlumniDirectory.css';

import axios from 'axios';
import baseUrl from '../../api/baseUrl';
import baseUrlforImg from '../../api/baseUrlforImg';
import useAuth from '../../hooks/useAuth';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

import OutcomePieChart from '../../components/directory/outcome-pie-chart.jsx';

const AlumniDirectory = () => {
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [alumniData, setAlumniData] = useState([]);
  const [outcomeSummary, setOutcomeSummary] = useState({});

  const [filters, setFilters] = useState({
    gender: [],
    graduation_year: [],
    family: [],
    combination: [],
    industry: [],
    college:[],
  });

  const [genderFilter, setGenderFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [familyFilter, setFamilyFilter] = useState('');
  const [combinationFilter, setCombinationFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('');

  const [pagination, setPagination] = useState({
    current_page: 1,
    page_size: 10,
    total: 0,
    has_next: false,
    has_previous: false,
  });

  const { auth } = useAuth();
  const [loading, setLoading] = useState(false);
  const observer = useRef();
  const loader = useRef(null);

  const genderOptions = [{ label: 'All', value: '' }, ...filters.gender.map((item) => ({
    label: item === 'M' ? 'Male' : item === 'F' ? 'Female' : item,
    value: item,
  }))];

  const gradeOptions = filters.graduation_year.map((item) => {
    const year = item.family__grade__graduation_year_to_asyv;
    const name = item.family__grade__grade_name;
    const label = `${name} (${year})`;
    const value = year;
    return (
      <option key={value} value={value}>
        {label}
      </option>
    );
  });

  const familyOptions = filters.family.map((item) => ({
    label: item.family__family_name,
    value: item.family__id,
  }));

  const combinationOptions = filters.combination.map((item) => ({
    label: item.combination__combination_name,
    value: item.combination_id,
  }));

  const industryOptions = filters.industry;

    const collegeOptions = (filters.college || []).map((item) => ({
    label: item.college__college_name,
    value: item.college__id,
    }));



  const handleClear = () => setSelectedAlumni(null);
  useEffect(() => {
    console.log("Fetching alumni with searchTerm:", searchTerm);
    const fetchAlumni = async () => {
      setLoading(true);
      const params = {
        page: pagination.current_page,
        page_size: pagination.page_size,
      };
      if (genderFilter) params.gender = genderFilter;
      if (gradeFilter) params.year = gradeFilter;
      if (familyFilter) params.family = familyFilter;
      if (combinationFilter) params.combination = combinationFilter;
      if (industryFilter) params.industry = industryFilter;
      if (searchTerm) params.search = searchTerm;
      if (collegeFilter) params.college = collegeFilter;

      try {
        console.log("Request params:", params);
        const response = await axios.get(baseUrl + '/alumni-directory/', {
          params,
          headers: {
            Authorization: 'Bearer ' + auth.accessToken,
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        });

        console.log(response.data.data)

        const alumnilist = response.data.data.map((element) => ({
          id: element.id,
          user_id: element.user_id,
          profilePic: baseUrlforImg + element.image_url,
          email: element.email,
          firstName: element.first_name,
          lastName: element.rwandan_name,
          phone: element.phone,
          gradeName: element.family.grade_info.grade_name,
          familyName: element.family.family_name,
          combinationName: element.combination.combination_name,
          grade: element.family.grade_info.grade_name || 'none',
          family: element.family.family_name || 'none',
          combination: element.combination.combination_name || '',
          employment: element.employment?.[0]?.title || '',
          industry: element.employment?.[0]?.industry || '',
          further_education: element.further_education?.[0]?.college.college_name || '',
        }));
        console.log("sample alumni data", alumnilist);
        setAlumniData((prevData) =>
            pagination.current_page === 1 ? alumnilist : [...prevData, ...alumnilist]
          );
        setFilters(response.data.filters);
        setOutcomeSummary(response.data.outcome_summary);
        setPagination((prev) => ({
          ...prev,
          total: response.data.pagination.total,
          has_next: response.data.pagination.has_next,
          has_previous: response.data.pagination.has_previous,
        }));
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    fetchAlumni();
  }, [auth, pagination.current_page, pagination.page_size, genderFilter, gradeFilter, familyFilter, 
    combinationFilter, industryFilter, searchTerm, collegeFilter]);
  
useEffect(() => {
    setAlumniData([]);
    setPagination((prev) => ({ ...prev, current_page: 1 }));
}, [genderFilter, gradeFilter, familyFilter, combinationFilter, industryFilter, searchTerm, collegeFilter]);

useEffect(() => {
    const isDesktop = window.innerWidth >= 768; // adjust breakpoint if needed
  
    const scrollContainer = isDesktop 
      ? document.querySelector('.desktop-table-wrapper') 
      : window;
  
    if (!scrollContainer) return;
  
    const onScroll = () => {
      let scrollTop, clientHeight, scrollHeight;
  
      if (scrollContainer === window) {
        scrollTop = window.scrollY || document.documentElement.scrollTop;
        clientHeight = window.innerHeight;
        scrollHeight = document.documentElement.scrollHeight;
      } else {
        scrollTop = scrollContainer.scrollTop;
        clientHeight = scrollContainer.clientHeight;
        scrollHeight = scrollContainer.scrollHeight;
      }
  
      if (scrollTop + clientHeight >= scrollHeight - 20) {
        if (pagination.has_next && !loading) {
          setPagination((prev) => ({ ...prev, current_page: prev.current_page + 1 }));
        }
      }
    };
  
    scrollContainer.addEventListener('scroll', onScroll);
  
    return () => {
      scrollContainer.removeEventListener('scroll', onScroll);
    };
  }, [pagination.has_next, loading]);
  

const handleDownload = async () => {
    try {
      const params = {
        page_size: 10000,
      };
      if (genderFilter) params.gender = genderFilter;
      if (gradeFilter) params.year = gradeFilter;
      if (familyFilter) params.family = familyFilter;
      if (combinationFilter) params.combination = combinationFilter;
      if (industryFilter) params.industry = industryFilter;
      if (collegeFilter) params.college = collegeFilter;

      const response = await axios.get(baseUrl + '/alumni-directory/', {
        params,
        headers: {
          Authorization: 'Bearer ' + auth.accessToken,
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      const allAlumni = response.data.data.map((element) => ({
        id: element.id,
        email: element.email,
        firstName: element.first_name,
        lastName: element.rwandan_name,
        phone: element.phone,
        grade: element.family.grade_info.grade_name || 'none',
        family: element.family.family_name || 'none',
        combination: element.combination.combination_name || '',
        industry: element.employment.industry || '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(allAlumni);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Alumni');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(data, 'alumni_list.xlsx');
    } catch (err) {
      console.error('Download error:', err);
    }
  };
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  return (
    <div className="DirectoryWrapper">
        {auth.user?.is_superuser && (
            <div className = "ChartWrapper">
            <OutcomePieChart summary={outcomeSummary} />
        </div>
        )}
      <div className="DirectorySearchWrapper">
        <SearchBar value={searchTerm} onChange={handleSearchChange} placeholder="Search alumni..." per="100" />
      </div>

      <div className="filter-bar">
        {/* Gender */}
        <div className={`filter-button ${genderFilter ? 'filter-applied' : ''}`}>
          {genderFilter && <button onClick={() => setGenderFilter('')}>&#x2715;</button>}
          <select onChange={(e) => setGenderFilter(e.target.value)}>
            {genderOptions.map((option) => (
              <option key={option.value || 'All'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {/* Grade */}
        <div className={`filter-button ${gradeFilter ? 'filter-applied' : ''}`}>
          {gradeFilter && <button onClick={() => setGradeFilter('')}>&#x2715;</button>}
          <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)}>
            <option value="" disabled>Grade</option>
            {gradeOptions}
          </select>
        </div>
        {/* Family */}
        <div className={`filter-button ${familyFilter ? 'filter-applied' : ''}`}>
          {familyFilter && <button onClick={() => setFamilyFilter('')}>&#x2715;</button>}
          <select value={familyFilter} onChange={(e) => setFamilyFilter(e.target.value)}>
            <option value="" disabled>Family</option>
            {familyOptions.sort((a, b) => a.label.localeCompare(b.label)).map((family) => (
              <option key={family.value} value={family.value}>{family.label}</option>
            ))}
          </select>
        </div>
        {/* Combination */}
        <div className={`filter-button ${combinationFilter ? 'filter-applied' : ''}`}>
          {combinationFilter && <button onClick={() => setCombinationFilter('')}>&#x2715;</button>}
          <select value={combinationFilter} onChange={(e) => setCombinationFilter(e.target.value)}>
            <option value="" disabled>Combination</option>
            {combinationOptions.sort((a, b) => a.label.localeCompare(b.label)).map((combo) => (
              <option key={combo.value} value={combo.value}>{combo.label}</option>
            ))}
          </select>
        </div>
        {/* Industry */}
        <div className={`filter-button ${industryFilter ? 'filter-applied' : ''}`}>
          {industryFilter && <button onClick={() => setIndustryFilter('')}>&#x2715;</button>}
          <select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)}>
            <option value="" disabled>Industry</option>
            {industryOptions.sort().map((industry) => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
        </div>
        {/* College */}
        <div className={`filter-button ${collegeFilter ? 'filter-applied' : ''}`}>
        {collegeFilter && <button onClick={() => setCollegeFilter('')}>&#x2715;</button>}
        <select value={collegeFilter} onChange={(e) => setCollegeFilter(e.target.value)}>
            <option value="" disabled>College</option>
            {(collegeOptions || [])
            .sort((a, b) => a.label.localeCompare(b.label))
            .map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
            ))}
        </select>
        </div>
      </div>

      <div className="directory-title">
        Search Results:
        <button onClick={handleDownload}>Download Excel</button>
      </div>

      <div className="directory-content">
        <AlumniList alumni={alumniData} onSelect={setSelectedAlumni} />
        <div ref={loader}></div>
      </div>

      {/* MODAL STYLE like responsive-fixed */}
      {selectedAlumni && (
        <div className="modal-overlay" onClick={handleClear}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleClear}>×</button>
            <AlumniDetail
              selectedAlumni={selectedAlumni}
              handleClear={handleClear}
              gradeFilter={gradeFilter}
              familyFilter={familyFilter}
              combinationFilter={combinationFilter}
              industryFilter={industryFilter}
              outcomeSummary={outcomeSummary}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniDirectory;

