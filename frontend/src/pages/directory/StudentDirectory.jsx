
import React, { useState, useEffect, useRef, useCallback } from 'react';
import AlumniList from '../../components/directory/alumni-list';
import AlumniDetail from '../../components/directory/alumni-detail.jsx';
import SearchBar from '../../components/dashboard/search-bar';
import FilterPanel from '../../components/directory/filter-panel';
import './AlumniDirectory.css';

import axios from 'axios';
import baseUrl from '../../api/baseUrl';
import baseUrlforImg from '../../api/baseUrlforImg';
import useAuth from '../../hooks/useAuth';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import qs from 'qs';

const StudentDirectory = () => {
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [alumniData, setAlumniData] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    gender: [],
    graduation_year: [],
    family: [],
    combination: []
  });

  // UI filter selections
const [filterUI, setFilterUI] = useState({
  gender: [],
  graduation_year: [],
  family: [],
  combination: []
});

// Filters used in the actual request
const [appliedFilters, setAppliedFilters] = useState({
  gender: [],
  graduation_year: [],
  family: [],
  combination: []
});

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


  const handleClear = () => setSelectedAlumni(null);
  useEffect(() => {
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

      if (searchTerm) params.search = searchTerm;

      try {
        console.log("Request params:", params);
        const response = await axios.get(baseUrl + '/student-directory/', {
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
          combinationName: element.combination?.combination_name,
          grade: element.family.grade_info.grade_name || 'none',
          family: element.family.family_name || 'none',
          combination: element.combination?.combination_name || '',
          employment: element.employment?.[0]?.title || '',
          industry: element.employment?.[0]?.industry || '',
          further_education: element.further_education?.[0]?.college.college_name || '',
        }));
        console.log("sample alumni data", alumnilist);
        setAlumniData((prevData) =>
            pagination.current_page === 1 ? alumnilist : [...prevData, ...alumnilist]
          );
        setFilters(response.data.filters);
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
    const isDesktop = window.innerWidth >= 768;
    const scrollContainer = isDesktop 
      ? document.querySelector('.desktop-table-wrapper') 
      : window;
  
    if (!scrollContainer) return;
  
    let throttleTimeout = null;
  
    const onScroll = () => {
      if (throttleTimeout) return;
  
      throttleTimeout = setTimeout(() => {
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
            setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }));
          }
        }
  
        throttleTimeout = null;
      }, 250); // 250ms throttle
    };
  
    scrollContainer.addEventListener('scroll', onScroll);
    return () => scrollContainer.removeEventListener('scroll', onScroll);
  }, [pagination.has_next, loading]);
  
  

const handleDownload = async () => {
      const params = {
        page_size: 10000,
      };
      if (appliedFilters.gender.length > 0) params.gender = appliedFilters.gender;
      if (appliedFilters.graduation_year.length > 0) params.year = appliedFilters.graduation_year;
      if (appliedFilters.family.length > 0) params.family = appliedFilters.family;
      if (appliedFilters.combination.length > 0) params.combination = appliedFilters.combination;

      try {
        const response = await axios.get(baseUrl + '/student-directory/', {
          params,
          paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' }),
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
        combination: element.combination?.combination_name || '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(allAlumni);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Student');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      const getFilterFilenamePart = (filters) => {
              return Object.entries(filters)
                .filter(([_, value]) => value.length > 0)
                .map(([key, value]) => `${key}-${value.join('-')}`)
                .join('_');
            };
            
            const filterString = getFilterFilenamePart(appliedFilters);
            const filename = `student_list${filterString ? '_' + filterString : ''}.xlsx`;
            
            saveAs(data, filename);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const applyFilters = () => {
    setAppliedFilters(filterUI);
    setPagination((prev) => ({ ...prev, current_page: 1 }));
    setAlumniData([]); // Clear current data to load fresh results
    setShowFilters(false);
  };

  const toggleCheckbox = (filterKey, value) => {
    if (value === '__CLEAR_ALL__') {
      setFilterUI((prev) => ({
        ...prev,
        [filterKey]: [],
      }));
    } else {
      setFilterUI((prev) => {
        const current = prev[filterKey];
        return {
          ...prev,
          [filterKey]: current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value],
        };
      });
    }
  };


  return (
    <div className="DirectoryWrapper">
      <div className="DirectorySearchWrapper">
        <SearchBar value={searchTerm} onChange={handleSearchChange} placeholder="Search current students..." per="100" />
      </div>

      <div className="directory-controls">
        <button onClick={() => setShowFilters(!showFilters)} >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>

        <button onClick={handleDownload} className="download-btn">
          Download Excel
        </button>
      </div>

      {showFilters && (
      <FilterPanel
        filters={filters}
        filterUI={filterUI}
        toggleCheckbox={toggleCheckbox}
        applyFilters={applyFilters}
      />
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

export default StudentDirectory;

