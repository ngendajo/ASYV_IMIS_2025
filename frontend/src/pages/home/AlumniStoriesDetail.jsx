import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import baseUrlforImg from "../../api/baseUrlforImg";
import './AlumniStoriesDetail.css';

const StoryDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const storyDetail = location.state?.data;
  console.log("event: ", storyDetail);




  console.log("storyDetail:",storyDetail);

  return (
    <div className="story-wrapper">
      <div className="story-content">
        <div className="story-header">
          <div className="story-title">{storyDetail.title}</div>
          <div className="story-name">Name: {storyDetail.first_name}</div>
        </div>
        <div className="story-text-container">
          <p>{storyDetail.description}</p>
        </div>
      </div>
      <div className="story-poster">
        <img src={`${baseUrlforImg + storyDetail.image_url}`} alt="Event poster" />
      </div>
      <button onClick={() => navigate(-1)} className="story-back-button">Back &gt;</button>
     
    </div>
  );
};

export default StoryDetail;
