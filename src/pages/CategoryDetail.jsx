import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import axiosBase from "../AxiosConfig";
import { context } from "../context/DataContext"; 
import styles from "../styles/CategoryDetail.module.css";
export default function CategoryDetail({ type }) {
  const { id } = useParams();
  const { token } = useContext(context);
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const endpoint = type === "campus" 
          ? `/questions/campus/${id}` 
          : `/questions/department/${id}`;

        const res = await axiosBase.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setQuestions(res.data.questions || []);
        setCategoryName(res.data.name || "Overview");
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, type, token]);

  if (loading) return <div className={styles.container}>Loading discussions...</div>;

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        ← Back to Browse
      </button>

      <div className={styles.headerCard}>
        <div className={styles.titleArea}>
          <h1>{categoryName}</h1>
          <p>Community discussions for this {type}</p>
        </div>
        <div className={styles.statsBadge}>
          <strong>{questions.length}</strong>
          <span>Questions</span>
        </div>
      </div>

      <div className={styles.questionList}>
        {questions.length === 0 ? (
          <div className={styles.empty}>
            <p>No questions found in this category.</p>
            <button className={styles.askNowBtn} onClick={() => navigate('/ask-question')}>
              Start the Conversation
            </button>
          </div>
        ) : (
          questions.map((q) => (
            <div 
              key={q.id} 
              className={styles.qCard} 
              onClick={() => navigate(`/question/${q.id}`)}
            >
              <h2 className={styles.qTitle}>{q.title}</h2>
              <p className={styles.qExcerpt}>
                {q.description.length > 150 
                  ? q.description.substring(0, 150) + "..." 
                  : q.description}
              </p>
              <div className={styles.qFooter}>
                <div className={styles.authorInfo}>
                  <div className={styles.avatar} style={{background: type === 'campus' ? '#2563eb' : '#10b981'}}>
                    {q.username?.charAt(0).toUpperCase()}
                  </div>
                  <span>{q.username}</span>
                </div>
                <span className={styles.time}>{q.time_ago}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}