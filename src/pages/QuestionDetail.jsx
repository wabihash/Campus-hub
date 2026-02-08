import { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosBase from "../AxiosConfig";
import { context } from "../context/DataContext"; 
import styles from "../styles/QuestionDetail.module.css";
export default function QuestionDetail() {
  const { token, user } = useContext(context);
  const { id } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [loading, setLoading] = useState(true);

  // UI states
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Edit states
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const fetchAnswers = useCallback(async () => {
    try {
      const res = await axiosBase.get(`/answers/question/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnswers(res.data.answers || []);
    } catch (err) {
      console.error("Error fetching answers", err);
    }
  }, [id, token]);

  // --- RESTORED UPVOTE LOGIC ---
  const handleVote = async (answerId) => {
    try {
      await axiosBase.post(
        "/answers/vote",
        { answer_id: answerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh the answers to update the counts and colors
      fetchAnswers();
    } catch (err) {
      console.error("Voting failed", err);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const qRes = await axiosBase.get(`/questions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuestion(qRes.data.question);
        await fetchAnswers();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, token, fetchAnswers]);

  const postAnswer = async () => {
    if (!newAnswer.trim()) {
      setMessage("Answer cannot be empty");
      setMessageType("error");
      return;
    }
    await axiosBase.post(
      "/answers/add",
      { question_id: id, content: newAnswer },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setNewAnswer("");
    setMessage("Answer posted successfully");
    setMessageType("success");
    fetchAnswers();
    setTimeout(() => setMessage(""), 2500);
  };

  const handleDelete = async (answerId) => {
    await axiosBase.delete(`/answers/${answerId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setConfirmDeleteId(null);
    fetchAnswers();
    setMessage("Answer deleted");
    setMessageType("success");
    setTimeout(() => setMessage(""), 2500);
  };

  const handleUpdate = async (answerId) => {
    await axiosBase.put(
      `/answers/${answerId}`,
      { content: editContent },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setEditingId(null);
    fetchAnswers();
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (!question) return <div>Question not found</div>;

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* QUESTION SECTION */}
      <article className={styles.questionSection}>
        <h1 className={styles.title}>{question.title}</h1>
        <div className={styles.meta}>
          <div className={styles.userBadge}>
            <div className={styles.avatar}>
              {question.username?.charAt(0).toUpperCase()}
            </div>
            <span>{question.username}</span>
          </div>
          <span>{question.time_ago}</span>
        </div>
        <p className={styles.description}>{question.description}</p>
      </article>

      {/* ANSWER BOX */}
      <div className={styles.replyBox}>
        <h3>Your Answer</h3>
        <textarea
          className={styles.textarea}
          value={newAnswer}
          onChange={(e) => setNewAnswer(e.target.value)}
          placeholder="Write a helpful answer…"
        />
        <button className={styles.submitBtn} onClick={postAnswer}>
          Post Answer
        </button>
        {message && (
          <span className={messageType === "error" ? styles.errorMsg : styles.successMsg}>
            {message}
          </span>
        )}
      </div>

      <h3>{answers.length} Answers</h3>

      {/* ANSWERS LIST */}
      {answers.map((a) => (
        <div key={a.id} className={styles.answerCard}>
          {/* RESTORED VOTE SIDEBAR */}
          <div className={styles.voteBar}>
            <button 
              className={`${styles.voteBtn} ${a.user_voted ? styles.voted : ""}`}
              onClick={() => handleVote(a.id)}
            >
              ▲
            </button>
            <span className={styles.voteCount}>{a.vote_count || 0}</span>
          </div>

          <div className={styles.answerMain}>
            <div className={styles.answerHeader}>
              <div className={styles.smallAvatar}>
                {a.username?.charAt(0).toUpperCase()}
              </div>
              <strong>{a.username}</strong>
              <span className={styles.time}>{a.time_ago}</span>

              {user === a.username && (
                <div className={styles.actionBtns}>
                  <button className={styles.editBtn} onClick={() => {
                      setEditingId(a.id);
                      setEditContent(a.content);
                  }}>Edit</button>
                  <button className={styles.deleteBtn} onClick={() => setConfirmDeleteId(a.id)}>Delete</button>
                </div>
              )}
            </div>

            {editingId === a.id ? (
              <div className={styles.editWrapper}>
                <textarea
                  className={styles.editTextarea}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
                <div className={styles.editActions}>
                  <button className={styles.saveBtn} onClick={() => handleUpdate(a.id)}>Save</button>
                  <button className={styles.cancelBtn} onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <p className={styles.answerContent}>{a.content}</p>
            )}

            {confirmDeleteId === a.id && (
              <div className={styles.modalOverlay}>
                <div className={styles.modal}>
                  <h3>Delete Answer?</h3>
                  <p>This action cannot be undone.</p>
                  <div className={styles.modalActions}>
                    <button className={styles.confirmBtn} onClick={() => handleDelete(a.id)}>Delete</button>
                    <button className={styles.cancelBtn} onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}