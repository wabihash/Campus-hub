import { useRef, useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosBase from "../AxiosConfig";
import { context } from "../context/DataContext"; 
import styles from "../styles/Register.module.css";
export default function Register() {
  const navigate = useNavigate();
  const { setUser, setToken, setRole } = useContext(context);

  const usernameRef = useRef();
  const firstnameRef = useRef();
  const lastnameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    if (!e.target.checkValidity()) {
      e.target.reportValidity();
      return;
    }

    const username = usernameRef.current.value.trim();
    const firstname = firstnameRef.current.value.trim();
    const lastname = lastnameRef.current.value.trim();
    const email = emailRef.current.value.trim();
    const password = passwordRef.current.value;

    try {
      await axiosBase.post("/users/register", {
        username,
        firstname,
        lastname,
        email,
        password,
      });

      const res = await axiosBase.post("/users/login", {
        identifier: username,
        password,
      });

      const { token, username: loggedUser, userid, role } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("userid", userid);
      localStorage.setItem("username", loggedUser);

      setUser(loggedUser);
      setToken(token);
      setRole(role);

      setMessage("Registration successful! Redirecting...");
      setIsError(false);

      setTimeout(() => navigate("/"), 800);
    } catch (error) {
      console.error(error.response || error);
      setMessage(
        error.response?.data?.message || "Registration failed. Please try again."
      );
      setIsError(true);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <form onSubmit={handleSubmit} noValidate>
          <h2>Create Account</h2>

          <div className={styles.inputGroup}>
            <input
              ref={usernameRef}
              className={styles.input}
              type="text"
              placeholder="Username"
              required
              pattern="^[a-zA-Z0-9_]{4,}$"
              title="Username must be at least 4 characters and contain only letters, numbers, or _"
              autoComplete="username"
            />
            <span className={styles.validationHint}>
              Min 4 characters (letters, numbers, _)
            </span>
          </div>

          <div className={styles.inputGroup}>
            <input
              ref={firstnameRef}
              className={styles.input}
              type="text"
              placeholder="First Name"
              required
              pattern="^[A-Za-z]{2,}$"
              title="First name must contain only letters (min 2)"
              autoComplete="given-name"
            />
            <span className={styles.validationHint}>
              Letters only, min 2 characters
            </span>
          </div>

          <div className={styles.inputGroup}>
            <input
              ref={lastnameRef}
              className={styles.input}
              type="text"
              placeholder="Last Name"
              required
              pattern="^[A-Za-z]{2,}$"
              title="Last name must contain only letters (min 2)"
              autoComplete="family-name"
            />
            <span className={styles.validationHint}>
              Letters only, min 2 characters
            </span>
          </div>

          <div className={styles.inputGroup}>
            <input
              ref={emailRef}
              className={styles.input}
              type="email"
              placeholder="Email"
              required
              autoComplete="email"
            />
            <span className={styles.validationHint}>
              Enter a valid email address
            </span>
          </div>

          <div className={styles.inputGroup}>
            <input
              ref={passwordRef}
              className={styles.input}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              pattern="^(?=.*[A-Za-z])(?=.*\d).{6,}$"
              title="Password must be at least 6 characters and contain letters and numbers"
              autoComplete="new-password"
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
            <span className={styles.validationHint}>
              Min 6 characters with letters and numbers
            </span>
          </div>

          <button className={styles.button} type="submit">
            Create Account
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
            Already have an account?{" "}
            <Link to="/login" className={styles.link}>
              Login here
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