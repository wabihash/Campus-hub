import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosBase from "../AxiosConfig";
import { context } from "../context/DataContext"; 

import styles from "../styles/Campus.module.css";
export default function Department() {
  const { token } = useContext(context);
  const [departments, setDepartments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const res = await axiosBase.get("/departments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDepartments(res.data.departments || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchDepartments();
  }, [token]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.heading}>🎓 Academic Departments</h2>
        <p className={styles.subHeading}>Browse questions organized by your specific field of study.</p>
      </header>

      <div className={styles.grid}>
        {departments.map((dept) => (
          <div 
            key={dept.id} 
            className={styles.card} 
            onClick={() => navigate(`/department/${dept.id}`)}
          >
            <div className={styles.cardContent}>
              <div className={styles.iconBadge} style={{background: '#dcfce7', color: '#166534'}}>📚</div>
              <h3>{dept.name}</h3>
              <p>{dept.description || "Discuss curriculum and projects with your peers."}</p>
            </div>
            <div className={styles.cardFooter}>
              <span style={{color: '#166534'}}>Browse Major →</span>
            </div>
          </div>
        ))}
      </div>

      {departments.length === 0 && <p className={styles.empty}>No departments found.</p>}
    </div>
  );
}