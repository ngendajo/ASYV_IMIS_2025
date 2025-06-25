import { React, useState, useEffect } from "react"
import './Home.css'
import HomeHeader from '../../components/home/home_header'
import HomeBannerNews from '../../components/home/home_banner_news'
import { News } from "../../components/home/home_news";
import HomeFooter from '../../components/home/home_footer'
import LoginPopUp from '../../components/home/login_pop_up'
import useAuth from "../../hooks/useAuth";
import baseUrl from "../../api/baseUrl";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";
import baseUrlforImg from "../../api/baseUrlforImg";

import placeholder1 from '../../static/images/gallery1.jpg'
import placeholder2 from '../../static/images/gallery2.jpg'
import placeholder3 from '../../static/images/gallery3.jpg'

const NewsEvents = () => {

  const [showLogin, setShowLogin] = useState(false);
  const [data, setData] = useState([]);
  const { auth } = useAuth();
  const navigate = useNavigate();
  //const placeholders = [placeholder1, placeholder2, placeholder3];

  const toggleLoginPopup = () => {
    setShowLogin(!showLogin);
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#top2') {
        const element = document.getElementById('top2');
        if (element) {
            element.scrollIntoView();
        }
    }
}, []);
useEffect(() =>{
    
  const getData = async () =>{
      try{
          const response = await axios.get(baseUrl+'/news/',{
              headers: {
                  "Content-Type": 'multipart/form-data'
              },
              withCredentials:true
          });
          console.log("response:",response.data);
          setData(response.data);
      }catch(err) {
          console.log(err);
      }
  }

  getData();

},[auth])

const handleDetail = (data) => {
  navigate('/stories-detail', { state: { data } });
  console.log("stories: ", data);
};

//const getPlaceholder = (index) => placeholders[index % placeholders.length];
console.log("data",data);
  return (
    <div id="top2" className="page-content">
      {/* 1. header: */}
      <HomeHeader onLoginClick={toggleLoginPopup} currentPage="news" />

      {/* 2. banner: */}
      <HomeBannerNews/>

      {/* 3. news: */}
      <div className="cards">
        <div className="cards-wrapper">
        
  {data.map((story) => (
                       story.pinned ?
                            <News
                                key={story.id}
                                imgSrc={`${baseUrlforImg + story.image_url}`}
                                imgAlt="image"
                                title={story.title}
                                date={story.date}
                                buttonText={story.buttonText}
                                link={() => handleDetail(story)}
                            />
                            : null
                    ))}
          
        </div>
      </div>
      
      {/* 4. footer: */}
      <HomeFooter/>

      {/* 5. login: */}
      <LoginPopUp showLogin={showLogin} toggleLoginPopup={toggleLoginPopup}/>
      
    </div>
  );
};

export default NewsEvents;