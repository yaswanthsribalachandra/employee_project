import React, { useState } from "react";
import api from "../../services/api";
import { useNavigate, Navigate } from "react-router-dom";

const BASE_URL = api.defaults.baseURL;

export default function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 🔐 Prevent signup if already logged in
  const token = localStorage.getItem("token");
  if (token) {
    return <Navigate to="/home" replace />;
  }

  // Password validation
  const checks = {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const allValid = Object.values(checks).every(Boolean);

  // Strength
  const strengthScore = Object.values(checks).filter(Boolean).length;

  const getStrength = () => {
    if (strengthScore <= 1) return { text: "Weak", color: "red" };
    if (strengthScore <= 3) return { text: "Medium", color: "orange" };
    return { text: "Strong", color: "green" };
  };

  const strength = getStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!allValid) {
      alert("Password does not meet requirements!");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/createuser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Signup successful!");

        // 🔥 FIX: use navigate instead of window.location
        navigate("/signin", { replace: true });
      } else {
        alert(data.detail);
      }
    } catch (error) {
      console.error(error);
      alert("Server error!");
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Sign Up</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
          required
        />

        <div style={styles.passwordContainer}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <span
            style={styles.eye}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🔓" : "🔒"}
          </span>
        </div>

        {/* Strength */}
        {password && (
          <div style={{ color: strength.color }}>
            Strength: {strength.text}
          </div>
        )}

        {/* Rules */}
        <ul style={styles.rules}>
          <li style={{ color: checks.length ? "green" : "red" }}>
            Minimum 6 characters
          </li>
          <li style={{ color: checks.uppercase ? "green" : "red" }}>
            At least 1 uppercase letter
          </li>
          <li style={{ color: checks.number ? "green" : "red" }}>
            At least 1 number
          </li>
          <li style={{ color: checks.special ? "green" : "red" }}>
            At least 1 special character
          </li>
        </ul>

        <input
          type={showPassword ? "text" : "password"}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={styles.input}
          required
        />

        <button type="submit" style={styles.button}>
          Register
        </button>

        <button
          type="button"
          style={styles.linkButton}
          onClick={() => navigate("/signin", { replace: true })}
        >
          Already have an account? Sign In
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: `linear-gradient(to right, #00c6ff, #0072ff)`,
  },
  form: {
    background: "#fff",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    width: "300px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  title: { textAlign: "center" },
  input: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    width: "93%",
  },
  passwordContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  eye: {
    position: "absolute",
    right: "10px",
    cursor: "pointer",
  },
  rules: {
    fontSize: "12px",
    margin: 0,
    paddingLeft: "15px",
  },
  button: {
    padding: "10px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  linkButton: {
    background: "transparent",
    border: "none",
    color: "#007bff",
    cursor: "pointer",
    textAlign: "center",
  },
};