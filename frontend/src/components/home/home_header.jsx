import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../static/images/logo.png';
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import { AiOutlineTwitter } from 'react-icons/ai';
import { FaLinkedinIn, FaInstagram, FaFacebook } from 'react-icons/fa';
import '../../pages/home/Home.css';

export default function HomeHeader({ onLoginClick, currentPage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const toggleMenu = () => setMenuOpen(prev => !prev);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setMenuOpen(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="HomeHeader">
      <div className="HomeHeaderTopbar">
        <div className="HomeHeaderLeft">
          <img src={Logo} alt="ASYV Logo" />
          {!isMobile && <p>Agahozo-Shalom Youth Village Alumni Platform</p>}
        </div>

        {isMobile ? (
          <div className="HomeHeaderRightCompact">
            <button className="HomeHeaderLoginCompact" onClick={onLoginClick}>Login</button>
            <button className="HomeHeaderHamburger" onClick={toggleMenu}>
              {menuOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
            </button>
          </div>
        ) : (
          <div className="HomeHeaderRight">
            <div className="HomeHeaderMenu">
            <Link to="/home" className={currentPage === 'home' ? 'active' : ''}>Home</Link>
            <Link to="/news_and_events#top2" className={currentPage === 'news' ? 'active' : ''}>News & Events</Link>
            <Link to="/alumni_stories#top3" className={currentPage === 'alumni_stories' ? 'active' : ''}>Alumni Stories</Link>
            <a href="#contact" className={currentPage === 'contact' ? 'active' : ''}>Contact</a>
            </div>

            <div className="HomeHeaderLogin">
              <button onClick={onLoginClick}>Login</button>
            </div>
          </div>
        )}
      </div>

      {isMobile && menuOpen && (
        <div className="HomeHeaderDropdown">
          <Link to="/home" onClick={toggleMenu } className={currentPage === 'home' ? 'active' : ''}>Home</Link>
          <Link to="/news_and_events#top2" onClick={toggleMenu} className={currentPage === 'news' ? 'active' : ''}>News & Events</Link>
          <Link to="/alumni_stories#top3" onClick={toggleMenu} className={currentPage === 'alumini_stories' ? 'active' : ''}>Alumni Stories</Link>
          <a href="#contact" onClick={toggleMenu}>Contact</a>
        </div>
      )}
    </div>
  );
}
