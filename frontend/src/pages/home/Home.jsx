import { React, useState, useEffect } from "react"
import { Link } from 'react-router-dom';
import './Home.css'
import HomeHeader from '../../components/home/home_header'
import HomeBanner from '../../components/home/home_banner'
import GalleryCarousel from "../../components/home/home_gallery"
import GenderChart from '../../components/home/home_gender'
import CombinationChart from '../../components/home/home_combination'
import { News } from "../../components/home/home_news"
import { Alumni } from "../../components/home/home_alumni"
import HomeFooter from '../../components/home/home_footer'
import LoginPopUp from '../../components/home/login_pop_up'

import placeholder1 from '../../static/images/gallery1.jpg'
import placeholder2 from '../../static/images/gallery2.jpg'
import placeholder3 from '../../static/images/gallery3.jpg'

import baseUrl from '../../api/baseUrl'

export default function Home() {

    const [combination, setCombination] = useState([]);

    useEffect(() => {
        const fetchCombinationData = async () => {
          try {
            const response = await fetch(baseUrl+'/alumnitotalbycombination/');
            const data = await response.json();
            setCombination(data);
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        };
    
        fetchCombinationData();
      }, []);
      console.log(combination);
    
    // total for gender
    const totalG = combination.reduce(
        (acc, item) => {
            acc.male += item.male;
            acc.female += item.female;
            return acc;
        },
        { male: 0, female: 0 }
    );
    
    // total for combination
    const totalC = combination.reduce(
        (acc, item) => {
            acc[item.combination_name] = item.total;
            return acc;
        },
        {}
    );

    const [showLogin, setShowLogin] = useState(false);

    const toggleLoginPopup = () => {
        setShowLogin(!showLogin);
    };

    useEffect(() => {
        const hash = window.location.hash;
        if (hash === '#top1') {
            const element = document.getElementById('top1');
            if (element) {
                element.scrollIntoView();
            }
        }
    }, []);

    return (
    <div id="top1" className="page-content">
        {/* 1. header: */}
        <HomeHeader onLoginClick={toggleLoginPopup} currentPage="home"/>
        
        {/* 2. banner: */}
        <HomeBanner/>
        
        {/* 3. gallery: */}
        <div className="gallery container flex-col center">
        <GalleryCarousel />
        <div className="GalleryText flex-col center">
            <p>
            At <span className="GalleryBold">Liquidnet Family High School</span>, education extends beyond graduation.
            LFHS provides alumni with programs and resources to support them at every stage of their careers.
            </p>
            <a href="https://www.asyv.org/our-alumni" target="_blank" rel="noopener noreferrer">
            <button className="LearnMoreButton">Learn More</button>
            </a>
        </div>
        </div>
        
        {/* 4. gender: */}
        {/* 5. combination: */}
        <div className="charts container flex-col center">
        <GenderChart females={totalG.female} males={totalG.male} />
        <CombinationChart data={totalC} />
        <div className="Mission">
            <p>
            Through healing, education, and love, the Agahozo-Shalom Youth Village empowers orphaned and vulnerable Rwandan youth to build lives of dignity and contribute to a better world.
            </p>
        </div>
        </div>

        {/* 6. news: */}
        <div className="cards">
            <section className="cards-title">
                <h1>News & Events</h1>
                <p>Stay Updated with the Latest News and Upcoming Events</p>
            </section>
            <div className="cards-wrapper">
                <News
                    imgSrc={placeholder1}
                    imgAlt="image1"
                    description="Honoring the 30th Commemoration of the 1994 Genocide Against the Tutsi"
                    date="Apr 30, 2024"
                    link="card1"
                />
                <News
                    imgSrc={placeholder2}
                    imgAlt="image2"
                    description="On the 10th Anniversary of Anne Heyman's Passing"
                    date="Jan 31, 2024"
                    link="card2"
                />
                <News
                    imgSrc={placeholder3}
                    imgAlt="image3"
                    description="An ASYV Kid Launches Rwanda's First Sign Language Club"
                    date="Feb 29, 2024"
                    link="card3"
                />
            </div>
            <div className="view-button-news">
                <Link to="/news_and_events#top2" className="ViewMore">View More</Link>
            </div>
        </div>

        {/* 7. alumni: */}
        <div className="cards">
            <section className="cards-title">
                <h1>Alumni Stories</h1>
                <p>Discover the Inspiring Journeys of Our Alumni</p>
            </section>
            <div className="cards-wrapper">
                <Alumni
                    imgSrc={placeholder1}
                    imgAlt="image1"
                    title="A Story of Transformation"
                    description="Salem Isezerano '23"
                    buttonText="READ MORE"
                    link="card1"
                />
                <Alumni
                    imgSrc={placeholder2}
                    imgAlt="image2"
                    title="Anne's Vision for Me, and All of Rwanda"
                    description="Emmanuel Nkundunkundiye '12"
                    buttonText="READ MORE"
                    link="card2"
                />
                <Alumni
                    imgSrc={placeholder3}
                    imgAlt="image3"
                    title="What ASYV Means to Me"
                    description="Pacifique Rutamu '13"
                    buttonText="READ MORE"
                    link="card3"
                />
            </div>
            <div className="view-button-alumni">
                <Link to="/alumni_stories#top3" className="ViewMore">View More</Link>
            </div>
        </div>

        {/* 8. footer: */}
        <HomeFooter/>

        {/* 9. login: */}
        <LoginPopUp showLogin={showLogin} toggleLoginPopup={toggleLoginPopup}/>
        
    </div>
  )
}