import React from "react";

const DateItemInForm = ({ label, children, type = "date", ...otherProps }) => (
  <div>
    {type === "text" ? (
      <>
        <label>{label}</label>
        <input type={type} {...otherProps} />
      </>
    ) : (
      <>
        <label>{label}</label>
        <input type={type} {...otherProps} />
        
      </>
    )}
  </div>
);

export default DateItemInForm;
