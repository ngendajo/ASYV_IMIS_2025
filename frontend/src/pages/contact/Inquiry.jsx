import React, { useEffect, useState } from 'react';
import './Inquiry.css';
import axios from 'axios';
import baseUrl from '../../api/baseUrl';

const Inquiry = () => {
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await axios.get(baseUrl + '/faqs/');
        let data = response.data;

        if (!data.length) {
          data = [
            {
              id: 'sample-1',
              question: 'How do I contact CRC?',
              answer: 'Reach out via the alumni portal or email the CRC directly.',
            },
            {
              id: 'sample-2',
              question: 'How can I update my employment or education?',
              answer: 'Go to your profile and click the "Edit" button.',
            },
          ];
        }

        setFaqs(data.map(faq => ({ ...faq, open: false })));
      } catch (err) {
        console.error('Failed to fetch FAQs:', err);
        // fallback if API fails
        setFaqs([
          {
            id: 'sample-1',
            question: 'How do I contact CRC?',
            answer: 'Reach out via the alumni portal or email the CRC directly.',
            open: false,
          },
          {
            id: 'sample-2',
            question: 'How can I update my employment or education?',
            answer: 'Go to your profile and click the "Edit" button.',
            open: false,
          },
        ]);
      }
    };

    fetchFaqs();
  }, []);

  const toggleFaq = (index) => {
    setFaqs(faqs.map((faq, i) => ({
      ...faq,
      open: i === index ? !faq.open : false,
    })));
  };

  return (
    <div className="faq-page">
      <h1>Frequently Asked Questions</h1>
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div
            key={faq.id}
            className={`faq-item ${faq.open ? 'open' : ''}`}
            onClick={() => toggleFaq(index)}
          >
            <div className="faq-question">
              {faq.question}
              <span className="arrow">{faq.open ? '▲' : '▼'}</span>
            </div>
            {faq.open && <div className="faq-answer">{faq.answer}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inquiry;
