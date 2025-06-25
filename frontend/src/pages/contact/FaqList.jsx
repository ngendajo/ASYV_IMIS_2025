import React, { useState } from 'react';
import './Inquiry.css';
import useAuth from '../../hooks/useAuth';


const FaqList = ({ faqs, toggleFaq, handleAddFaq, handleDeleteFaq }) => {
  console.log("data", faqs);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
  const { auth } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFaq({ ...newFaq, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAddFaq(newFaq);
    setNewFaq({ question: '', answer: '' });
  };

  return (
    <div className="faq-section">
      <h2>Frequently Asked Questions</h2>
      {faqs.map((faq, index) => (
        <div className={`faq-item ${faq.open ? 'open' : ''}`} key={faq.id} onClick={() => toggleFaq(index)}>
          <div className="faq-question">
            {faq.question}
            <span className="arrow">{faq.open ? '▲' : '▼'}</span>
          </div>
          <div className="faq-answer">
            {faq.open && <p>{faq.answer}</p>}
            {(auth.user.is_crc || auth.user.is_superuser) && (
              <button onClick={(e) => {
                e.stopPropagation();
                handleDeleteFaq(faq.id);
              }}>Delete</button>
            )}
          </div>
        </div>
      ))}
      {(auth.user.is_crc || auth.user.is_superuser) && (
        <form onSubmit={handleSubmit} className="faq-form">
          <div className="faq-form-group">
            <input
              type="text"
              name="question"
              placeholder="New Question"
              value={newFaq.question}
              onChange={handleInputChange}
              required
            />
         
            <input
              type="text"
              name="answer"
              placeholder="Answer"
              value={newFaq.answer}
              onChange={handleInputChange}
              required
            />
          </div>
          <button type="submit" className="faq-submit-button">Add FAQ</button>
        </form>
      )}
    </div>
  );
};

export default FaqList;
