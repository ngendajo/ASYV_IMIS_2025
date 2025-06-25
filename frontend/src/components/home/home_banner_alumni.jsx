import React from 'react';
import Banner from '../../static/images/alumni-banner.jpg';
// height: 3600 * 1440

export default function HomeBanner() {

    return (
        <div className="HomeBanner">
            <img src={Banner} alt="Graduates giving speech"/>
            <div className="HomeBannerTitle">
                <p>Alumni Stories</p>
            </div>
            <div className="HomeBannerText">
                <p>Explore the inspiring stories of ASYV alumni.<br />
                Learn about their journeys, successes, and contributions to their communities and beyond.</p>
            </div>
        </div>
    );
}
