import React, { useState } from "react";
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

  // ✅ Forgot password states
  const [step, setStep] = useState("login"); // login | forgot | otp | reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // 🔐 Prevent access if already logged in
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

  // ---------------- LOGIN ----------------
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
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("role", data.role.toLowerCase().trim());
        navigate("/home", { replace: true });
      } else {
        setMessage(data.detail || "Invalid credentials");
      }
    } catch (error) {
      setMessage("⚠️ Server error");
    }
  };

  // ---------------- SEND RESET OTP ----------------
  const sendResetOtp = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/forgot-password?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("OTP sent to email");
        setStep("otp");
      } else {
        alert(data.detail);
      }
    } catch (err) {
      alert("Error sending OTP");
    }
  };

  // ---------------- VERIFY OTP ----------------
  const verifyOtp = async () => {
    try {
      const res = await fetch(`${BASE_URL}/verify-reset-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          otp: parseInt(otp),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("OTP verified!");
        setStep("reset");
      } else {
        alert(data.detail);
      }
    } catch (err) {
      alert("Error verifying OTP");
    }
  };

  // ---------------- RESET PASSWORD ----------------
  const resetPassword = async () => {
    try {
      const res = await fetch(`${BASE_URL}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          new_password: newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Password reset successful!");
        setStep("login");
      } else {
        alert(data.detail);
      }
    } catch (err) {
      alert("Error resetting password");
    }
  };

  return (
    <div className="signin-container">

      {/* ---------------- LOGIN ---------------- */}
      {step === "login" && (
        <form className="signin-form" onSubmit={handleSubmit}>
          <h2>Sign In</h2>

          <input
            type="text"
            name="username"
            placeholder="Enter Email"
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

          {/* ✅ Forgot Password */}
          <button
            type="button"
            className="signup-btn"
            onClick={() => setStep("forgot")}
          >
            Forgot Password?
          </button>

          <button
            type="button"
            className="signup-btn"
            onClick={() => navigate("/", { replace: true })}
          >
            Don't have an account? Sign Up
          </button>

          {message && <p className="message">{message}</p>}
        </form>
      )}

      {/* ---------------- FORGOT EMAIL ---------------- */}
      {step === "forgot" && (
        <div className="signin-form">
          <h2>Forgot Password</h2>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button onClick={sendResetOtp}>Send OTP</button>

          <button onClick={() => setStep("login")}>Back</button>
        </div>
      )}

      {/* ---------------- OTP ---------------- */}
      {step === "otp" && (
        <div className="signin-form">
          <h2>Verify OTP</h2>

          <input
            type="number"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />

          <button onClick={verifyOtp}>Verify</button>
        </div>
      )}

      {/* ---------------- RESET PASSWORD ---------------- */}
      {step === "reset" && (
        <div className="signin-form">
          <h2>Reset Password</h2>

          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <button onClick={resetPassword}>Update Password</button>
        </div>
      )}
    </div>
  );
}

export default Signin;
