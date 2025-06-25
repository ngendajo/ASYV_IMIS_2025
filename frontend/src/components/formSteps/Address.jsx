import React from "react";

import ItemForm from "./ItemForm";

const Address = ({ setForm, formData, navigation }) => {
  const {life_status, currresidence_in_rwanda } = formData;

  const { previous, next,go } = navigation;

  if(life_status==="Alive"){
    return (
      <div className="form">
        <h3>Address</h3>
        
        <center>
          <label htmlFor="in_Rwanda">Do you live in Rwanda?</label>
          <select name="currresidence_in_rwanda" className='marks-group' value={currresidence_in_rwanda} onChange={setForm}>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </center>
        <div>
          <button className='next-btn' onClick={previous}>Previous</button>
          <button className='next-btn' onClick={next}>Next</button>
        </div>
      </div>
    );
  }else if(life_status==="Died"){
    
    go("review")
  }
};

export default Address;
