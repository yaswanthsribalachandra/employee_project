import React, { useState } from "react";
import "./Signin.css";

const BASE_URL = "http://127.0.0.1:8000";

function Signin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  // Handle input change
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

      if (res.ok) {
        setMessage("✅ Login successful!");
        console.log(data);

        // 👉 Optional: store token
        // localStorage.setItem("token", data.token);

      } else {
        setMessage("❌ Invalid credentials");
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

        {message && <p className="message">{message}</p>}
      </form>
    </div>
  );
}

export default Signin;