import React, { useState, useEffect } from 'react';
import TabbedCardPage from '../../components/opportunities/tabbed-card-page';
import OpportunityCard from '../../components/opportunities/opportunity-card';
import SupportRequestTable from '../../components/opportunities/support-request-table';
import OpportunityModal from '../../components/opportunities/opportunity-modal';
import axios from 'axios';
import useAuth from "../../hooks/useAuth";
// import baseUrl from '../../api/baseUrl';
const  baseUrl='https://backend.asyv.ac.rw/api';

const FurtherEducationStaff = () => {
  const { auth } = useAuth();
  const [activeTab, setActiveTab] = useState('Support Requests');
  const [opportunities, setOpportunities] = useState([]);
  const [supportRequests, setSupportRequests] = useState([]);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [creatingNew, setCreatingNew] = useState(false);

  const TABS = ['Support Requests', 'Courses', 'Programs'];

  useEffect(() => {
    fetchOpportunities();
    fetchSupportRequests();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const res = await axios.get(baseUrl + '/opportunity');
      const filtered = res.data.filter(op => ['Courses', 'Programs'].includes(op.op_type));
      const sorted = filtered.sort((a, b) => a.approved - b.approved);
      setOpportunities(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSupportRequests = async () => {
    try {
      const res = await axios.get(baseUrl + '/support-request/get/');
      setSupportRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostToggle = async (id, approved) => {
    try {
      await axios.patch(`${baseUrl}/opportunity/${id}/approve`, { approved: !approved }, {
        headers: { Authorization: `Bearer ${auth.accessToken}` }
      });
      fetchOpportunities();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEdit = async (data, isNew) => {
    try {
      if (isNew) {
        await axios.post(`${baseUrl}/opportunity/create/`, data, {
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
      } else {
        await axios.put(`${baseUrl}/opportunity/${data.id}/update/`, data, {
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
      }
      setEditingOpportunity(null);
      setEditMode(false);
      setCreatingNew(false);
      fetchOpportunities();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${baseUrl}/opportunity/${id}/delete/`, {
        headers: { Authorization: `Bearer ${auth.accessToken}` }
      });
      fetchOpportunities();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateClick = () => {
    setEditingOpportunity({
      title: "",
      description: "",
      deadline: "",
      op_type: activeTab,
      link: "",
      organization: "",
      location: ""
    });
    setEditMode(true);
    setCreatingNew(true);
  };

  const renderCards = () => {
    const filtered = opportunities.filter(op => op.op_type === activeTab);
    return filtered.map(op => {
      const isDraft = !op.approved;
      return (
        <OpportunityCard
          key={op.id}
          title={op.title}
          description={op.description}
          date={op.deadline}
          link={op.link}
          company={op.organization}
          draft={isDraft}
          onClick={() => {
            setEditingOpportunity(op);
            setEditMode(false);
            setCreatingNew(false);
          }}
          renderActions={() => (
            <>
              {isDraft ? (
                <>
                  <button onClick={() => handlePostToggle(op.id, op.approved)}>Post</button>
                  <button onClick={() => {
                    setEditingOpportunity(op);
                    setEditMode(true);
                    setCreatingNew(false);
                  }}>Edit</button>
                  <button onClick={() => handleDelete(op.id)}>Delete</button>
                </>
              ) : (
                <>
                  <button onClick={() => handlePostToggle(op.id, op.approved)}>Hide</button>
                  <button onClick={() => {
                    setEditingOpportunity(op);
                    setEditMode(true);
                    setCreatingNew(false);
                  }}>Edit</button>
                </>
              )}
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
      );
    });
  };

  const renderSupportRequests = () => (
    <SupportRequestTable
      requests={supportRequests.map(r => ({
        ...r,
        alumni: r.alumni || "Unknown"
      }))}
    />
  );

  return (
    <>
      <TabbedCardPage
        tabs={TABS}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        renderCards={renderCards}
        renderFinalTab={renderSupportRequests}
        showCreateButton={activeTab !== "Support Requests"}
        onCreateClick={handleCreateClick}
      />

      {editingOpportunity && (
        <OpportunityModal
          opportunity={editingOpportunity}
          editMode={editMode}
          onClose={() => {
            setEditingOpportunity(null);
            setEditMode(false);
            setCreatingNew(false);
          }}
          onSave={(data) => handleSaveEdit(data, creatingNew)}
          onDelete={() => handleDelete(editingOpportunity.id)}
          onPostToggle={() => handlePostToggle(editingOpportunity.id, editingOpportunity.approved)}
          labelOverrides={{
            organization: "Institution",
            title: "Program Name",
            description: "Program Description",
            date: "Registration Deadline",
            link: "Learn More"
          }}
        />
      )}
    </>
  );
};

export default FurtherEducationStaff;
