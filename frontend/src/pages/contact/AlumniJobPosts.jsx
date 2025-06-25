import React, { useState, useEffect } from 'react';
import './AlumniJobPosts.css';
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import baseUrl from '../../api/baseUrl';
import ReactPaginate from 'react-paginate';

const AlumniJobPosts = () => {
  const { auth } = useAuth();
  const currentDate = new Date().toLocaleDateString('en-GB');

  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [link, setLink] = useState('');
  const [activeTab, setActiveTab] = useState('new');
  const [jobList, setJobList] = useState([]);

  const [currentPage, setCurrentPage] = useState(0);
  const jobsPerPage = 7;

  useEffect(() => {
    const fetchJobList = async () => {
      try {
        const response = await axios.get(baseUrl + '/opportunity');
        const sortedJobList = response.data.sort((a, b) => a.approved - b.approved);
        setJobList(sortedJobList);
      } catch (error) {
        console.log(error);
      }
    };
    fetchJobList();
  }, []);

  const formatTime = (time) => {
    const [date, month, year] = time.split('/');
    return `${year}-${month}-${date}`
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    if (description.length > 200) {
      alert("Exceed character limit: 200");
      return;
    }
    const opportunityData = {
      title: title,
      op_type: type,
      user: auth.user.id,
      description: description,
      post_time: currentDate,
      diedline: date,
      link: link
    };

    axios({
      method: 'post',
      url: `${baseUrl}/opportunity/create/`,
      data: opportunityData,
      headers: {
        "Authorization": 'Bearer ' + String(auth.accessToken),
        "Content-Type": 'application/json'
      }
    })
    .then(res => {
      console.log(res);
      alert("Submitted successfully");
      setTitle('');
      setType('');
      setDescription('');
      setDate('');
      setLink('');
    })
    .catch(error => console.log(error));
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const offset = currentPage * jobsPerPage;
  const filterJob = jobList.filter(job => job.op_type === "Full Time" || 
                                        job.op_type === "Part Time" ||
                                        job.op_type === "Internship" ||
                                        job.op_type === "Volunteer")
  const alumniJob = filterJob.filter(job => job.user === auth.user.id)
  const currentJobs = alumniJob.slice(offset, offset + jobsPerPage);

    return (
      <div className="JobContainer">
        <div className="job-tabs">
          <button className={activeTab === 'new' ? 'active' : ''} onClick={() => setActiveTab('new')}>Create New</button>
          <button className={activeTab === 'submitted' ? 'active' : ''} onClick={() => setActiveTab('submitted')}>Submitted</button>
        </div>

        <div className="job-request-form" style={{ display: activeTab === 'new' ? 'block' : 'none' }}>
          <form onSubmit={handleSubmit}>
            <div className="job-request-form-grid">
              {/* 1. Job Title */}
              <input type="text" placeholder="Job Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              {/* 2. Job Type */}
              <select value={type} onChange={(e) => setType(e.target.value)} required>
                <option value="" disabled>Select Job Type</option>
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Internship">Internship</option>
                <option value="Volunteer">Volunteer</option>
              </select>
              {/* 3. Link to Apply */}
              <input type="url" placeholder="Link to Apply" value={link} onChange={(e) => setLink(e.target.value)} required />
              {/* 4. Apply Deadline */}
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            {/* 5. Job Description */}
            <textarea placeholder="Job Description" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
            <div className="char-count">Character Count: {description.length}/200</div>
            {/* 6. Submit */}
            <div className="submit-container">
              <button type="submit">Submit</button>
            </div>
          </form>
        </div>

        <div className="submitted-jobs" style={{ display: activeTab === 'submitted' ? 'block' : 'none' }}>
          <div className="submitted-jobs-list">
          {alumniJob.length === 0 ? <p>No posts submitted yet.</p> : (
            <>
              <table className="job-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Job Type</th>
                    <th>Post Time</th>
                    <th>Post Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentJobs.map(job => (
                    job.user === auth.user.id ? (
                      <tr key={job.id}>
                        <td>{job.title}</td>
                        <td>{job.op_type}</td>
                        <td>{formatTime(job.post_time)}</td>
                        <td>{job.approved ? 'Approved' : 'Pending'}</td>
                      </tr>
                    ) : null
                  ))}
                </tbody>
              </table>
              <ReactPaginate
                previousLabel={'<'}
                nextLabel={'>'}
                breakLabel={'...'}
                pageCount={Math.ceil(alumniJob.length / jobsPerPage)}
                marginPagesDisplayed={1}
                pageRangeDisplayed={3}
                onPageChange={handlePageClick}
                containerClassName={'job-pagination'}
                activeClassName={'active'}
              />
            </>
          )}
          </div>
        </div>
    </div>
  );
};

export default AlumniJobPosts;