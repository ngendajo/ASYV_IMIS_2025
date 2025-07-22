import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import './Inquiry.css'; 

const Inquiry = () => {
  const { auth } = useAuth();
  const user = auth?.user;

  const staffFaqs = [
    {
      id: 'staff-5',
      question: 'What is the Alumni Management System used for?',
      answer:<>
      The system is used to track and manage alumni data, including contact information, education and employment status, engagement activities, and follow-up support.
    </>,
      open: false,
    },
    {
      id: 'staff-6',
      question: 'Who has access to the system?',
      answer:<>
      Authorized staff members and authorized alumni with login credentials have access. Permissions differ between different roles.
       Alumni can only see basic information about other alumni, and can only edit some informtion on their profile. 
       Staff members have access to see all alumni information and aggregated statistics. 
    </>,
      open: false,
    },
    {
      id: 'staff-1',
      question: 'How do I manage alumni/student data?',
      answer: (
        <>
          <strong>For Alumni:</strong>
          <ul>
            <li>Use the alumni directory, search or filter for the alumni to update their profile</li>
            <strong>To add further education record:</strong>
              <ul>
                <li> Select 'Edit' then 'Add new' in Academic section of profile and fill in the information about degree, university, and scholarship details. 
                  If the college is not in the dropdown, it has to be created first in 'College' section of 'Add Data' page. Location will be automatically set based on the location of the selected college. </li>
              </ul>
            <strong>To add employment record:</strong>
              <ul> 
                <li> Select 'Edit' then 'Add new' in Employment section of profile and fill in the information about job title, company, status, etc. 
                  A start date is required, but an end date is not  </li>
              </ul>
          </ul>
          <strong>For Current Students:</strong>
          <ul>
            <li>Use the current student directory, search or filter for the current student to update their profile</li>
            <li>Or to update in bulk, select the 'add' button for students in Add Data page and upload an excel sheet</li>
          </ul>
        </>
      ),
      open: false,
    },
    {
      id: 'staff-4',
      question: 'How do I update National Exam Score?',
      answer:<>
      In a student's profile, select 'Edit' for ASYV Info and input the national exam score in the following format: <strong style={{ fontWeight: 'bold' }}>score / total points (mention)</strong> For example: 60 / 70 (Pass)
    </>,
      open: false,
    },
    {
      id: 'staff-3',
      question: 'How do I add new student data?',
      answer: <>
        In the 'Add Data' page, this is the recommended process: 
        <ol> 
          <li> Add the new grade and families </li>
          <li> Upload students in bulk using template, making sure the family name is spelled correctly </li>
          <li> Update student information as they obtain leaps, combinations, marks, etc. through their profiles or in bulk</li>
          <li> Graduate all students from a grade with 'mark all students as graduated' button in Grade & Families view</li>
          <li> Alumni are encouraged to update their own further education or employment information in their profiles</li>
        </ol>
      </>,
      open: false,
    },
    {
      id: 'staff-7',
      question: 'How frequently should data be updated?',
      answer: <>
        It is recommended to update alumni/student data at least once per term or after significant follow-up activities.
      </>,
      open: false,
    },
    {
      id: 'staff-2',
      question: 'Where can I download excel of alumni/students?',
      answer: <>
        In alumni directory and current student directory, apply any filters and press 'download excel' to download 
        a spreadsheet of the filtered alumni/students. 
      </>,
      open: false,
    },
    
  ];

  const alumniFaqs = [
    {
      id: 'alumni-1',
      question: 'How do I contact CRC?',
      answer: 'Reach out via email to Julius: julius@asyv.org or Isaac: isaac@asyv.org .',
      open: false,
    },
    {
      id: 'alumni-2',
      question: 'How can I update my employment or education?',
      answer: 'Go to your profile and click the "Edit" button in Academic and Employment section.',
      open: false,
    },
  ];

  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    if (user) {
      setFaqs(user.is_staff ? staffFaqs : alumniFaqs);
    }
  }, [user]);

  const toggleFaq = (index) => {
    setFaqs((prevFaqs) =>
      prevFaqs.map((faq, i) => ({
        ...faq,
        open: i === index ? !faq.open : false,
      }))
    );
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
