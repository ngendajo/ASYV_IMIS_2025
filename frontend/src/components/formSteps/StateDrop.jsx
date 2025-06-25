import React from "react";

const states = [
  ["NSW", "New South Wales"],
  ["VIC", "Victoria"],
  ["WA", "Western Australia"]
];

const StateDrop = ({ label, ...others }) => (
  <center>
    <label>{label}</label>
    <select {...others}>
      {states.map(([value, name]) => (
        <option key={value} value={value}>{name}</option>
      ))}
    </select>
  </center>
);

export default StateDrop;
