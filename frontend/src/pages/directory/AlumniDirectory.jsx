
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
import qs from 'qs';

import OutcomePieChart from '../../components/directory/outcome-pie-chart.jsx';

const AlumniDirectory = () => {
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [alumniData, setAlumniData] = useState([]);
  const [outcomeSummary, setOutcomeSummary] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    gender: [],
    graduation_year: [],
    family: [],
    combination: [],
    industry: [],
    college: [],
  });

  // UI filter selections
const [filterUI, setFilterUI] = useState({
  gender: [],
  graduation_year: [],
  family: [],
  combination: [],
  industry: [],
  college: [],
});

// Filters used in the actual request
const [appliedFilters, setAppliedFilters] = useState({
  gender: [],
  graduation_year: [],
  family: [],
  combination: [],
  industry: [],
  college: [],
});


  // const [genderFilter, setGenderFilter] = useState([]);
  // const [gradeFilter, setGradeFilter] = useState([]);
  // const [familyFilter, setFamilyFilter] = useState([]);
  // const [combinationFilter, setCombinationFilter] = useState([]);
  // const [industryFilter, setIndustryFilter] = useState([]);
  // const [collegeFilter, setCollegeFilter] = useState([]);

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

  // const genderOptions = [{ label: 'All', value: '' }, ...filters.gender.map((item) => ({
  //   label: item === 'M' ? 'Male' : item === 'F' ? 'Female' : item,
  //   value: item,
  // }))];

  // const gradeOptions = filters.graduation_year.map((item) => {
  //   const year = item.family__grade__graduation_year_to_asyv;
  //   const name = item.family__grade__grade_name;
  //   const label = `${name} (${year})`;
  //   const value = year;
  //   return (
  //     <option key={value} value={value}>
  //       {label}
  //     </option>
  //   );
  // });

  // const familyOptions = filters.family.map((item) => ({
  //   label: item.family__family_name,
  //   value: item.family__id,
  // }));

  // const combinationOptions = filters.combination.map((item) => ({
  //   label: item.combination__combination_name,
  //   value: item.combination_id,
  // }));

  // const industryOptions = filters.industry;

  //   const collegeOptions = (filters.college || []).map((item) => ({
  //   label: item.college__college_name,
  //   value: item.college__id,
  //   }));



  const handleClear = () => setSelectedAlumni(null);
  useEffect(() => {
    console.log("Fetching alumni with searchTerm:", searchTerm);
    const fetchAlumni = async () => {
      setLoading(true);
      const params = {
        page: pagination.current_page,
        page_size: pagination.page_size,
      };
      if (appliedFilters.gender.length > 0) params.gender = appliedFilters.gender;
      if (appliedFilters.graduation_year.length > 0) params.year = appliedFilters.graduation_year;
      if (appliedFilters.family.length > 0) params.family = appliedFilters.family;
      if (appliedFilters.combination.length > 0) params.combination = appliedFilters.combination;
      if (appliedFilters.industry.length > 0) params.industry = appliedFilters.industry;
      if (appliedFilters.college.length > 0) params.college = appliedFilters.college;

      if (searchTerm) params.search = searchTerm;

      try {
        console.log("Request params:", params);
        const response = await axios.get(baseUrl + '/alumni-directory/', {
          params,
          paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' }),
          headers: {
            Authorization: 'Bearer ' + auth.accessToken,
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        });
        console.log(response.data);  
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
  }, [auth, pagination.current_page, pagination.page_size, searchTerm, appliedFilters]);

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
  

// const handleDownload = async () => {
//     try {
//       const params = {
//         page_size: 10000,
//       };
//       if (genderFilter) params.gender = genderFilter;
//       if (gradeFilter) params.year = gradeFilter;
//       if (familyFilter) params.family = familyFilter;
//       if (combinationFilter) params.combination = combinationFilter;
//       if (industryFilter) params.industry = industryFilter;
//       if (collegeFilter) params.college = collegeFilter;

//       const response = await axios.get(baseUrl + '/alumni-directory/', {
//         params,
//         headers: {
//           Authorization: 'Bearer ' + auth.accessToken,
//           'Content-Type': 'multipart/form-data',
//         },
//         withCredentials: true,
//       });

//       const allAlumni = response.data.data.map((element) => ({
//         id: element.id,
//         email: element.email,
//         firstName: element.first_name,
//         lastName: element.rwandan_name,
//         phone: element.phone,
//         grade: element.family.grade_info.grade_name || 'none',
//         family: element.family.family_name || 'none',
//         combination: element.combination.combination_name || '',
//         industry: element.employment.industry || '',
//       }));

//       const worksheet = XLSX.utils.json_to_sheet(allAlumni);
//       const workbook = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(workbook, worksheet, 'Alumni');
//       const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
//       const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
//       saveAs(data, 'alumni_list.xlsx');
//     } catch (err) {
//       console.error('Download error:', err);
//     }
//   };
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const applyFilters = () => {
    setAppliedFilters(filterUI);
    setPagination((prev) => ({ ...prev, current_page: 1 }));
    setAlumniData([]); // Clear current data to load fresh results
  };

  const toggleCheckbox = (filterKey, value) => {
    setFilterUI((prev) => {
      const current = prev[filterKey];
      return {
        ...prev,
        [filterKey]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  };

  return (
    <div className="DirectoryWrapper">
      <div className="DirectorySearchWrapper">
        <SearchBar value={searchTerm} onChange={handleSearchChange} placeholder="Search alumni..." per="100" />
      </div>

      <button onClick={() => setShowFilters(!showFilters)} className="filter-toggle">
        {showFilters ? 'Hide Filters' : 'Show Filters'}
      </button>

      {showFilters && (
      <div className="filter-container">
        <div className="filter-panel">
           <div className="filters-scroll-area"></div>
              {/* Gender */}
              <div className="filter-group">
                <p><strong>Gender</strong></p>
                <div className="filter-items-scroll">
                  {filters.gender.map((g) => (
                    <label key={g}>
                      <input
                        type="checkbox"
                        value={g}
                        checked={filterUI.gender.includes(g)}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFilterUI((prev) => ({
                            ...prev,
                            gender: prev.gender.includes(val)
                              ? prev.gender.filter((v) => v !== val)
                              : [...prev.gender, val],
                          }));
                        }}
                      />
                      {g === 'M' ? 'Male' : g === 'F' ? 'Female' : g}
                    </label>
                    ))}
                  </div>
              </div>

              {/* Grade */}
              <div className="filter-group">
                <p><strong>Graduation Year</strong></p>
                <div className="filter-items-scroll">
                  {filters.graduation_year.map((item) => {
                    const value = item.graduation_year_to_asyv;
                    const label = `${item.grade_name} (${value})`;
                    return (
                      <label key={value}>
                        <input
                          type="checkbox"
                          value={value}
                          checked={filterUI.graduation_year.includes(String(value))}
                          onChange={() => toggleCheckbox('graduation_year', String(value))}
                        />
                        {label}
                      </label>
                    );
                  })}
                </div>
              </div>
              {/* Family */}
              <div className="filter-group">
                <p><strong>Family</strong></p>
                <div className="filter-items-scroll">
                  {filters.family.map((f) => (
                    <label key={f.id}>
                      <input
                        type="checkbox"
                        value={f.id}
                        checked={filterUI.family.includes(f.id)}
                        onChange={() => toggleCheckbox('family', f.id)}
                      />
                      {f.family_name}
                    </label>
                    ))}
                </div>
              </div>
              {/* Combination */}
              <div className="filter-group">
                <p><strong>Combination</strong></p>
                <div className="filter-items-scroll">
                  {filters.combination.map((combo) => (
                    <label key={combo.combination_id}>
                      <input
                        type="checkbox"
                        value={combo.combination_id}
                        checked={filterUI.combination.includes(combo.combination_id)}
                        onChange={() => toggleCheckbox('combination', combo.combination_id)}
                      />
                      {combo.combination__combination_name}
                    </label>
                   ))}
                </div>
              </div>
              {/* Industry */}
              <div className="filter-group">
                <p><strong>Industry</strong></p>
                <div className="filter-items-scroll">
                  {filters.industry.map((industry) => (
                    <label key={industry}>
                      <input
                        type="checkbox"
                        value={industry}
                        checked={filterUI.industry.includes(industry)}
                        onChange={() => toggleCheckbox('industry', industry)}
                      />
                      {industry}
                    </label>
                  ))}
                </div>
              </div>
              {/* College */}
              <div className="filter-group">
                <p><strong>College</strong></p>
                <div className="filter-items-scroll">
                  {filters.college.map((item, index) => {
                    const name = item.college__college_name;
                    return (
                      <label key={index}>
                        <input
                          type="checkbox"
                          value={name}
                          checked={filterUI.college.includes(name)}
                          onChange={() => toggleCheckbox('college', name)}
                        />
                        {name}
                        </label>
                      )})};
                  </div>
              </div>
              <div className="apply-button-wrapper">
                <button className="apply-button" onClick={applyFilters}>Apply Filters</button>
              </div>
          </div>
        </div>
          
      )}
      

      {/* <div className="directory-title">
        Search Results:
        <button onClick={handleDownload}>Download Excel</button>
      </div> */}

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
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniDirectory;

