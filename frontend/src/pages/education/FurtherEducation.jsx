import React, { useState, useEffect } from 'react';
import TabbedCardPage from '../../components/opportunities/tabbed-card-page';
import OpportunityCard from '../../components/opportunities/opportunity-card';
import SupportRequestTable from '../../components/opportunities/support-request-table';
import './FurtherEducation.css';
import axios from 'axios';
import useAuth from "../../hooks/useAuth";
// import baseUrl from '../../api/baseUrl';
const  baseUrl='https://backend.asyv.ac.rw/api';

const FurtherEducation = () => {
  const { auth } = useAuth();

  const [activeTab, setActiveTab] = useState('Courses');
  const [opportunities, setOpportunities] = useState([]);
  const [supportRequests, setSupportRequests] = useState([]);

  const TABS = ['Courses', 'Programs', 'Support Requests'];

  useEffect(() => {
    fetchOpportunities();
    fetchSupportRequests();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const response = await axios.get(baseUrl + '/opportunity');
      const filtered = response.data.filter(
        (item) =>
          item.approved &&
          (item.op_type === 'Courses' || item.op_type === 'Programs')
      );
      setOpportunities(filtered);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSupportRequests = async () => {
    try {
      const response = await axios.get(baseUrl + '/support-request/get/');
      const userRequests = response.data.filter(
        (r) => r.alumni === auth.user.alumni_id
      );
      setSupportRequests(userRequests);
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
      .filter((op) => op.op_type === activeTab)
      .map((edu) => (
        <OpportunityCard
          key={edu.id}
          title={edu.title}
          description={edu.description}
          date={edu.deadline}
          link={edu.link}
          type={edu.op_type}
          company={edu.organization}
          onSupportRequest={() => handleRequestSupport(edu)}
          renderActions={() => (
            <>
              <button onClick={() => window.open(edu.link, "_blank")}>Learn More</button>
              <button onClick={() => handleRequestSupport(edu)}>Request CRC Support</button>
            </>
          )}
          labelOverrides={{
            organization: "Institution",
            title: "Program Name",
            description: "Program Description",
            date: "Registration Deadline",
            link: "Learn More"
          }}
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

export default FurtherEducation;
