import React from "react";
const Submit = ({ navigation }) => {
  const { go } = navigation;
  return (
    <div>
      <h3>Thank you for submitting. We will be in touch</h3>
      More EPs? {"->"} <button onClick={() => go("birthinfo")}>New</button>
    </div>
  );
};

export default Submit;
