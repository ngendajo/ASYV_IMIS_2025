import React, { useEffect, useState } from "react";
import axios from "axios";
import baseUrl from "../../api/baseUrl";
import useAuth from "../../hooks/useAuth";

const RSVPList = ({ event_id }) => {
  const { auth } = useAuth();
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Fetching RSVPs for event_id:", event_id, "with accessToken:", !!auth.accessToken);
    if (!auth.accessToken || !event_id) {
      setLoading(false);
      return;
    }
    const fetchRSVPs = async () => {
      try {
        const res = await axios.get(`${baseUrl}/rsvps/?event=${event_id}`, {
          headers: { Authorization: `Bearer ${auth.accessToken}` },
        });
        console.log("Fetched RSVPs:", res.data);
        setRsvps(res.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching RSVPs:", error.response?.data || error.message);
        setError("Failed to load RSVPs");
      } finally {
        setLoading(false);
      }
    };
  
    fetchRSVPs();
  }, [auth.accessToken, event_id]);
  

  if (loading) return <div>Loading RSVPs...</div>;

  if (rsvps.length === 0) return <div>No RSVPs yet</div>;

  return (
    <div className="rsvp-list">
      <h4>RSVPed Alumni:</h4>
      <ul>
        {rsvps.map((rsvp) => (
          <li key={rsvp.id}>
            {rsvp.alumni?.first_name} {rsvp.alumni?.last_name} - {rsvp.response}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RSVPList;