import React, { useState, useEffect } from 'react';
import TabbedCardPage from '../../components/opportunities/tabbed-card-page';
import OpportunityCard from '../../components/opportunities/opportunity-card';
import SupportRequestTable from '../../components/opportunities/support-request-table';
import './CareerOpportunity.css';
import axios from 'axios';
import useAuth from "../../hooks/useAuth";
// import baseUrl from '../../api/baseUrl';
const  baseUrl='https://backend.asyv.ac.rw/api';

const CareerOpportunity = () => {
  const { auth } = useAuth();

  const [activeTab, setActiveTab] = useState('Full Time');
  const [opportunities, setOpportunities] = useState([]);
  const [supportRequests, setSupportRequests] = useState([]);

  const TABS = [
    'Full Time',
    'Part Time',
    'Internship',
    'Volunteer',
    'Professional',
    'Support Requests'
  ];

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const response = await axios.get(baseUrl + '/opportunity');
      const sorted = response.data.sort((a, b) => a.approved - b.approved);
      setOpportunities(sorted);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRequestSupport = (op) => {
    const timestamp = new Date().toLocaleString();
    setSupportRequests(prev => [
      ...prev,
      {
        title: op.title,
        company: op.organization,
        type: op.op_type,
        timestamp,
        status: 'Pending'
      }
    ]);
    alert("CRC support requested.");
  };

  const renderCards = () => {
    return opportunities
      .filter((op) => op.op_type === activeTab && op.approved)
      .map((job) => (
        <OpportunityCard
          key={job.id}
          title={job.title}
          description={job.description}
          date={job.deadline}
          link={job.link}
          type={job.op_type}
          company={job.organization}
          onSupportRequest={handleRequestSupport}
          renderActions={() => (
            <>
              <button onClick={() => window.open(job.link, "_blank")}>Apply</button>
              <button onClick={() => handleRequestSupport(job)}>Request CRC Support</button>
            </>
          )}
        />
      ));
  };

  const renderFinalTab = () => (
    <SupportRequestTable requests={supportRequests} />
  );

  return (
    <TabbedCardPage
      tabs={TABS}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      renderCards={renderCards}
      renderFinalTab={renderFinalTab}
    />
  );
};

export default CareerOpportunity;
