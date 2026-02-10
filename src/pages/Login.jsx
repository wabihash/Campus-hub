import { useRef, useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosBase from "../AxiosConfig";
import { context } from "../context/DataContext"; 
import styles from "../styles/Login.module.css";
export default function Login() {
  const navigate = useNavigate();
  const { setUser, setToken, setRole } = useContext(context); 

  const identifierRef = useRef();
  const passwordRef = useRef();

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const identifier = identifierRef.current.value.trim();
    const password = passwordRef.current.value;

    if (!identifier || !password) {
      setIsError(true);
      setMessage("Username/email and password are required");
      return;
    }

    try {
      const res = await axiosBase.post("/users/login", {
        identifier,
        password,
      });

      const { token, userid, username, role } = res.data;

      // ✅ store session info
      localStorage.setItem("token", token);
      localStorage.setItem("userid", userid);
      if (username) localStorage.setItem("username", username);

      // ✅ update context immediately
      setUser(username);
      setToken(token);
      setRole(role);

      setIsError(false);
      setMessage("Login successful");

      navigate("/");
    } catch (err) {
      setIsError(true);
      setMessage(err?.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <form onSubmit={handleSubmit}>
          <h2>Welcome Back</h2>

          <div className={styles.inputGroup}>
            <input
              ref={identifierRef}
              className={styles.input}
              placeholder="Username or Email"
              required
              autoComplete="username"
            />
          </div>

          <div className={styles.inputGroup}>
            <input
              ref={passwordRef}
              className={styles.input}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c4.756 0 8.774-3.162 10.065-7.5.19-.563.19-1.185 0-1.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}
            </button>
          </div>

          <p className={styles.forgotRow}>
            <Link to="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
          </p>

          <button className={styles.button} type="submit">
            Sign In
          </button>

          {message && (
            <div
              className={styles.result}
              style={{
                background: isError ? "#fee2e2" : "#e0e7ff",
                borderColor: isError ? "#fecaca" : "#c7d2fe",
                color: isError ? "#991b1b" : "#1e3a8a",
              }}
            >
              {message}
            </div>
          )}

          <p className={styles.linkText}>
            Don't have an account?{" "}
            <Link to="/register" className={styles.link}>
              Create an account
            </Link>
          </p>
        </form>
      </div>
      <div className={styles.aboutSection}>
        <h3>About Campus Hub</h3>
        <p>
          Campus Hub is an online university forum designed to strengthen communication
          and collaboration among students. The platform allows students to ask academic
          and campus-related questions, while senior students and peers provide answers
          based on experience. Regardless of academic stage, every student can contribute
          information, share knowledge, and seek help. Campus Hub promotes peer learning,
          community engagement, and easy access to campus-related information.
        </p>
      </div>
    </div>
  );
}