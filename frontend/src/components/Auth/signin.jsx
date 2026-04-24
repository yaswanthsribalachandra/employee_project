import React, { useState } from "react";
import "./Signin.css";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const BASE_URL = api.defaults.baseURL;

function Signin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  // Handle input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle submit
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

      //console.log("LOGIN RESPONSE:", data); // 🔍 DEBUG

      if (res.ok) {
        if (!data.role) {
          setMessage("Role not received from server");
          return;
        }

        // Store role
        const role = data.role.toLowerCase().trim();
        localStorage.setItem("role", role);

        // optional token
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        setMessage("Login successful!");

        // Redirect ONLY (no reload)
        navigate("/home");

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
          onClick={() => navigate("/")}
        >
          Don't have an account? Sign Up
        </button>

        {message && <p className="message">{message}</p>}
      </form>
    </div>
  );
}

export default Signin;