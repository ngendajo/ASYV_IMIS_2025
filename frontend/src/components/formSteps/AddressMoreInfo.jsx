import React , { useEffect,useState } from 'react';
import ItemForm from "./ItemForm";
import { districts, sectorsByDistrict } from './DistrictData';

const AddressMoreInfo = ({ setForm, formData, navigation }) => {
  const { marital_status,currresidence_in_rwanda, currresidence_district_or_country, currresidence_sector_or_city,kids } = formData;

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
        if (d === currresidence_district_or_country) {
          setSelectedDistrict(d);
        }
      });
    }, [currresidence_district_or_country]);
    useEffect(() => {
      districts.forEach((district) => {
        if(sectorsByDistrict[district].length>0){
          sectorsByDistrict[district].forEach((sect)=>{
            if (sect === currresidence_sector_or_city) {
              setSelectedSector(sect);
            }
          })
        }
        
      });
    }, [currresidence_sector_or_city]);
  
    return (
        <div className="form">
          <h4>Address More Info</h4>
          
          <center>
            <label htmlFor="marital_status">Marital Status</label>
            <select className='marks-group' name="marital_status" value={marital_status} onChange={setForm}>
              <option value="Single">Single</option>
              <option value="Maried">Maried</option>
              <option value="Widow">Widow</option>
              <option value="Widower">Widower</option>
              <option value="Divorced">Divorced</option>
              <option value="Cohabiting">Cohabiting</option>
            </select>
          </center>
          {currresidence_in_rwanda=="Yes"?
            <>
              <center>
                <label htmlFor="districtSelect">District</label>
                <select id="districtSelect" className='marks-group' name="currresidence_district_or_country" value={selectedDistrict}  onChange={handleDistrictChange}>
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
                  <select id="sectorSelect" className='marks-group' name="currresidence_sector_or_city" value={selectedSector} onChange={setForm}>
                    <option value="">Select a Sector</option>
                    {sectorsByDistrict[selectedDistrict].map((sector) => (
                      <option key={sector} value={sector}>
                        {sector}
                      </option>
                    ))}
                  </select>
                  </center>
              )}
            </>:
            <>
              <ItemForm label="Country" className='marks-group'name="currresidence_district_or_country" value={currresidence_district_or_country} onChange={setForm} />
              <ItemForm label="City" className='marks-group'name="currresidence_sector_or_city" value={currresidence_sector_or_city} onChange={setForm} />
            </>
          }
          
          <center>
            <label className='marks-group' htmlFor="kids">Do you have Kids?</label>
            <select name="kids" value={kids} onChange={setForm}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </center>
          <div>
            <button  className='next-btn' onClick={previous}>Previous</button>
            <button className='next-btn' onClick={next}>Next</button>
          </div>
        </div>
      );
  
};

export default AddressMoreInfo;
