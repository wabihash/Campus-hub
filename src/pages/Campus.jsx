import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosBase from "../AxiosConfig";
import { context } from "../context/DataContext"; 

import styles from "../styles/Campus.module.css";
export default function Campus() {
  const { token } = useContext(context);
  const [campuses, setCampuses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCampuses() {
      try {
        const res = await axiosBase.get("/campus", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCampuses(res.data.campus || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchCampuses();
  }, [token]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.heading}>🏫 Campus Locations</h2>
        <p className={styles.subHeading}>Select a campus to see localized discussions and help requests.</p>
      </header>

      <div className={styles.grid}>
        {campuses.map((campus) => (
          <div 
            key={campus.id} 
            className={styles.card} 
            onClick={() => navigate(`/campus/${campus.id}`)}
          >
            <div className={styles.cardContent}>
              <div className={styles.iconBadge}>📍</div>
              <h3>{campus.place_type}</h3>
              <p>{campus.description || "Explore facilities and updates for this location."}</p>
            </div>
            <div className={styles.cardFooter}>
              <span>View Questions →</span>
            </div>
          </div>
        ))}
      </div>
      
      {campuses.length === 0 && <p className={styles.empty}>No campus data found.</p>}
    </div>
  );
}