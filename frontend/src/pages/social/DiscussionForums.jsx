import React, { useState, useEffect } from 'react';
import './DiscussionForums.css';
import useAuth from '../../hooks/useAuth';
import { FaThumbtack, FaTrash } from 'react-icons/fa';
import baseUrl from '../../api/baseUrl';
import axios from 'axios';
import baseUrlforImg from "../../api/baseUrlforImg";

const DiscussionForum = () => {
  const { auth } = useAuth(); // To get user role

  const [announcements, setAnnouncements] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeTab, setActiveTab] = useState('announcements');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [newGroup, setNewGroup] = useState({ name: '', whatsappLink: '', qrCode: null });
  const [isAddingGroup, setIsAddingGroup] = useState(false);

  const getData = async () => {
    try {
      const response = await axios.get(baseUrl + '/announcements/', {
        headers: {
          "Authorization": 'Bearer ' + String(auth.accessToken),
          "Content-Type": 'multipart/form-data'
        },
        withCredentials: true
      });
      const data = response.data.map(announce => ({
        id: announce.id,
        text: announce.text,
        date: new Date(announce.date_time).toLocaleDateString(),
        time: new Date(announce.date_time).toLocaleTimeString(),
        pinned: announce.pinned
      }));
      setAnnouncements(data);
    } catch (err) {
      console.log(err);
    }
  };

  const getGroups = async () => {
    try {
      const response = await axios.get(baseUrl + '/groups/', {
        headers: {
          "Authorization": 'Bearer ' + String(auth.accessToken),
          "Content-Type": 'application/json'
        },
        withCredentials: true
      });
      setGroups(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getData();
    getGroups();
  }, [auth]);

  const handleGroupClick = (groupId) => {
    setSelectedGroup(groupId);
  };

  const handlePinAnnouncement = async (id, text, pinned) => {
    try {
      // Unpin the currently pinned announcement, if any
      const currentlyPinned = announcements.find(ann => ann.pinned);
      if (currentlyPinned && currentlyPinned.id !== id) {
        await axios.put(baseUrl + '/announcements/' + currentlyPinned.id + '/', {
          text: currentlyPinned.text,
          posted_by: auth.user.id,
          pinned: false
        }, {
          headers: {
            "Authorization": 'Bearer ' + String(auth.accessToken),
            "Content-Type": 'application/json'
          }
        });
      }

      // Pin the new announcement
      await axios.put(baseUrl + '/announcements/' + id + '/', {
        text,
        posted_by: auth.user.id,
        pinned: !pinned
      }, {
        headers: {
          "Authorization": 'Bearer ' + String(auth.accessToken),
          "Content-Type": 'application/json'
        }
      });

      getData();
      alert("Pinned successfully");
    } catch (err) {
      console.log(err.response);
    }

    setAnnouncements(prev => {
      return prev.map(ann => ({
        ...ann,
        pinned: ann.id === id ? !ann.pinned : ann.pinned
      }));
    });
  };

  const handleSubmitAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await axios.post(baseUrl + '/announcements/', {
        posted_by: auth.user.id,
        text: newAnnouncement,
        pinned: false
      }, {
        headers: {
          "Authorization": 'Bearer ' + String(auth.accessToken),
          "Content-Type": 'application/json'
        }
      });
      getData();
      alert("Announcement posted successfully");
      setNewAnnouncement(''); 
    } catch (err) {
      console.log(err.response);
    }
  };

  const handleAddGroup = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('group_name', newGroup.name);
      formData.append('whatsapp_link', newGroup.whatsappLink);
      formData.append('qr_code', newGroup.qrCode);
      formData.append('pinned', false);

      await axios.post(baseUrl + '/groups/', formData, {
        headers: {
          "Authorization": 'Bearer ' + String(auth.accessToken),
          "Content-Type": 'multipart/form-data'
        }
      });
      getGroups();
      alert("Group added successfully");
    } catch (err) {
      console.log(err.response);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      await axios.delete(baseUrl + '/announcements/' + id + '/', {
        headers: {
          "Authorization": 'Bearer ' + String(auth.accessToken),
          "Content-Type": 'application/json'
        }
      });
      getData();
      alert("Deleted successfully");
    } catch (err) {
      console.log(err.response);
    }
  };

  const handleDeleteGroup = async (id) => {
    try {
      await axios.delete(baseUrl + '/groups/' + id + '/', {
        headers: {
          "Authorization": 'Bearer ' + String(auth.accessToken),
          "Content-Type": 'application/json'
        }
      });
      getGroups();
      alert("Group deleted successfully");
    } catch (err) {
      console.log(err.response);
    }
  };

  const filteredGroups = groups.filter(group =>
    group.group_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  console.log(selectedGroup);

  const sortedAnnouncements = [...announcements]
  .sort((a, b) => b.dateTime - a.dateTime) // Sort by date and time
  .sort((a, b) => b.pinned - a.pinned); // Sort by pinned status

  return (
    <div className='AlumniForumContainer'>
      <div className="alumni-dashboard">
        <div className="forum-tabs">
          <button className={activeTab === 'announcements' ? 'active' : ''} onClick={() => setActiveTab('announcements')}>Announcements</button>
          <button className={activeTab === 'groups' ? 'active' : ''} onClick={() => setActiveTab('groups')}>Groups</button>
        </div>

        <div className="forum-tab-content">
          {activeTab === 'announcements' && (
            <div>
              {sortedAnnouncements.map((announce, index) => (
                <div key={index} className={`announcement-item ${announce.pinned ? '' : ''}`}>
                  <div className="date">{announce.date}</div>
                  <div className="message-container">
                    <div className="profile-pic">
                      <img src="https://img.icons8.com/?size=100&id=7821&format=png&color=000000" alt="Profile" />
                    </div>
                    <div className="message-content">
                    <div className={announce.pinned ? 'pinned' : 'message-text'}>
  {announce.text}
</div>
                      <div className="message-time">{announce.time}</div>
                    </div>
                    {auth.user.is_superuser && (
                      <div className="announcement-actions">
                        <button onClick={() => handlePinAnnouncement(announce.id, announce.text, announce.pinned)} className="msg-pin">
                          <FaThumbtack className={announce.pinned ? 'pinned-icon' : ''} />
                        </button>
                        <button onClick={() => handleDeleteAnnouncement(announce.id)} className="msg-delete">
                          <FaTrash />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {auth.user.is_superuser && (
                <div className="announcement-form">
                  <textarea
                    value={newAnnouncement}
                    onChange={(e) => setNewAnnouncement(e.target.value)}
                    placeholder="Add new announcement..."
                  />
                  <button onClick={handleSubmitAnnouncement}>Submit</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'groups' && (
            <div className="group-list-container">
              <input
                type="text"
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="group-search-input"
              />
              <div className="groups-container">
                <ul className="group-list">
                  {filteredGroups.map((group) => (
                    <li key={group.id} className={selectedGroup === group.id ? 'active' : ''} onClick={() => handleGroupClick(group.id)}>
                      {group.group_name} {auth.user.is_superuser && (
                        <button onClick={() => handleDeleteGroup(group.id)} className="delete-group-btn">
                          <FaTrash />
                        </button>
                      )}
                    </li>
                  ))}
                  {auth.user.is_superuser && (
                    <>
                      {!isAddingGroup ? (
                        <button onClick={() => setIsAddingGroup(true)} className="add-group-button">Add Group</button>
                      ) : (
                        <div className="group-form">
                          <input
                            type="text"
                            placeholder="Group name"
                            value={newGroup.name}
                            onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                          />
                          <input
                            type="text"
                            placeholder="WhatsApp link"
                            value={newGroup.whatsappLink}
                            onChange={(e) => setNewGroup({ ...newGroup, whatsappLink: e.target.value })}
                          />
                          <input
                            type="file"
                            id="media"
                            name="media"
                            accept="image/*"
                            onChange={(e) => setNewGroup({ ...newGroup, qrCode: e.target.files[0] })}
                          />
                          <div className='form-buttons'>
                            <button onClick={handleAddGroup} className="submit-button">Submit</button>
                            <button onClick={() => setIsAddingGroup(false)} className="group-back-button">&lt; Back</button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </ul>

                {selectedGroup && (
                <div className="group-details">
                  <button className="join-whatsapp-button">
                  <a href={groups.find(group => group.id === selectedGroup)?.whatsapp_link} target="_blank" rel="noopener noreferrer">
                    Scan or click to join the WhatsApp group
                  </a>
                </button>
                  <img src={groups.find(group => group.id === selectedGroup)?.qr_code} alt="QR Code" className = "qr-code-container"/>
                </div>
              )}
              </div>
             
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscussionForum;
