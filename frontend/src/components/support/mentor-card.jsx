import { Link } from "react-router-dom";
import "./mentor-card.css";

const MentorCard = ({ title, type, description, date, location, onApply }) => {
    return (
      <div className="mentor-card">
        <div className="mentor-card-header">
          <p>{title}</p>
        </div>
        <p className="mentor-des">{description}</p>
        <p className="mentor-des">Location: {location}</p>
        <p className="apply-by">Apply by: {date}</p>
        <button onClick={onApply}>Apply</button>
      </div>
    );
  };
  
  export default MentorCard;