import React from 'react';
import Charity from '../../static/images/charity.png';
import Candid from '../../static/images/candid.jpeg';
// npm install react-icons
import { AiOutlineTwitter } from 'react-icons/ai';
import { FaLinkedinIn, FaInstagram, FaFacebook } from 'react-icons/fa';

export default function HomeFooter() {

    return (
        <div className="HomeFooter" id="contact">

            <div className="HomeFooterLeft">

                <div className="HomeFooterAddress">
                    <p className="HomeFooterText">
                        <span className="HomeFooterBold">Mailing Address -</span><br />
                        Agahozo-Shalom Youth Village<br />
                        P.O. Box 7299<br />
                        Kigali, Rwanda<br /><br />
                        <span className="HomeFooterBold">Visiting Address -</span><br />
                        Agahozo-Shalom Youth Village<br />
                        Rwamagana District, Rubona Sector, Rwanda<br />
                        <span className="HomeFooterBold">Email: </span>lnfhs@asyv.org
                    </p>
                </div>
                
                <div className="HomeFooterContact">
                    <p className="HomeFooterText">
                        <span className="HomeFooterBold">U.S. Office -</span><br />
                        234 5th Avenue<br />
                        2nd Floor, Suite 209<br />
                        New York, NY 10001<br /><br />
                        <span className="HomeFooterBold">Phone: </span>+250 73691194<br />
                        <span className="HomeFooterBold">Email: </span>julius@asyv.org
                    </p>
                    <div className="HomeFooterIcon">
                        <a href="https://www.instagram.com/agahozoshalom/"
                            target="_blank" rel="noopener noreferrer">
                            <FaInstagram className="WhiteIcon" />
                        </a>
                        <a href="https:/twitter.com/asyv"
                            target="_blank" rel="noopener noreferrer">
                            <AiOutlineTwitter className="WhiteIcon" />
                        </a>
                        <a href="https://www.facebook.com/AgahozoShalom/"
                            target="_blank" rel="noopener noreferrer">
                            <FaFacebook className="WhiteIcon" />
                        </a>
                        <a href="https://www.linkedin.com/in/julius-kaboyo?originalSubdomain=rw"
                            target="_blank" rel="noopener noreferrer">
                            <FaLinkedinIn className="WhiteIcon" />
                        </a>
                    </div>
                </div>
            </div>
            
            <div className="HomeFooterRight">
                <a href="https://www.charitynavigator.org/ein/273530769" target="_blank" rel="noopener noreferrer">
                    <img src={Charity} alt="Charity Navigator" />
                </a>
                <a href="https://www.guidestar.org/profile/27-3530769" target="_blank" rel="noopener noreferrer">
                    <img src={Candid} alt="Platinum Transparency 2023 Candid" />
                </a>
            </div>
        </div>
    );
}
