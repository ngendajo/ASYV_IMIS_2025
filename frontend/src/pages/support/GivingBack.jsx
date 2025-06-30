import React from 'react';
import './GivingBack.css';
//import givingBackPhoto from '../../assets/images/alumni-giving-back.jpg'; // Update path as needed

const GivingBack = () => {
  return (
    <div className="giving-back-page container">
      {/* <img src={givingBackPhoto} alt="Alumni Giving Back Launch" className="giving-photo" /> */}

      <h1 className="giving-title">The Alumni Giving Back Initiative, by and for alumni of ASYV</h1>
      <h2 className="giving-subtitle">It’s time to give back to the home that shaped who we are today</h2>

      <p>
        The Alumni Giving Back Initiative is a mission to support The Village and ensure it continues for years to come. 
        We alumni received love, education and hope for the future during our four years at ASYV. Now, many of us have 
        found jobs, started families, and achieved some of our biggest dreams. It’s our time to pay it forward by 
        contributing to making our home better and serving other vulnerable youth.
      </p>

      <h3>Our Mission</h3>
      <ul>
        <li>Make ASYV alumni part of the donors of ASYV</li>
        <li>Ensure ASYV’s perpetual existence</li>
        <li>Cultivate a culture of giving back</li>
        <li>Have 20% of ASYV’s budget come from alumni within 30 years</li>
        <li>Acknowledge and fulfill Anne Heyman’s vision</li>
      </ul>

      <h3>Progress So Far</h3>
      <ul>
        <li><strong>13.6 million francs</strong> raised (as of May 2025)</li>
        <li><strong>20 million francs</strong>: Target by end of the year</li>
        <li><strong>100 million francs</strong> projected in five years</li>
      </ul>

      <h3>What If?</h3>
      <p>
        With 1,400 alumni of whom 79% are employed:
      </p>
      <ul>
        <li>20% donate $500/year</li>
        <li>20% donate $100/year</li>
        <li>60% donate $50/year</li>
      </ul>
      <p>
        That would raise <strong>$188,500 in one year</strong> or <strong>$924,500 in five years</strong>, 
        making up 15% of ASYV’s annual budget!
      </p>

      <div className="cta-section">
        <p className="cta-text">
          To meet our goal, we need the support of the entire alumni community. Will you join us?
        </p>
        <button className="donate-button">DONATE NOW</button>
        <p className="contact-info">
          To contribute or for clarifications, contact <strong>Gilbert Musonera, Alumni Guild VP</strong>: 0785093107
        </p>
      </div>

      <h3>How It Works</h3>
      <ul>
        <li>The Alumni Giving Back Committee will control how funds are used</li>
        <li>They will align with ASYV management on annual needs or endowment planning</li>
        <li>They’ll decide on alumni support: who, how, and in what form</li>
      </ul>

      <h3>Timeline</h3>
      <ul>
        <li><strong>Up to Aug 31, 2025:</strong> Launch & awareness</li>
        <li><strong>Sept 1–10:</strong> Needs discussion with leadership</li>
        <li><strong>Sept 11–20:</strong> Committee evaluates projects</li>
        <li><strong>Oct 1–15:</strong> Project launch</li>
        <li><strong>Jan–Aug 2026:</strong> Scale & monitor</li>
        <li><strong>2027–2028:</strong> Long-term sustainability plan</li>
      </ul>

      <h3>Looking Ahead</h3>
      <ul>
        <li>If 20% donate $500 ➝ $444,000</li>
        <li>If 20% donate $200 ➝ $177,600</li>
        <li>If 60% donate $50 ➝ $132,400</li>
        <li>Total ➝ <strong>$754,000/year</strong> or <strong>$3.7M over five years</strong></li>
      </ul>

      <h3>Appreciation</h3>
      <p>
        Information on this page comes from the Alumni Giving Back Committee.
      </p>

      {/* Placeholder for team and photo gallery */}
      <div className="team-section">
        <h3>The Team</h3>
        <p>Add team photos and names here.</p>
      </div>
    </div>
  );
};

export default GivingBack;
