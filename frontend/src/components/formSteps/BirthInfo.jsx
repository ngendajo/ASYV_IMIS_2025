import React from "react";
import { useState } from "react";

import ItemForm from "./ItemForm";
import DateItemInForm from "./DateItemInForm";

const BirthInfo = ({ setForm, formData, navigation }) => {
  const { date_of_birth, gender,father,mother,did_you_born_in_rwanda } = formData;

  const { next } = navigation;
 

  return (
    <div className="form">
      <h4>Birth Info</h4>
      <DateItemInForm className="label"
        label="Date of Birth"
        name="date_of_birth"
        value={date_of_birth}
        onChange={setForm}
      />
    
        <label className="label" htmlFor="gender">Gender</label>
        <select name="gender" value={gender} onChange={setForm}>
          <option value="Female">Female</option>
          <option value="Male">Male</option>
        </select>

    
   
        <label className="label" htmlFor="gender">Did you Born in Rwanda?</label>
        <select name="did_you_born_in_rwanda" value={did_you_born_in_rwanda} onChange={setForm}>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
  
      <div>
        <button className="next-btn" onClick={next}>Next</button>
      </div>
    </div>
  );
};

export default BirthInfo;
