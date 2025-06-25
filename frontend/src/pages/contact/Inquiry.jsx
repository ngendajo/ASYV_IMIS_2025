import React, { useState, useEffect } from 'react';
import FaqList from './FaqList';
import InquiryForm from './InquiryForm';
import InquiryList from './InquiryList';
import './Inquiry.css';
import useAuth from '../../hooks/useAuth';
import axios from 'axios';
import baseUrl from '../../api/baseUrl';

const Inquiry = () => {
  const [faqs, setFaqs] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', inquiry: '' });
  const [inquiries, setInquiries] = useState([]);
  const { auth } = useAuth();

  const fetchFaqs = async () => {
    try {
      const response = await axios.get(baseUrl + '/faqs/', {
        headers: {
          "Authorization": 'Bearer ' + String(auth.accessToken),
          "Content-Type": 'application/json'
        },
        withCredentials: true
      });
      const data = response.data.map(faq => ({
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        pinned: faq.pinned,
        open: false
      }));
      setFaqs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInquiries = async () => {
    try {
      const response = await axios.get(baseUrl + '/inquiries/', {
        headers: {
          "Authorization": 'Bearer ' + String(auth.accessToken),
          "Content-Type": 'application/json'
        },
        withCredentials: true
      });
      console.log(response.data);
      setInquiries(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFaqs();
    fetchInquiries();
  }, []);

  const toggleFaq = (index) => {
    setFaqs(faqs.map((faq, i) => {
      if (i === index) faq.open = !faq.open;
      else faq.open = false;
      return faq;
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
  
    e.preventDefault();
    const currentDateTime = new Date().toISOString();
    console.log("formData",formData);
    const newInquiry = {
      inquiry: formData.inquiry,
      email: formData.email,
      sent_by: auth.user.id,
      answered_by: null,
      answer: '',
      time_date: currentDateTime
    };
    console.log("newInquiry",newInquiry);
    try {
      const response = await axios.post(baseUrl + '/inquiries/', newInquiry, {
        headers: {
          "Authorization": 'Bearer ' + String(auth.accessToken),
          "Content-Type": 'application/json'
        },
        withCredentials: true
      });
      setInquiries([...inquiries, response.data]);
      setFormData({ name: '', email: '', inquiry: '' });
      alert("Your inquiry has been sent to CRC Staff")
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = async (id, reply) => {
    const updateInquiry = {
      answer: reply,
      answered_by: auth.user.id
    };

    try {
      const response = await axios.patch(baseUrl + `/inquiries/${id}/`, updateInquiry, {
        headers: {
          "Authorization": 'Bearer ' + String(auth.accessToken),
          "Content-Type": 'application/json'
        },
        withCredentials: true
      });
      setInquiries(inquiries.map(inquiry => {
        if (inquiry.id === id) {
          return { ...inquiry, answer: response.data.answer, answered_by: response.data.answered_by };
        }
        return inquiry;
      }));
    } catch (err) {
      console.error(err);
    }

    
  };

  const handleAddFaq = async (newFaq) => {
    try {
      const response = await axios.post(baseUrl + '/faqs/', newFaq, {
        headers: {
          "Authorization": 'Bearer ' + String(auth.accessToken),
          "Content-Type": 'application/json'
        },
        withCredentials: true
      });
      setFaqs([...faqs, { ...response.data, open: false }]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFaq = async (id) => {
    try {
      await axios.delete(baseUrl + `/faqs/${id}/`, {
        headers: {
          "Authorization": 'Bearer ' + String(auth.accessToken),
          "Content-Type": 'application/json'
        },
        withCredentials: true
      });
      setFaqs(faqs.filter(faq => faq.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteInquiry = async (id) => {
    try {
      await axios.delete(baseUrl + `/inquiries/${id}/`, {
        headers: {
          "Authorization": 'Bearer ' + String(auth.accessToken),
          "Content-Type": 'application/json'
        },
        withCredentials: true
      });

      setInquiries(inquiries.filter(faq => faq.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="inquiry-page">
      <FaqList faqs={faqs} toggleFaq={toggleFaq} handleAddFaq={handleAddFaq} handleDeleteFaq={handleDeleteFaq} />
      {auth.user.is_crc || auth.user.is_superuser ? (
        <InquiryList inquiries={inquiries} handleReply={handleReply} handleDeleteInquiry={handleDeleteInquiry}/>
      ) : (
        <InquiryForm handleSubmit={handleSubmit} formData={formData} handleInputChange={handleInputChange} />
      )}
    </div>
  );
};

export default Inquiry;
