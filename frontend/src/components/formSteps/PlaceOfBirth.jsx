import React , { useEffect,useState } from 'react';

import ItemForm from "./ItemForm";
import { districts, sectorsByDistrict } from './DistrictData';

const PlaceBirth = ({ setForm, formData, navigation }) => {
  const { place_of_birth_district_or_country, place_of_birth_sector_or_city,did_you_born_in_rwanda } = formData;

  const { previous, next } = navigation;
  
    
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedSector, setSelectedSector] = useState("");

    const handleDistrictChange = (e) => {
      const district = e.target.value;
    
      // First, update the selected district
      setSelectedDistrict(district );
      
      // Reset the selected sector when the district changes
      setSelectedSector('');
    };
  
    useEffect(() => {
      districts.forEach((d) => {
        if (d === place_of_birth_district_or_country) {
          setSelectedDistrict(d);
        }
      });
    }, [place_of_birth_district_or_country]);
    useEffect(() => {
      districts.forEach((district) => {
        if(sectorsByDistrict[district].length>0){
          sectorsByDistrict[district].forEach((sect)=>{
            if (sect === place_of_birth_sector_or_city) {
              setSelectedSector(sect);
            }
          })
        }
        
      });
    }, [place_of_birth_sector_or_city]);

  if(did_you_born_in_rwanda==="Yes"){
    
    return (
        <div className="form">
          <h4>Place of Birth in Rwanda</h4>
          
        <center>
          <label htmlFor="districtSelect">District</label>
          <select id="districtSelect" name="place_of_birth_district_or_country" value={selectedDistrict}  onChange={handleDistrictChange}>
            <option value="">Select a District</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </center>

        {selectedDistrict && (
          <center>
            <label htmlFor="sectorSelect">Sector</label>
            <select id="sectorSelect" name="place_of_birth_sector_or_city" value={selectedSector} onChange={setForm}>
              <option value="">Select a Sector</option>
              {sectorsByDistrict[selectedDistrict].map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
            </center>
        )}
          <div>
            <button className='next-btn' onClick={previous}>Previous</button>
            <button className='next-btn'onClick={next}>Next</button>
          </div>
        </div>
      );
  }
  else{
    return (
        <div className="form">
          <h4>Place of Birth Abroad </h4>
          <ItemForm
            label="Country"
            name="place_of_birth_district_or_country"
            value={place_of_birth_district_or_country}
            onChange={setForm}
          />
          <ItemForm
            label="City"
            name="place_of_birth_sector_or_city"
            value={place_of_birth_sector_or_city}
            onChange={setForm}
          />
          
          <div>
            <button onClick={previous}>Previous</button>
            <button onClick={next}>Next</button>
          </div>
        </div>
      );
  }
};

export default PlaceBirth;
