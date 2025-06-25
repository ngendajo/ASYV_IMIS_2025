import React, { useState, useEffect } from "react";
import axios from "axios";
import baseUrl from "../../api/baseUrl";
import useAuth from "../../hooks/useAuth";
import "./style.css";
import { sectorsByDistrict } from './DistrictData';
import { useNavigate } from "react-router-dom";

const Review = ({ formData, navigation }) => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [combinations, setCombinations] = useState([]);
  const [families, setFamilies] = useState([]);
  const [eps1, setEps1] = useState([]);

  const { user, date_of_birth, gender, father, mother, did_you_born_in_rwanda, place_of_birth_district_or_country, place_of_birth_sector_or_city, family, combination, eps, s4marks, s5marks, s6marks, ne, maxforne, decision, life_status, marital_status, currresidence_in_rwanda, currresidence_district_or_country, currresidence_sector_or_city, kids } = formData;

  const findDistrictBySector = (sectorName) => {
    for (const district in sectorsByDistrict) {
      if (sectorsByDistrict[district].includes(sectorName)) {
        return district;
      }
    }
    return null;
  };

  useEffect(() => {
    const getGrades = async () => {
      try {
        const response = await axios.get(baseUrl + '/families/', {
          headers: {
            "Authorization": 'Bearer ' + String(auth.accessToken),
            "Content-Type": 'multipart/form-data'
          },
          withCredentials: true
        });
        setFamilies(response.data);
      } catch (err) {
        console.log(err);
      }
    };
    getGrades();
  }, [auth]);

  useEffect(() => {
    const getEps = async () => {
      try {
        const response = await axios.get(baseUrl + '/ep/', {
          headers: {
            "Authorization": 'Bearer ' + String(auth.accessToken),
            "Content-Type": 'multipart/form-data'
          },
          withCredentials: true
        });
        setEps1(response.data);
      } catch (err) {
        console.log(err);
      }
    };
    getEps();
  }, [auth]);

  useEffect(() => {
    const getCombinations = async () => {
      try {
        const response = await axios.get(baseUrl + '/combination/', {
          headers: {
            "Authorization": 'Bearer ' + String(auth.accessToken),
            "Content-Type": 'multipart/form-data'
          },
          withCredentials: true
        });
        setCombinations(response.data);
      } catch (err) {
        console.log(err);
      }
    };
    getCombinations();
  }, [auth]);

  const { previous, go } = navigation;

  const handleSubmit = async (e) => {
    e.preventDefault();
    let ep_ids = [];
    ep_ids.push(eps);
    axios.post(baseUrl + '/alumni/info/', {
      "user": user,
      "date_of_birth": date_of_birth,
      "marital_status": (life_status.toLowerCase()) === "alive" ? marital_status : "Deceased",
      "gender": gender,
      "family": family,
      "combination": combination,
      "eps": ep_ids,
      "kids": kids === "Yes",
      "father": father.trim() === '' ? "NN" : father,
      "mother": mother.trim() === '' ? "NN" : mother,
      "did_you_born_in_rwanda": did_you_born_in_rwanda === "Yes",
      "place_of_birth_district_or_country": did_you_born_in_rwanda === "Yes" ? findDistrictBySector(place_of_birth_sector_or_city) : place_of_birth_district_or_country,
      "place_of_birth_sector_or_city": place_of_birth_sector_or_city,
      "currresidence_in_rwanda": (life_status.toLowerCase()) === "alive" ? currresidence_in_rwanda === "Yes" : "Deceased",
      "currresidence_district_or_country": (life_status.toLowerCase()) === "alive" ? currresidence_in_rwanda === "Yes" ? findDistrictBySector(currresidence_sector_or_city) : currresidence_district_or_country : "Deceased",
      "currresidence_sector_or_city": (life_status.toLowerCase()) === "alive" ? currresidence_sector_or_city : "Deceased",
      's4marks': s4marks,
      's5marks': s5marks,
      's6marks': s6marks,
      'ne': ne,
      'maxforne': maxforne,
      'decision': (decision.toLowerCase()) === "pass" ? "P" : "F",
      'life_status': (life_status.toLowerCase()) === "alive" ? 'A' : "D"
    },
      {
        headers: {
          "Authorization": 'Bearer ' + String(auth.accessToken),
          "Content-Type": 'application/json'
        }
      }
    )
      .then(res => {
        console.log(res.data.id);
        alert(" created successfully");
        if ((life_status.toLowerCase()) === "alive") {
          navigate(`/add-alumni/info/${user}/study`);
        } else {
          navigate(`/alumni`);
        }
      })
      .catch(error => console.log(error.response.data));
  };

  return (
    <div className="form">
      <h3>Review your data and submit</h3>
      <div className="review_data">
        <h4>Birth Information</h4>
        <div className="review_item">
          <span className="review_title">Date of Birth:</span> <span className="review_value">{date_of_birth}</span>
        </div>
        <div className="review_item">
          <span className="review_title">Gender:</span> <span className="review_value">{gender}</span>
        </div>
        <div className="review_item">
          <span className="review_title">Did you Born in Rwanda?</span> <span className="review_value">{did_you_born_in_rwanda}</span>
        </div>
        {did_you_born_in_rwanda === "Yes" ? (
          <>
            <div className="review_item">
              <span className="review_title">District:</span> <span className="review_value">{findDistrictBySector(place_of_birth_sector_or_city)}</span>
            </div>
            <div className="review_item">
              <span className="review_title">Sector:</span> <span className="review_value">{place_of_birth_sector_or_city}</span>
            </div>
          </>
        ) : (
          <>
            <div className="review_item">
              <span className="review_title">Country:</span> <span className="review_value">{place_of_birth_district_or_country}</span>
            </div>
            <div className="review_item">
              <span className="review_title">City:</span> <span className="review_value">{place_of_birth_sector_or_city}</span>
            </div>
          </>
        )}
        <h4>ASYV Information</h4>
        {families.map((e, ind) => e.id === family && (
          <React.Fragment key={ind}>
            <div className="review_item">
              <span className="review_title">Grade:</span> <span className="review_value">{e.grade_name}</span>
            </div>
            <div className="review_item">
              <span className="review_title">Family:</span> <span className="review_value">{e.family_name}</span>
            </div>
          </React.Fragment>
        ))}
        {combinations.map((e, ind) => e.id === combination && (
          <div className="review_item" key={ind}>
            <span className="review_title">Combination:</span> <span className="review_value">{e.combination_name}</span>
          </div>
        ))}
        {eps1.map((e, ind) => e.id === eps && (
          <div className="review_item" key={ind}>
            <span className="review_title">EP Done:</span> <span className="review_value">{e.title}</span>
          </div>
        ))}
        <div className="review_item">
          <span className="review_title">S4 Marks:</span> <span className="review_value">{s4marks}</span>
        </div>
        <div className="review_item">
          <span className="review_title">S5 Marks:</span> <span className="review_value">{s5marks}</span>
        </div>
        <div className="review_item">
          <span className="review_title">S6 Marks:</span> <span className="review_value">{s6marks}</span>
        </div>
        <div className="review_item">
          <span className="review_title">Maximum Aggregate:</span> <span className="review_value">{maxforne}</span>
        </div>
        <div className="review_item">
          <span className="review_title">National Exam:</span> <span className="review_value">{ne}</span>
        </div>
        <div className="review_item">
          <span className="review_title">Decision:</span> <span className="review_value">{decision}</span>
        </div>
        <h4>Current Residence Information</h4>
        <div className="review_item">
          <span className="review_title">Life Status:</span> <span className="review_value">{life_status}</span>
        </div>
        {life_status === "Alive" ? (
          <>
            <div className="review_item">
              <span className="review_title">Are you in Rwanda:</span> <span className="review_value">{currresidence_in_rwanda}</span>
            </div>
            {currresidence_in_rwanda === "Yes" ? (
              <>
                <div className="review_item">
                  <span className="review_title">District:</span> <span className="review_value">{findDistrictBySector(currresidence_sector_or_city)}</span>
                </div>
                <div className="review_item">
                  <span className="review_title">Sector:</span> <span className="review_value">{currresidence_sector_or_city}</span>
                </div>
              </>
            ) : (
              <>
                <div className="review_item">
                  <span className="review_title">Country:</span> <span className="review_value">{currresidence_district_or_country}</span>
                </div>
                <div className="review_item">
                  <span className="review_title">City:</span> <span className="review_value">{currresidence_sector_or_city}</span>
                </div>
              </>
            )}
            <div className="review_item">
              <span className="review_title">Marital Status:</span> <span className="review_value">{marital_status}</span>
            </div>
          </>
        ) : (
          <div className="review_item">
            <span className="review_title">Life Status:</span> <span className="review_value">Deceased</span>
          </div>
        )}
        <h4>Family Information</h4>
        <div className="review_item">
          <span className="review_title">Father:</span> <span className="review_value">{father}</span>
        </div>
        <div className="review_item">
          <span className="review_title">Mother:</span> <span className="review_value">{mother}</span>
        </div>
        <div className="review_item">
          <span className="review_title">Kids:</span> <span className="review_value">{kids}</span>
        </div>
      </div>
      <div className="btn">
        <button className="next-btn" onClick={() => previous()}>Previous</button>
        <button className="next-btn" onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
};

export default Review;
