import React, { useState , useEffect} from 'react';
import './DonationOptions.css';
import { jwtDecode } from 'jwt-decode';
import useAuth from "../../hooks/useAuth";
import baseUrl from '../../api/baseUrl';
import axios from '../../api/axios';
// Sample Data
const sampleMoMoCodes = [
];

const sampleDonations = [
  { id: 1, user: 'John Doe', amount: 50, momoCode: '123456', confirmed: true },
  { id: 2, user: 'Jane Smith', amount: 100, momoCode: '654321', confirmed: false }
];

const DonationOptions = () => {
  const { auth } = useAuth();
  const user = jwtDecode(auth.accessToken);
  const [momoCodes, setMomoCodes] = useState(sampleMoMoCodes);
  const [donations, setDonations] = useState(sampleDonations);

  const fetchMomos = async () => {
    try {
      const response = await axios.get(baseUrl + '/sampleMoMoCodes', {
        headers: {
          "Authorization": 'Bearer ' + String(auth.accessToken),
        },
      });
      setMomoCodes(response.data);
    } catch (err) {
      console.log(err);
    }
  };


  const fetchDonations = async () => {
    try {
      const response = await axios.get(baseUrl + '/sampleDonations/', {
        headers: {
          "Authorization": 'Bearer ' + String(auth.accessToken),
        },
      });
      setDonations(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchMomos();
    fetchDonations();
  }, [auth]);

  const handleAddMoMoCode = async (newCode) => {
    const newMoMoCode = { code: newCode };


    console.log("new momo", newMoMoCode);

    try {
      await axios.post(baseUrl + '/sampleMoMoCodes/', newMoMoCode, {
        headers: {
          "Authorization": 'Bearer ' + String(auth.accessToken),
        },
      });
     fetchMomos();
      console.log("momocode",momoCodes);
    } catch (err) {
      console.log(err.response);
    }
  };

  const handleEditMoMoCode = (id, newCode) => {
    setMomoCodes(momoCodes.map(code => code.id === id ? { ...code, code: newCode } : code));
  };

  // const handleDeleteMoMoCode = (id) => {
  //   setMomoCodes(momoCodes.filter(code => code.id !== id));
  // };

  const handleDeleteMoMoCode = async (id) => {
    try {
      await axios.delete(baseUrl + '/sampleMoMoCodes/' + id + '/', {
        headers: {
          "Authorization": 'Bearer ' + String(auth.accessToken),
          "Content-Type": 'application/json'
        }
      });
      fetchMomos();
      alert("Deleted successfully");
    } catch (err) {
      console.log(err.response);
    }
  };

  const handleDonate= async (code) => {
    const newDonation = {
      user: auth.user.id,
      amount: Math.floor(Math.random() * 100) + 1, // Random donation amount
      sampleMoMoCode: code.id,
      confirmed: false
    };

 
    try {
      await axios.post(baseUrl + '/sampleDonations/', newDonation, {
        headers: {
          "Authorization": 'Bearer ' + String(auth.accessToken),
        },
      });
     fetchDonations();
      console.log("donations",donations);
    } catch (err) {
      console.log(err.response);
    }

   
  };
  const getMomoCode = (momoId) => {
    const momoCode = momoCodes.find(m => m.id === momoId);
    console.log("momocode",momoCode)
    return momoCode ? momoCode.code : 'Unknown';
  };

  return (
    <div className="dona-wrapper">
      <div className="dona-heading">
        <div className="dona-title">Ways to back to ASYV!</div>
       
      </div>
      <div className="dona-text-container">
        {momoCodes.map(code => (
          <div key={code.id} className="momo-code-card">
            <p>MoMo Code: {code.code}</p>
            {user.crc_staff || user.is_superuser ? (
              <div className="momo-code-actions">
                <button onClick={() => handleEditMoMoCode(code.id, prompt('Enter new MoMo code', code.code))}>Edit</button>
                <button onClick={() => handleDeleteMoMoCode(code.id)}>Delete</button>
              </div>
            ) : (
              <button onClick={() => handleDonate(code)}>Donate via MoMo</button>
            )}
          </div>
        ))}
      </div>
      {user.crc_staff || user.is_superuser ? (
        <div className="add-momo-code">
          <button onClick={() => handleAddMoMoCode(prompt('Enter new MoMo code'))}>Add MoMo Code</button>
        </div>
      ) : null}
      {user.crc_staff || user.is_superuser ? (
        <div className="donations-list">
          <h2>Donations</h2>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Amount</th>
                <th>MoMo Code</th>
                <th>Confirmed</th>
              </tr>
            </thead>
            <tbody>
              {donations.map(donation => (
                <tr key={donation.id}>
                  <td>{donation.first_name}  {donation.last_name}</td>
                  <td>{donation.amount}</td>
                  <td>{getMomoCode(donation.sampleMoMoCode)}</td>
                  <td>{donation.confirmed ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="donations-status">
          <h2>My Donations</h2>
          <table>
            <thead>
              <tr>
                <th>Amount</th>
                <th>MoMo Code</th>
                <th>Confirmed</th>
              </tr>
            </thead>
            <tbody>
              {donations.filter(donation => donation.user === auth.user.id).map(donation => (
                <tr key={donation.id}>
                  <td>{donation.amount}</td>
                  <td>{getMomoCode(donation.sampleMoMoCode)}</td>
                  <td>{donation.confirmed ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DonationOptions;
