import React from 'react';
import Banner from '../../static/images/home-banner.jpg';
// height: 3600 * 1380

export default function HomeBanner() {

    return (
        <div className="HomeBanner">
            <img src={Banner} alt="All graduates"/>
            <div className="HomeBannerTitle">
                <p>Welcome to ASYV Alumni Platform</p>
            </div>
            <div className="HomeBannerText">
                <p>Explore the inspiring journeys of ASYV alumni, from global internships to community empowerment projects.<br />
                Connect, engage, and bring ASYV alumni to your community.</p>
            </div>
        </div>
    );
}
