import { React, useState, useEffect } from "react"
import './Home.css'
import HomeHeader from '../../components/home/home_header'
import HomeBannerAlumni from '../../components/home/home_banner_alumni'
import { Alumni } from "../../components/home/home_alumni";
import HomeFooter from '../../components/home/home_footer'
import LoginPopUp from '../../components/home/login_pop_up'
import axios from "axios";
import placeholder1 from '../../static/images/gallery1.jpg'
import placeholder2 from '../../static/images/gallery2.jpg'
import placeholder3 from '../../static/images/gallery3.jpg'
import baseUrl from '../../api/baseUrl'
import useAuth from "../../hooks/useAuth";
import { useNavigate } from 'react-router-dom';

const AlumniStories = () => {

  const [showLogin, setShowLogin] = useState(false);
  const { auth } = useAuth();
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const placeholders = [placeholder1, placeholder2, placeholder3];
  const toggleLoginPopup = () => {
    setShowLogin(!showLogin);
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#top3') {
        const element = document.getElementById('top3');
        if (element) {
            element.scrollIntoView();
        }
    }
}, []);

useEffect(() =>{
    
  const getData = async () =>{
      try{
          const response = await axios.get(baseUrl+'/storyhomeview/',{
              headers: {
                  "Content-Type": 'multipart/form-data'
              },
              withCredentials:true
          });
          
          setData(response.data);
      }catch(err) {
          console.log(err);
      }
  }

  getData();

},[auth])
console.log("data", data)

const handleDetail = (data) => {
  navigate('/stories-detail', { state: { data } });
  console.log("stories: ", data);
};
const getPlaceholder = (index) => placeholders[index % placeholders.length];
  return (
    <div id="top3" className="page-content">
      {/* 1. header: */}
      <HomeHeader onLoginClick={toggleLoginPopup} currentPage="alumni_stories"/>

      {/* 2. banner: */}
      <HomeBannerAlumni/>

      {/* 3. alumni: */}
      <div className="cards">
        <div className="cards-wrapper">

        {data.map((story, index) => (
            story.displayed?
              <Alumni
              imgSrc={story.image || getPlaceholder(index)}
                  imgAlt="image1"
                  title={story.title}
                  description={story.first_name}
                  buttonText={story.buttonText}
                  link={() => handleDetail(story)}
              />
              : null
          ))
        }
            
            
        </div>
      </div>

      {/* 4. footer: */}
      <HomeFooter/>

      {/* 5. login: */}
      <LoginPopUp showLogin={showLogin} toggleLoginPopup={toggleLoginPopup}/>

    </div>
  );
};

export default AlumniStories;