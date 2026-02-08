import { useEffect, useState, useContext } from "react";
import { useNavigate} from "react-router-dom";
import axiosBase from "../AxiosConfig";
import { context } from "../context/DataContext"; 

import styles from "../styles/AdminDashboard.module.css";
export default function AdminDashboard() {
  const { token } = useContext(context);
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [locations, setLocations] = useState([]);
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [locationName, setLocationName] = useState("");
  const [deptName, setDeptName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingItem, setEditingItem] = useState({ id: null, type: "", value: "" });

  const fetchData = async (fetchAll = false) => {
    try {
      setLoading(true);
      
      const [qRes, lRes, dRes] = await Promise.all([
        axiosBase.get("/questions", { headers: { Authorization: `Bearer ${token}` } }),
        axiosBase.get("/campus"),
        axiosBase.get("/departments")
      ]);
      
      setLocations(lRes.data.campus || []);
      setDepts(dRes.data.departments || []);
      
      let allQuestions = qRes.data.questions || [];
      
      if (!fetchAll) {
        allQuestions = allQuestions.slice(0, 10);
      }
      
      setQuestions(allQuestions);
      
    } catch (err) {
      showStatus("error", "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => { 
  if (token) {
    fetchData(); 
  } else {
   
    navigate("/login"); 
  }
}, [token, navigate]); 

  const showStatus = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg({ type: "", text: "" }), 4000);
  };

  const handleAdd = async (e, type) => {
    e.preventDefault();
    const endpoint = type === "loc" ? "/campus/add" : "/departments/add";
    const name = type === "loc" ? locationName : deptName;
    
    if (!name.trim()) {
      showStatus("error", "Please enter a name");
      return;
    }
    
    const payload = type === "loc" ? { campus_name: name } : { department_name: name };
    
    try {
      await axiosBase.post(endpoint, payload, { headers: { Authorization: `Bearer ${token}` } });
      showStatus("success", `${type === "loc" ? "Location" : "Department"} added successfully!`);
      if (type === "loc") {
        setLocationName("");
      } else {
        setDeptName("");
      }
      fetchData(showAllQuestions);
    } catch (err) {
      showStatus("error", err.response?.data?.message || "Operation failed.");
    }
  };

  const handleUpdate = async () => {
    if (!editingItem.value.trim()) {
      setEditingItem({ id: null, type: "", value: "" });
      return;
    }
    
    const { id, type, value } = editingItem;
    const endpoint = type === "loc" ? `/campus/update/${id}` : `/departments/update/${id}`;
    const payload = type === "loc" ? { campus_name: value } : { department_name: value };

    try {
      await axiosBase.put(endpoint, payload, { headers: { Authorization: `Bearer ${token}` } });
      showStatus("success", `${type === "loc" ? "Location" : "Department"} updated!`);
      setEditingItem({ id: null, type: "", value: "" });
      fetchData(showAllQuestions);
    } catch (err) {
      showStatus("error", err.response?.data?.message || "Update failed.");
    }
  };

  const handleDelete = async (id, type) => {
    const endpoint = type === "loc" ? `/campus/delete/${id}` : `/departments/delete/${id}`;
    
    try {
      await axiosBase.delete(endpoint, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      showStatus("success", `${type === "loc" ? "Location" : "Department"} deleted!`);
      fetchData(showAllQuestions);
    } catch (err) {
      showStatus("error", err.response?.data?.message || "Delete failed.");
    }
  };

  const confirmAdminDelete = async () => {
    try {
      await axiosBase.delete(`/questions/admin/delete/${deleteTarget.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showStatus("success", "Question removed.");
      fetchData(showAllQuestions);
    } catch (err) {
      showStatus("error", err.response?.data?.message || "Failed to delete question.");
    } finally {
      setDeleteTarget(null);
    }
  };

  const confirmDeleteItem = async () => {
    if (!deleteTarget) return;
    
    try {
      await handleDelete(deleteTarget.id, deleteTarget.type);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleLoadAllQuestions = async () => {
    try {
      await fetchData(true);
      setShowAllQuestions(true);
      showStatus("success", "Loaded all questions");
    } catch (err) {
      showStatus("error", "Failed to load all questions.");
    }
  };

  const handleShowRecentQuestions = async () => {
    try {
      await fetchData(false);
      setShowAllQuestions(false);
      setSearchTerm("");
      showStatus("success", "Showing recent questions");
    } catch (err) {
      showStatus("error", "Failed to load recent questions.");
    }
  };

  const handleSearchQuestions = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredQuestions = questions.filter((q) =>
    q.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuestionClick = (questionId) => {
    if (questionId) {
      navigate(`/question/${questionId}`);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  if (loading && questions.length === 0 && locations.length === 0 && depts.length === 0) {
    return (
      <div className={styles.loaderContainer}>
        <div className={styles.spinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      {/* Status Toast */}
      {statusMsg.text && (
        <div className={`${styles.statusToast} ${styles[statusMsg.type]}`}>
          <span>{statusMsg.type === 'success' ? '✓' : '✗'}</span>
          {statusMsg.text}
        </div>
      )}

      {/* Header */}
      <header className={styles.adminHeader}>
        <div className={styles.headerTop}>
          <div className={styles.headerLeft}>
            <h1>🛡️ Admin Dashboard</h1>
            <p>Manage locations, departments, and community questions</p>
          </div>
          <div className={styles.statsContainer}>
            <div className={styles.statsBadge}>{questions.length} Qs</div>
            <div className={styles.statsBadge}>{locations.length} Locations</div>
            <div className={styles.statsBadge}>{depts.length} Depts</div>
          </div>
        </div>
      </header>

      <div className={styles.mainContent}>
        {/* Management Section - Horizontal Layout on Desktop */}
        <section className={styles.managementGrid}>
          {/* Add New Forms - Side by Side on Desktop */}
          <div className={styles.addFormsRow}>
            <div className={styles.adminCard}>
              <h3>📍 Add New Location</h3>
              <form onSubmit={(e) => handleAdd(e, "loc")} className={styles.adminForm}>
                <input 
                  type="text" 
                  placeholder="Enter location name" 
                  value={locationName} 
                  onChange={(e) => setLocationName(e.target.value)} 
                  required 
                />
                <button type="submit" className={styles.addBtn}>
                  Add Location
                </button>
              </form>
            </div>

            <div className={styles.adminCard}>
              <h3>📚 Add New Department</h3>
              <form onSubmit={(e) => handleAdd(e, "dept")} className={styles.adminForm}>
                <input 
                  type="text" 
                  placeholder="Enter department name" 
                  value={deptName} 
                  onChange={(e) => setDeptName(e.target.value)} 
                  required 
                />
                <button type="submit" className={styles.addBtn}>
                  Add Department
                </button>
              </form>
            </div>
          </div>

          {/* Management Lists - Side by Side on Desktop */}
          <div className={styles.managementListsRow}>
            <div className={styles.listCard}>
              <div className={styles.cardHeader}>
                <h3>📍 Locations</h3>
                <span className={styles.count}>{locations.length}</span>
              </div>
              <div className={styles.itemScrollList}>
                {locations.map((loc) => (
                  <div key={`loc-${loc.id}`} className={styles.listItem}>
                    {editingItem.id === loc.id && editingItem.type === "loc" ? (
                      <input 
                        autoFocus
                        value={editingItem.value} 
                        onChange={(e) => setEditingItem({...editingItem, value: e.target.value})}
                        onBlur={handleUpdate}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                        placeholder="Location name"
                      />
                    ) : (
                      <>
                        <span title={loc.place_type}>{loc.place_type}</span>
                        <div className={styles.listItemActions}>
                          <button 
                            className={styles.editBtn}
                            onClick={() => setEditingItem({
                              id: loc.id, 
                              type: "loc", 
                              value: loc.place_type
                            })}
                          >
                            Edit
                          </button>
                          <button 
                            className={styles.deleteBtnSmall}
                            onClick={() => setDeleteTarget({
                              id: loc.id,
                              type: "loc",
                              name: loc.place_type
                            })}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {locations.length === 0 && (
                  <div className={styles.listItem}>
                    <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                      No locations added yet
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.listCard}>
              <div className={styles.cardHeader}>
                <h3>📚 Departments</h3>
                <span className={styles.count}>{depts.length}</span>
              </div>
              <div className={styles.itemScrollList}>
                {depts.map((dept) => (
                  <div key={`dept-${dept.id}`} className={styles.listItem}>
                    {editingItem.id === dept.id && editingItem.type === "dept" ? (
                      <input 
                        autoFocus
                        value={editingItem.value} 
                        onChange={(e) => setEditingItem({...editingItem, value: e.target.value})}
                        onBlur={handleUpdate}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                        placeholder="Department name"
                      />
                    ) : (
                      <>
                        <span title={dept.name}>{dept.name}</span>
                        <div className={styles.listItemActions}>
                          <button 
                            className={styles.editBtn}
                            onClick={() => setEditingItem({
                              id: dept.id, 
                              type: "dept", 
                              value: dept.name
                            })}
                          >
                            Edit
                          </button>
                          <button 
                            className={styles.deleteBtnSmall}
                            onClick={() => setDeleteTarget({
                              id: dept.id,
                              type: "dept",
                              name: dept.name
                            })}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {depts.length === 0 && (
                  <div className={styles.listItem}>
                    <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                      No departments added yet
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Questions Section - Full width below */}
        <section className={styles.questionsSection}>
          <div className={styles.questionsHeader}>
            <div className={styles.headerTopRow}>
              <h2>
                {showAllQuestions ? "📋 All Questions" : "📋 Recent Questions"}
              </h2>
              <div className={styles.viewToggle}>
                <span className={styles.questionsCount}>
                  {filteredQuestions.length} of {questions.length}
                </span>
                {!showAllQuestions && questions.length > 10 ? (
                  <button
                    className={styles.viewAllBtn}
                    onClick={handleLoadAllQuestions}
                  >
                    View All Questions
                  </button>
                ) : showAllQuestions && (
                  <button
                    className={`${styles.viewAllBtn} ${styles.viewingAll}`}
                    onClick={handleShowRecentQuestions}
                  >
                    Show Recent Only
                  </button>
                )}
              </div>
            </div>
            
            {/* Search Section */}
            <div className={styles.searchContainer}>
              <div className={styles.searchTitle}>
                <span>🔍</span>
                <span>Search Questions</span>
              </div>
              <div className={styles.searchWrapper}>
                <input
                  type="text"
                  placeholder="Search by title, author, or content..."
                  className={styles.searchInput}
                  value={searchTerm}
                  onChange={handleSearchQuestions}
                />
                <div className={styles.searchIcon}>🔍</div>
              </div>
            </div>
          </div>

          {/* Questions Table */}
          <div className={styles.tableWrapper}>
            {loading ? (
              [1, 2, 3, 4].map((n) => (
                <div key={n} className={styles.skeletonCard}>
                  <div className={styles.skeletonTitle} />
                  <div className={styles.skeletonText} />
                  <div className={styles.skeletonFooter} />
                </div>
              ))
            ) : filteredQuestions.length === 0 ? (
              <div className={styles.emptySearch}>
                <div className={styles.emptySearchIcon}>
                  {searchTerm ? "🔍" : "📝"}
                </div>
                <h3>
                  {searchTerm 
                    ? `No results for "${searchTerm}"` 
                    : "No questions available"}
                </h3>
                <p>
                  {searchTerm
                    ? "Try a different search term or clear the search."
                    : "Questions will appear here once users start posting."}
                </p>
                {searchTerm && (
                  <button
                    className={styles.viewAllBtn}
                    onClick={clearSearch}
                    style={{ background: '#64748b' }}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th>Author</th>
                    <th>Question</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuestions.map((q) => {
                    const questionId = q.id || q.question_id;
                    return (
                      <tr key={`q-${questionId}`}>
                        <td>
                          <div 
                            className={styles.userCell}
                            onClick={() => handleQuestionClick(questionId)}
                          >
                            <div className={styles.avatar}>
                              {q.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <span>{q.username || 'Anonymous'}</span>
                          </div>
                        </td>
                        <td>
                          <div 
                            className={styles.titleCell}
                            onClick={() => handleQuestionClick(questionId)}
                            title={q.title}
                          >
                            {q.title}
                          </div>
                        </td>
                        <td>
                          {q.created_at 
                            ? new Date(q.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })
                            : 'N/A'}
                        </td>
                        <td>
                          <button 
                            className={styles.deleteBtn} 
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget({
                                id: questionId,
                                type: "question",
                                title: q.title
                              });
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.warningIcon}>⚠️</div>
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete "
              <strong>{deleteTarget.name || deleteTarget.title}</strong>"?
            </p>
            <small>
              This action cannot be undone.
            </small>
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelBtn} 
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button 
                className={styles.confirmBtn} 
                onClick={deleteTarget.type === "question" ? confirmAdminDelete : confirmDeleteItem}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}