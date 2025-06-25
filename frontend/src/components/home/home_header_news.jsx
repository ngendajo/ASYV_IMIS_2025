import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../static/images/logo.png';
// npm install react-icons
import { AiOutlineTwitter } from 'react-icons/ai';
import { FaLinkedinIn, FaInstagram, FaFacebook } from 'react-icons/fa';

export default function HomeHeader({onLoginClick}) {

    return (
        <div className="HomeHeader">
            <div className="HomeHeaderLeft">
                <img src={Logo} alt="ASYV Logo"/>
                <p>Agahozo-Shalom Youth Village Alumni Platform</p>
            </div>

            <div className="HomeHeaderRight">
                <div className="HomeHeaderMenu">
                    <Link to="/home#top1" >Home</Link>
                    <Link to="/news_and_events" className="active">News & Events</Link>
                    <Link to="/alumni_stories#top3">Alumni Stories</Link>
                    <a href="#contact">Contact</a>
                </div>
                <div className="HomeHeaderLogin">
                    <button onClick={onLoginClick}>Login</button>
                </div>

                <div className="HomeHeaderIcon">
                    <a href="https://www.instagram.com/agahozoshalom/"
                       target="_blank" rel="noopener noreferrer">
                       <FaInstagram className="OrangeIcon"/>
                    </a>
                    <a href="https:/twitter.com/asyv"
                       target="_blank" rel="noopener noreferrer">
                       <AiOutlineTwitter className="OrangeIcon"/>
                    </a>
                    <a href="https://www.facebook.com/AgahozoShalom/"
                       target="_blank" rel="noopener noreferrer">
                       <FaFacebook className="OrangeIcon"/>
                    </a>
                    <a href="https://www.linkedin.com/in/julius-kaboyo?originalSubdomain=rw"
                       target="_blank" rel="noopener noreferrer">
                       <FaLinkedinIn className="OrangeIcon"/>
                    </a>
                </div>
            </div>
        </div>
    );
}
