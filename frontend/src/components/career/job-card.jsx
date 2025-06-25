import React, { useState } from 'react';
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import "./job-card.css";

const JobCard = ({ alumni, title, type, description, date, link, approved, onApprove, onChange, onSave, isNew}) => {
  const { auth } = useAuth();
  const currentDate = new Date().toLocaleDateString('en-GB');
  const [isEditingPo, setIsEditingPo] = useState(false);
  const [isEditingPe, setIsEditingPe] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description);
  const [editedDate, setEditedDate] = useState(date);
  const [editedLink, setEditedLink] = useState(link);

  const handleEdit = () => {
    if (approved) {
      setIsEditingPo(true);
    }
    else {
      setIsEditingPe(true);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault(); 
    if (editedDescription.length > 200) {
      alert("Exceed character limit: 200");
      return;
    }
    const opportunityData = {
      title: editedTitle,
      op_type: type,
      user: auth.user.id,
      description: editedDescription,
      post_time: currentDate,
      diedline: type==="Professional"?currentDate:editedDate,
      link: editedLink
    };
    if (isNew) {
      onSave(opportunityData);
    } else {
      onChange(opportunityData);
      approved ? setIsEditingPo(false) : setIsEditingPe(false);
    }
  };
  const handleCancel = () => {
    if (isNew) {
      onSave(null);
    } else {
      approved ? setIsEditingPo(false) : setIsEditingPe(false);
      setEditedTitle(title);
      setEditedDescription(description);
      setEditedDate(date);
      setEditedLink(link);
    }
  };

  return (
    <div className={`job-card ${isEditingPo ? 'editingPo' :
                                isEditingPe ? 'editingPe' :
                                isNew ? 'editingPe' :
                                !approved ? 'not-approved' :
                                alumni==='true' ? 'alumni' : 'approved'}`}>
      {onApprove && (
        <div className="job-state-con">
          <div className={`job-state ${isEditingPo ? 'editingPo' :
                                       isEditingPe ? 'editingPe' :
                                       isNew ? 'editingPe' :
                                       !approved ? 'not-approved' : 'approved'}`}>
          {isEditingPo || isEditingPe || isNew ? 'EDITING' : approved ? 'POSTED' : 'DRAFT'}
          </div>
        </div>
      )}
      {isEditingPo || isEditingPe || isNew ? (
        <form onSubmit={handleSave}>
          <input
            type="text"
            placeholder="Title"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
          />
          <textarea
            placeholder="Description"
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
          />
          <div className="job-char-count">
            Character Count: {editedDescription.length}/200
          </div>
          {type==="Professional"? 
            null
            :
            <input
              type="date"
              value={editedDate}
              onChange={(e) => setEditedDate(e.target.value)}
            />
          }
          
          <input
            type="url"
            placeholder="Link"
            value={editedLink}
            onChange={(e) => setEditedLink(e.target.value)}
          />
          <div className="job-admin-actions">
            {isEditingPo && <button type="submit" className="jobpost">Post</button>}
            {isEditingPe && <button type="submit" className="jobsave">Save</button>}
            {isNew && <button type="submit" className="jobsave">Save</button>}
            <button onClick={handleCancel} className="jobedit">Cancel</button>
          </div>
        </form>
      ) : (
        <>
          <div className="job-card-header">
            <p>{title}</p >
          </div>
          <p className="job-des">{description}</p >
          {type==="Professional"? 
            null:
              <p className="job-apply-by">Apply by: {date}</p >
            }
          <Link to={link} target="_blank" rel="noopener noreferrer"
            className="job-view-apply-button">{type==="Professional"? "Start Course":"View and Apply"}
          </Link>
          {onApprove && (
            <div className="job-admin-actions">
              {!approved && <button onClick={onApprove} className="jobpost">Post</button>}
              {approved && <button onClick={onApprove} className="jobremove">Remove</button>}
              <button onClick={handleEdit} className="jobedit">Edit</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
  
export default JobCard;