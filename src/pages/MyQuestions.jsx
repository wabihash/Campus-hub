import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import axiosBase from "../AxiosConfig";
import { context } from "../context/DataContext"; 
import styles from "../styles/MyQuestions.module.css";
export default function MyQuestions() {
  const { token } = useContext(context);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "" });

  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState({ show: false, msg: "", type: "" });

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "" }), 3000);
  };

  const fetchMyQuestions = async () => {
    try {
      const res = await axiosBase.get("/questions/my-questions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuestions(res.data.questions || []);
    } catch {
      showToast("Failed to load questions", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchMyQuestions();
  }, [token]);

  const handleEditInit = (q) => {
    setEditingId(q.id);
    setEditForm({ title: q.title, description: q.description });
  };

  const handleUpdate = async (id) => {
    try {
      await axiosBase.put(`/questions/${id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingId(null);
      showToast("Question updated");
      fetchMyQuestions();
    } catch {
      showToast("Update failed", "error");
    }
  };

  const confirmDelete = async () => {
    try {
      await axiosBase.delete(`/questions/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuestions(questions.filter((q) => q.id !== deleteId));
      showToast("Question deleted");
    } catch {
      showToast("Delete failed", "error");
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) return <div className={styles.loader}>Loading dashboard...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>My Questions</h2>
        <p>Manage and update what you've asked</p>
      </header>

      {questions.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🔍</div>
          <h3>No questions yet</h3>
          <p>It looks like you haven't asked anything on Campus Hub yet.</p>
          <Link to="/ask-question" className={styles.emptyBtn}>
            Ask your first question
          </Link>
        </div>
      ) : (
        questions.map((q) => (
          <div key={q.id} className={styles.card}>
            {editingId === q.id ? (
              <div className={styles.editInterface}>
                <input
                  className={styles.editInput}
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                />
                <textarea
                  className={styles.editTextarea}
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                />
                <div className={styles.editActions}>
                  <button
                    className={styles.saveBtn}
                    onClick={() => handleUpdate(q.id)}
                  >
                    Save
                  </button>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.content}>
                  <Link to={`/question/${q.id}`} className={styles.qTitle}>
                    {q.title}
                  </Link>
                  <p className={styles.qDesc}>
                    {q.description.length > 140
                      ? q.description.slice(0, 140) + "..."
                      : q.description}
                  </p>
                  <div className={styles.qMeta}>
                    {/* Updated this span to be a Link */}
                    <Link to={`/question/${q.id}`} className={styles.ansLink}>
                      <span>💬 {q.answer_count || 0} answers</span>
                    </Link>
                    <span>
                      📅 {new Date(q.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className={styles.sideActions}>
                  <button
                    className={styles.editBtn}
                    onClick={() => handleEditInit(q)}
                  >
                    Edit
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => setDeleteId(q.id)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))
      )}

      {/* DELETE MODAL */}
      {deleteId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Delete Question?</h3>
            <p>This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <button className={styles.confirmBtn} onClick={confirmDelete}>
                Delete
              </button>
              <button
                className={styles.cancelBtn}
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast.show && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}