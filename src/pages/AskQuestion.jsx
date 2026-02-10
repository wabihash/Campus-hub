
import { useEffect, useState, useContext } from "react";
import axiosBase from "../AxiosConfig";
import { context } from "../context/DataContext"; 
import styles from "../styles/AskQuestion.module.css";
export default function AskQuestion() {
  const { token } = useContext(context);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("");
  const [campus, setCampus] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [campuses, setCampuses] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    axiosBase.get("/campus")
      .then(res => setCampuses(res.data.campus || []))
      .catch(err => console.error(err));

    axiosBase.get("/departments")
      .then(res => setDepartments(res.data.departments || []))
      .catch(err => console.error(err));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title || !description) {
      setMessage("Title and description are required.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await axiosBase.post(
        "/questions/add",
        { title, description, tag, campus_id: campus || null, department_id: department || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setMessage("Question posted successfully!");
        setMessageType("success");
        setTitle("");
        setDescription("");
        setTag("");
        setCampus("");
        setDepartment("");
      } else {
        setMessage(res.data.message || "Failed to post question.");
        setMessageType("error");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error. Could not post question.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      {/* 📝 Guidelines Section */}
      <div className={styles.guidelines}>
        <h3>Steps to write a good question</h3>
        <ul>
          <li>Summarize your problem in a one-line title.</li>
          <li>Describe your problem in more detail (keep it 1-2 lines).</li>
          <li>Select the correct Campus locations and Department to reach the right people.</li>
          <li>Review your question and post it to the community.</li>
        </ul>
      </div>

      <h2 className={styles.heading}>Ask a Question</h2>

      {message && (
        <p className={messageType === "error" ? styles.errorMsg : styles.successMsg}>
          {message}
        </p>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Question title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.input}
        />

        <textarea
          placeholder="Describe your problem..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={styles.textarea}
        />

        <div className={styles.row}>
          <select value={campus} onChange={e => setCampus(e.target.value)} className={styles.select}>
            <option value="">Select Campus Locations</option>
            {campuses.map(c => <option key={c.id} value={c.id}>{c.place_type}</option>)}
          </select>

          <select value={department} onChange={e => setDepartment(e.target.value)} className={styles.select}>
            <option value="">Select Department</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        <input
          type="text"
          placeholder="Tags (e.g. #registration, #exam)"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className={styles.input}
        />

        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? "Posting..." : "Post Question"}
        </button>
      </form>
    </div>
  );
}