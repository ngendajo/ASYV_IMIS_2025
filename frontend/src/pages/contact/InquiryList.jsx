import React, { useState } from 'react';
import './Inquiry.css';
import useAuth from '../../hooks/useAuth';
import axios from 'axios';
import baseUrl from '../../api/baseUrl';

const InquiryList = ({ inquiries, handleReply, handleDeleteInquiry }) => {
  const [replyData, setReplyData] = useState({});
  const [activeTab, setActiveTab] = useState('incoming');
  const [editInquiryId, setEditInquiryId] = useState(null);
  const [hiddenInquiries, setHiddenInquiries] = useState([]);
  const [inquiry, setInquiry] = useState([]);
  const { auth } = useAuth();
  

  const handleInputChange = (e, id) => {
    const { value } = e.target;
    setReplyData({ ...replyData, [id]: value });
  };

  const handleSubmit = (e, inquiry) => {
    e.preventDefault();
    handleReply(inquiry.id, replyData[inquiry.id]);
    setReplyData({ ...replyData, [inquiry.id]: '' });
    setEditInquiryId(null);  // Close the edit box after submitting
  };

  // const handleDelete = (id) => {
  //   setHiddenInquiries([...hiddenInquiries, id]);
  // };




  const toggleEditInquiry = (id) => {
    if (editInquiryId === id) {
      setEditInquiryId(null);
    } else {
      setEditInquiryId(id);
    }
  };

  //const incomingInquiries = inquiries.filter(inquiry => !inquiry.answered_by && !hiddenInquiries.includes(inquiry.id));
 const answeredInquiries = inquiries.filter(inquiry => inquiry.answered_by && !hiddenInquiries.includes(inquiry.id));
  //console.log("inquiries",incomingInquiries);

  return (
    <div className="inquiry-list-section">
      <div className="inquiry-tabs">
        <button className={activeTab === 'incoming' ? 'active' : ''} onClick={() => setActiveTab('incoming')}>
          Incoming Inquiries
        </button>
        <button className={activeTab === 'answered' ? 'active' : ''} onClick={() => setActiveTab('answered')}>
          Answered Inquiries
        </button>
      </div>
      {activeTab === 'incoming' && (
        <div>
          <ul>
            {inquiry.length === 0 ? (
              <p>No incoming inquiries.</p>
            ) : (
              inquiry.map((inquiry) => (
                <li key={inquiry.id}>
                  <div className='inquiry-item'>
                    <div><strong>Email:</strong> {inquiry.email}</div>
                    <div><strong>Question:</strong> {inquiry.inquiry}</div>
                    {inquiry.answer && <div><strong>Answer:</strong> {inquiry.answer}</div>}
                  </div>
                  <form onSubmit={(e) => handleSubmit(e, inquiry)} className="reply-form">
                    <textarea
                      value={replyData[inquiry.id] || ''}
                      onChange={(e) => handleInputChange(e, inquiry.id)}
                      placeholder="Type your reply here..."
                      required
                    />
                    <button type="submit" className="reply-submit-button">Reply</button>
                  </form>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
      {activeTab === 'answered' && (
        <div>
          <ul>
            {answeredInquiries.length === 0 ? (
              <p>No answered inquiries.</p>
            ) : (
              answeredInquiries.map((inquiry) => (
                <li key={inquiry.id}>
                  <div className='inquiry-item'>
                    <div><strong>Email:</strong> {inquiry.email}</div>
                    <div><strong>Question:</strong> {inquiry.inquiry}</div>
                    <div><strong>Answer:</strong> {inquiry.answer}</div>
                
                  <div className="inquiry-actions">
                    <button onClick={() => toggleEditInquiry(inquiry.id)} className="reply-submit-button">
                      {editInquiryId === inquiry.id ? 'Close' : 'Update Reply'}
                    </button>
                    <button onClick={() => handleDeleteInquiry(inquiry.id)} className="inquiry-delete-button">
               Delete
                    </button>
                  </div>
                  </div>
                  {editInquiryId === inquiry.id && (
                    <form onSubmit={(e) => handleSubmit(e, inquiry)} className="reply-form">
                      <textarea
                        value={replyData[inquiry.id] || ''}
                        onChange={(e) => handleInputChange(e, inquiry.id)}
                        placeholder="Edit your reply here..."
                        required
                      />
                      <button type="submit" className="reply-submit-button">Submit</button>
                    </form>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InquiryList;