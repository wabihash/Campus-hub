import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosBase from "../AxiosConfig";
import { context } from "../context/DataContext"; 
import styles from "../styles/Home.module.css";

export default function Home() {
  const { token, user } = useContext(context);
  const [questions, setQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Fetch initial questions (limited/recent)
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const response = await axiosBase.get("/questions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuestions(response.data.questions || []);
      } catch (err) {
        console.error("Failed to load questions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [token]);

  // Load all questions when user clicks "Show More"
  const handleLoadAllQuestions = async () => {
    try {
      const response = await axiosBase.get("/questions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuestions(response.data.questions || []);
      setShowAll(true);
    } catch (err) {
      console.error("Failed to load all questions:", err);
    }
  };

  // Filter based on search
  const filteredQuestions = questions.filter((q) =>
    q.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Decide how many to show
  const displayedQuestions = showAll
    ? filteredQuestions
    : filteredQuestions.slice(0, 5);

  return (
    <div className={`${styles.container} container`}>
      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Welcome{user ? `, ${user}` : ""}!</h1>
          <p>Join the conversation and find answers from your campus community.</p>

          <div className={styles.searchWrapper}>
            <input
              type="text"
              placeholder="Search questions..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Main layout – feed + sidebar */}
      <div className={styles.layout}>
        {/* Feed / Questions */}
        <main className={styles.feed}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {showAll ? "All Discussions" : "Recent Discussions"}
            </h2>
          </div>

          {loading ? (
            // Loading skeletons
            [1, 2, 3].map((n) => (
              <div key={n} className={styles.skeletonCard}>
                <div className={styles.skeletonTitle} />
                <div className={styles.skeletonText} />
                <div className={styles.skeletonFooter} />
              </div>
            ))
          ) : displayedQuestions.length === 0 ? (
            // Empty state
            <div className={styles.emptyCard}>
              <div className={styles.emptyIcon}>🔍</div>
              <h3>No results found</h3>
              <p>Try adjusting your search or post a new question.</p>
              <button
                className={styles.postBtn}
                onClick={() => navigate("/ask-question")}
              >
                Post a Question
              </button>
            </div>
          ) : (
            // Questions list
            displayedQuestions.map((q) => (
              <div
                key={q.id}
                className={styles.card}
                onClick={() => navigate(`/question/${q.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    navigate(`/question/${q.id}`);
                  }
                }}
              >
                <h3 className={styles.qTitle}>{q.title}</h3>
                <p className={styles.qDesc}>
                  {q.description
                    ? `${q.description.substring(0, 140)}${
                        q.description.length > 140 ? "..." : ""
                      }`
                    : "No description"}
                </p>

                <div className={styles.tags}>
                  {q.campus_name && (
                    <span className={styles.campusTag}>{q.campus_name}</span>
                  )}
                  {q.department_name && (
                    <span className={styles.deptTag}>{q.department_name}</span>
                  )}
                </div>

                <div className={styles.cardMeta}>
                  <div className={styles.userSection}>
                    <div className={styles.avatar}>
                      {q.username?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <span className={styles.userName}>{q.username || "Anonymous"}</span>
                  </div>
                  <span className={styles.time}>{q.time_ago || "—"}</span>
                </div>
              </div>
            ))
          )}

          {!showAll && questions.length > 5 && !loading && (
            <button
              className={styles.seeMoreBtn}
              onClick={handleLoadAllQuestions}
            >
              Show More Questions
            </button>
          )}
        </main>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.actionBlock}>
            <h3>Have a doubt?</h3>
            <button
              className={styles.sidebarBtn}
              onClick={() => navigate("/ask-question")}
            >
              Post a Question
            </button>
          </div>

          <div className={styles.navBlock}>
            <h4>Explore</h4>
            <Link to="/campus" className={styles.sideLink}>
              📍 Locations
            </Link>
            <Link to="/department" className={styles.sideLink}>
              🎓 Departments
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}