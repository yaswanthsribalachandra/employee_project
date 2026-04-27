import React, { useState, useEffect } from "react";
import "./Signin.css";
import { useNavigate, Navigate } from "react-router-dom";
import api from "../../services/api";

const BASE_URL = api.defaults.baseURL;

function Signin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  // 🔥 Prevent access if already logged in
  const token = localStorage.getItem("token");
  if (token) {
    return <Navigate to="/home" replace />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${BASE_URL}/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Store token
        localStorage.setItem("token", data.access_token);

        // ✅ Store role
        const role = data.role.toLowerCase().trim();
        localStorage.setItem("role", role);

        setMessage("Login successful!");

        // 🔥 IMPORTANT FIX (prevents back navigation)
        navigate("/home", { replace: true });

      } else {
        setMessage(data.detail || "Invalid credentials");
      }

    } catch (error) {
      console.error(error);
      setMessage("⚠️ Server error");
    }
  };

  return (
    <div className="signin-container">
      <form className="signin-form" onSubmit={handleSubmit}>
        <h2>Sign In</h2>

        <input
          type="text"
          name="username"
          placeholder="Enter Username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Login</button>

        <button
          type="button"
          className="signup-btn"
          onClick={() => navigate("/", { replace: true })}
        >
          Don't have an account? Sign Up
        </button>

        {message && <p className="message">{message}</p>}
      </form>
    </div>
  );
}

export default Signin;