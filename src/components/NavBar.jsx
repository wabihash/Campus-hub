import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { context }from "../context/DataContext"; 
import axiosBase from "../AxiosConfig";
import styles from "./NavBar.module.css";
export default function NavBar() {
  const { user, setUser, token, setToken, role } = useContext(context);
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [isWiggling, setIsWiggling] = useState(false);
  const prevCountRef = useRef(0);
  const audioRef = useRef(new Audio("/notify.mp3"));
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await axiosBase.get("/questions/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newNotifs = res.data.notifications || [];
      const newUnreadCount = newNotifs.filter((n) => !n.is_read).length;
      if (newUnreadCount > prevCountRef.current) {
        audioRef.current.play().catch(() => { });
        setIsWiggling(true);
        setTimeout(() => setIsWiggling(false), 600);
      }

      setNotifications(newNotifs);
      prevCountRef.current = newUnreadCount;
    } catch (err) {
      console.error(err);
    }
   useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [token]);
  }
  const handleToggleNotif = async () => {
    setShowNotif(!showNotif);
    if (!showNotif && prevCountRef.current > 0) {
      try {
        await axiosBase.put(
          "/questions/notifications/read",
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setNotifications(notifications.map((n) => ({ ...n, is_read: 1 })));
        prevCountRef.current = 0;
      } catch (err) {
        console.error(err);
      }
    }
  }
  const handleClearAllNotifications = async (e) => {
    e.stopPropagation();
    try {
      await axiosBase.delete("/questions/notifications/clear", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications([]);
      prevCountRef.current = 0;
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  };
   const handleMarkAsReadAndNavigate = async (n) => {
    try {
      // If it's unread, tell the backend
      if (!n.is_read) {
        await axiosBase.put(`/questions/notifications/${n.id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(notifications.map(item => 
          item.id === n.id ? { ...item, is_read: 1 } : item
        ));
        if (prevCountRef.current > 0) prevCountRef.current--;
      }
      // Navigate to the question and close dropdown
      setShowNotif(false);
      navigate(`/question/${n.question_id}`);
    } catch (err) {
      console.error(err);
    }
  };
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }, []);
  const handleBackdropClick = ()=> {
    setMenuOpen(false);
    setShowNotif(false);
  }
  const handleLogout = () => {
     setUser(null);
    setToken(null);
    localStorage.clear();
    navigate("/login");
  }

  return (
    <>
      <nav className={styles.navbar}>
        <h1 className={styles.logo} onClick={() => navigate("/")}>
          Campus Hub
        </h1>

        <div className={styles.hamburger} onClick={() => setOpen(!open)}>
          {open ? "✕" : "☰"}
        </div>

        <div className={`${styles.right} ${open ? styles.show : ""}`}>
          {/* Links */}
          {location.pathname !== "/" && (
            <Link to="/" className={styles.askBtn}>Home</Link>
          )}
          {location.pathname !== "/campus" && (
            <Link to="/campus" className={styles.askBtn}>Locations</Link>
          )}
          {location.pathname !== "/department" && (
            <Link to="/department" className={styles.askBtn}>Departments</Link>
          )}
          {location.pathname !== "/ask-question" && (
            <Link to="/ask-question" className={styles.askBtn}>Ask Question</Link>
          )}

          {/* Notification Bell */}
          <div className={styles.notifWrapper} ref={notifRef}>
            <div
              className={`${styles.bell} ${isWiggling ? styles.animateBell : ""}`}
              onClick={handleToggleNotif}
            >
              <svg className={styles.bellIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
              </svg>
              {prevCountRef.current > 0 && (
                <span className={styles.badge}>{prevCountRef.current}</span>
              )}
            </div>

            {showNotif && (
              <>
                <div 
                  className={styles.dropdownBackdrop}
                  onClick={handleBackdropClick}
                />
                <div className={styles.notifDropdown}>
                  <div className={styles.dragHandle} />
                  
                  <div className={styles.notifHeader}>
                    <div className={styles.notifTitle}>
                      <h3 className={styles.notifHeading}>Notifications</h3>
                      {prevCountRef.current > 0 && (
                        <span className={styles.unreadCount}>{prevCountRef.current} new</span>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <button
                        className={styles.clearAllBtn}
                        onClick={handleClearAllNotifications}
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className={styles.notifList}>
                    {notifications.length === 0 ? (
                      <div className={styles.emptyContainer}>
                        <div className={styles.emptyIconWrapper}>
                          <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                          </svg>
                        </div>
                        <p className={styles.emptyTitle}>No notifications</p>
                        <p className={styles.emptySubtitle}>
                          When you get notifications, they'll appear here
                        </p>
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n.id}
                          className={`${styles.notifItem} ${n.is_read ? styles.read : styles.unread}`}
                          onClick={() => handleMarkAsReadAndNavigate(n)}
                        >
                          <div className={styles.notifItemLeft}>
                            {!n.is_read && <div className={styles.notifDot}></div>}
                            <div className={styles.notifIcon}>
                              {n.type === 'answer' ? '💬' : n.type === 'like' ? '👍' : '📢'}
                            </div>
                          </div>
                          <div className={styles.notifContent}>
                            <p className={styles.notifMessage}>{n.message}</p>
                            <span className={styles.notifTime}>{n.created_at}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Avatar Dropdown */}
          <div className={styles.avatarWrapper} ref={dropdownRef}>
            <div
              className={styles.avatar}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {user?.charAt(0).toUpperCase()}
            </div>

            {menuOpen && (
              <>
                <div 
                  className={styles.dropdownBackdrop}
                  onClick={handleBackdropClick}
                />
                <div className={styles.menu}>
                  <div className={styles.dragHandle} />
                  
                  <div className={styles.profileHeader}>
                    <div className={styles.profileAvatar}>
                      {user?.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.profileInfo}>
                      <h3 className={styles.profileName}>{user}</h3>
                      <div className={styles.profileDetails}>
                        {role === "admin" && (
                          <span className={styles.adminBadge}>Admin</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={styles.menuItems}>
                    <Link 
                      to="/my-questions" 
                      className={styles.menuItem}
                      onClick={() => setMenuOpen(false)}
                    >
                      <svg className={styles.menuIcon} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
                      </svg>
                      My Questions
                    </Link>

                    {role === "admin" && (
                      <Link
                        to="/admin"
                        className={styles.menuItem}
                        onClick={() => setMenuOpen(false)}
                      >
                        <svg className={styles.menuIcon} viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                        </svg>
                        Admin Dashboard
                      </Link>
                    )}

                    <div className={styles.menuDivider}></div>

                    <button
                      className={styles.logoutBtn}
                      onClick={() => {
                        setMenuOpen(false);
                        setShowConfirm(true);
                      }}
                    >
                      <svg className={styles.menuIcon} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showConfirm && (
        <>
          <div
            className={styles.confirmationOverlay}
            onClick={() => setShowConfirm(false)}
          />
          <div className={styles.confirmationModal}>
            <div className={styles.confirmationModalIcon}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
            <h3 className={styles.confirmationModalTitle}>Log Out?</h3>
            <p className={styles.confirmationModalText}>
              You'll need to sign in again to access your account.
            </p>
            <div className={styles.confirmationModalActions}>
              <button
                className={styles.confirmationModalCancelBtn}
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                className={styles.confirmationModalConfirmBtn}
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}