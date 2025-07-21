
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

import OutcomePieChart from '../../components/directory/outcome-pie-chart.jsx';
// ... (imports remain unchanged)

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

  const [filterUI, setFilterUI] = useState({
    gender: [],
    graduation_year: [],
    family: [],
    combination: [],
    industry: [],
    college: [],
  });

  const [appliedFilters, setAppliedFilters] = useState({
    gender: [],
    graduation_year: [],
    family: [],
    combination: [],
    industry: [],
    college: [],
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
      if (appliedFilters.gender.length) params.gender = appliedFilters.gender;
      if (appliedFilters.graduation_year.length) params.year = appliedFilters.graduation_year;
      if (appliedFilters.family.length) params.family = appliedFilters.family;
      if (appliedFilters.combination.length) params.combination = appliedFilters.combination;
      if (appliedFilters.industry.length) params.industry = appliedFilters.industry;
      if (appliedFilters.college.length) params.college = appliedFilters.college;
      if (searchTerm) params.search = searchTerm;

      try {
        const response = await axios.get(baseUrl + '/alumni-directory/', {
          params,
          paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' }),
          headers: {
            Authorization: 'Bearer ' + auth.accessToken,
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        });

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
          further_education: element.further_education?.[0]?.college_name || '',
          is_alumni: element.is_alumni,
        }));

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
    const isDesktop = window.innerWidth >= 768;
    const scrollContainer = isDesktop ? document.querySelector('.desktop-table-wrapper') : window;
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
    return () => scrollContainer.removeEventListener('scroll', onScroll);
  }, [pagination.has_next, loading]);

  const handleDownload = async () => {
    try {
      const params = { page_size: 10000 };
      if (appliedFilters.gender.length) params.gender = appliedFilters.gender;
      if (appliedFilters.graduation_year.length) params.year = appliedFilters.graduation_year;
      if (appliedFilters.family.length) params.family = appliedFilters.family;
      if (appliedFilters.combination.length) params.combination = appliedFilters.combination;
      if (appliedFilters.industry.length) params.industry = appliedFilters.industry;
      if (appliedFilters.college.length) params.college = appliedFilters.college;

      const response = await axios.get(baseUrl + '/alumni-directory/', {
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
        gradeName: element.family.grade_info.grade_name,
        familyName: element.family.family_name,
        combinationName: element.combination.combination_name,
        grade: element.family.grade_info.grade_name || 'none',
        family: element.family.family_name || 'none',
        combination: element.combination.combination_name || '',
        employment: element.employment?.[0]?.title || '',
        industry: element.employment?.[0]?.industry || '',
        further_education: element.further_education?.[0]?.college || '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(allAlumni);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Alumni');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });

      const getFilterFilenamePart = (filters) =>
        Object.entries(filters)
          .filter(([_, value]) => value.length > 0)
          .map(([key, value]) => `${key}-${value.join('-')}`)
          .join('_');

      const filterString = getFilterFilenamePart(appliedFilters);
      const filename = `alumni_list${filterString ? '_' + filterString : ''}.xlsx`;

      saveAs(data, filename);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleSearchChange = (value) => setSearchTerm(value);

  const applyFilters = () => {
    setAppliedFilters(filterUI);
    setPagination((prev) => ({ ...prev, current_page: 1 }));
    setAlumniData([]);
    setShowFilters(false);
  };

  const toggleCheckbox = (filterKey, value) => {
    if (value === '__CLEAR_ALL__') {
      setFilterUI((prev) => ({ ...prev, [filterKey]: [] }));
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

  const getActiveFilterSummary = () => {
    const summaries = [];
    if (filterUI.gender.length)
      summaries.push(`Gender: ${filterUI.gender.join(', ')}`);
    if (filterUI.graduation_year.length)
      summaries.push(`Year: ${filterUI.graduation_year.join(', ')}`);
    if (filterUI.family.length)
      summaries.push(`Family: ${filterUI.family.length} selected`);
    if (filterUI.combination.length)
      summaries.push(`Combination: ${filterUI.combination.length} selected`);
    if (filterUI.industry.length)
      summaries.push(`Industry: ${filterUI.industry.join(', ')}`);
    if (filterUI.college.length)
      summaries.push(`College: ${filterUI.college.length} selected`);

    return summaries.join(' • ');
  };

  return (
    <div className="DirectoryWrapper">
      <div className="DirectorySearchWrapper">
        <SearchBar value={searchTerm} onChange={handleSearchChange} placeholder="Search alumni..." per="100" />
      </div>

      <div className="directory-controls">
        <button onClick={() => setShowFilters(!showFilters)}>
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>

        {!showFilters && getActiveFilterSummary() && (
          <div className="filter-summary-preview" title={getActiveFilterSummary()}>
            {getActiveFilterSummary()}
          </div>
        )}

        {(auth?.user?.is_superuser || auth?.user?.is_crc) && (
          <button onClick={handleDownload} className="download-btn">
            Download Excel
          </button>
        )}
      </div>

      {showFilters && (
        <FilterPanel
          filters={filters}
          filterUI={filterUI}
          toggleCheckbox={toggleCheckbox}
          applyFilters={applyFilters}
        />
      )}

      <div className="directory-content">
        <AlumniList alumni={alumniData} onSelect={setSelectedAlumni} />
        <div ref={loader}></div>
      </div>

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

