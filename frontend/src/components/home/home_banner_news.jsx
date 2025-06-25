import React from 'react';
import Banner from '../../static/images/news-banner.jpg';
// height: 3600 * 1440

export default function HomeBanner() {

    return (
        <div className="HomeBanner">
            <img src={Banner} alt="Students dancing"/>
            <div className="HomeBannerTitle">
                <p>News & Events</p>
            </div>
            <div className="HomeBannerText">
                <p>Stay updated with the latest news and events at ASYV.<br />
                Discover upcoming activities, achievements, and milestones that shape our community.</p>
            </div>
        </div>
    );
}
