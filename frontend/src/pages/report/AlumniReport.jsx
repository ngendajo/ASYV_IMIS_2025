import React, { useState, useEffect } from 'react';
import AlumniList from '../../components/directory/alumni-list.jsx';
import AlumniDetail from '../../components/directory/alumni-detail.jsx';
import SearchBar from '../../components/dashboard/search-bar.jsx';
import './AlumniReport.css';
import ReactPaginate from 'react-paginate';



import axios from 'axios';
import baseUrl from '../../api/baseUrl.js';
import baseUrlforImg from '../../api/baseUrlforImg.js';
import useAuth from '../../hooks/useAuth.js';

import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
// npm install file-saver xlsx

import EmploymentChart from '../../components/report/employment-chart';

const AlumniReport = () => {

    const [empByGrade, setEmpByGrade] = useState([]);

    const [selectedAlumni, setSelectedAlumni] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [alumniData, setAlumniData] = useState([]);
    
    const [gradeFilter, setGradeFilter] = useState('');
    const [gradeOptions, setGradeOptions] = useState([]);
    const [familyFilter, setFamilyFilter] = useState('');
    const [familyOptions, setFamilyOptions] = useState([]);
    const [combinationFilter, setCombinationFilter] = useState('');
    const [combinationOptions, setCombinationOptions] = useState([]);
    const [industryFilter, setIndustryFilter] = useState('');
    const [industryOptions, setIndustryOptions] = useState([]);
    const { auth } = useAuth();

    const [currentPage, setCurrentPage] = useState(0);
    const alumniPerPage = 4;

    useEffect(() => {
        const getalumniusers = async () => {
            try {
                const response = await axios.get(baseUrl + '/alumnilist/', {
                    headers: {
                        "Authorization": 'Bearer ' + String(auth.accessToken),
                        "Content-Type": 'multipart/form-data'
                    },
                    withCredentials: true
                });

                const alumnilist = response.data.map((element, index) => ({
                    id: element.id,
                    profilePic: baseUrlforImg + "/media/" + element.image_url,
                    email: element.email,
                    firstName: element.first_name,
                    lastName: element.last_name,
                    phone: element.phone1,
                    grade: element.grade_name || "none",
                    family: element.family_name || "none",
                    combination: element.combination_name || "",
                    industry: element.career || ""
                }));

                setAlumniData(alumnilist);
                setGradeOptions([...new Set(alumnilist.map(alum => alum.grade))]);
                setFamilyOptions([...new Set(alumnilist.map(alum => alum.family))]);
                setCombinationOptions([...new Set(alumnilist.map(alum => alum.combination))]);
                setIndustryOptions([...new Set(alumnilist.map(alum => alum.industry))]);
            } catch (err) {
                console.log(err);
            }
        };
        getalumniusers();
    }, [auth]);

    const filteredAlumni = alumniData
        .filter((alum) => `${alum.firstName} ${alum.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter((alum) => (gradeFilter === '' || alum.grade === gradeFilter))
        .filter((alum) => (familyFilter === '' || alum.family === familyFilter))
        .filter((alum) => (combinationFilter === '' || alum.combination === combinationFilter))
        .filter((alum) => (industryFilter === '' || alum.industry === industryFilter))
        .sort((a, b) => a.lastName.localeCompare(b.lastName));

    const handlePageClick = ({ selected }) => {
        setCurrentPage(selected);
    };

    const offset = currentPage * alumniPerPage;
    const currentAlumni = filteredAlumni.slice(offset, offset + alumniPerPage);

    const handleDownload = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredAlumni);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Alumni');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(data, 'alumni_list.xlsx');
    };

    const handleGradeFilter = () => {
        setGradeFilter('');
    };
    const handleFamilyFilter = () => {
        setFamilyFilter('');
    };
    const handleCombinationFilter = () => {
        setCombinationFilter('');
    };
    const handleIndustryFilter = () => {
        setIndustryFilter('');
    };

    useEffect(() =>{
    
        const getEmpStu = async () =>{
            try{
                const response = await axios.get(baseUrl+'/emplbygrade/',{
                    headers: {
                        "Authorization": 'Bearer ' + String(auth.accessToken),
                        "Content-Type": 'multipart/form-data'
                    },
                    withCredentials:true
                });
                console.log(response.data)
                response.data.length>0?setEmpByGrade(response.data):setEmpByGrade([])
                
             
            }catch(err) {
                console.log(err);
            }
        }
    
        getEmpStu();
    
    },[auth])
    
    return (
        <div className="DirectoryWrapper">
            <div className="DirectoryRest">
                <div className="DirectoryList">
                    <div className="DirectorySearchWrapper">
                        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search alumni..." per="100"/>
                    </div>
                    <div className="filter-bar">
                        <div className={`filter-button ${gradeFilter ? 'filter-applied' : ''}`}>
                            {gradeFilter && <button onClick={handleGradeFilter}>&#x2715;</button>}
                            <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)}>
                                <option value="" disabled>Grade</option>
                                {gradeOptions.slice().sort().map((grade) => (
                                    <option key={grade} value={grade}>{grade}</option>
                                ))}
                            </select>
                        </div>
                        <div className={`filter-button ${familyFilter ? 'filter-applied' : ''}`}>
                            {familyFilter && <button onClick={handleFamilyFilter}>&#x2715;</button>}
                            <select value={familyFilter} onChange={(e) => setFamilyFilter(e.target.value)}>
                                <option value="" disabled>Family</option>
                                {familyOptions.slice().sort().map((family) => (
                                    <option key={family} value={family}>{family}</option>
                                ))}
                            </select>
                        </div>
                        <div className={`filter-button ${combinationFilter ? 'filter-applied' : ''}`}>
                            {combinationFilter && <button onClick={handleCombinationFilter}>&#x2715;</button>}
                            <select value={combinationFilter} onChange={(e) => setCombinationFilter(e.target.value)}>
                                <option value="" disabled>Combination</option>
                                {combinationOptions.slice().sort().map((combination) => (
                                    <option key={combination} value={combination}>{combination}</option>
                                ))}
                            </select>
                        </div>
                        <div className={`filter-button ${industryFilter ? 'filter-applied' : ''}`}>
                            {industryFilter && <button onClick={handleIndustryFilter}>&#x2715;</button>}
                            <select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)}>
                                <option value="" disabled>Industry</option>
                                {industryOptions.slice().sort().map((industry) => (
                                    <option key={industry} value={industry}>{industry}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="directory-title">
                        Search Results:
                        <button onClick={handleDownload}>Download as Excel</button>
                    </div>
                    <div className="directory-content">
                        <AlumniList alumni={currentAlumni} onSelect={setSelectedAlumni} />
                    </div>
                </div>
                <div className="DirectoryDetail">
                <EmploymentChart datainput={empByGrade}  />
                </div>
            </div>
        </div>
    );
};

export default AlumniReport;