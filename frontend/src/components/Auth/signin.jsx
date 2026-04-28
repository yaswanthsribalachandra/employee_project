import React, { useState } from "react";
import "./Signin.css";
import { useNavigate, Navigate } from "react-router-dom";
import api from "../../services/api";

const BASE_URL = api.defaults.baseURL;

function Signin() {
  const navigate = useNavigate();

  const [step, setStep] = useState("login");

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const checks = {
  length: newPassword.length >= 6,
  uppercase: /[A-Z]/.test(newPassword),
  number: /[0-9]/.test(newPassword),
  special: /[^A-Za-z0-9]/.test(newPassword),
};

const allValid = Object.values(checks).every(Boolean);

const strengthScore = Object.values(checks).filter(Boolean).length;

const getStrength = () => {
  if (strengthScore <= 1) return { text: "Weak", color: "red" };
  if (strengthScore <= 3) return { text: "Medium", color: "orange" };
  return { text: "Strong", color: "green" };
};

  // 🔐 Prevent access if already logged in
  const token = localStorage.getItem("token");
  if (token) return <Navigate to="/home" replace />;

  // ---------------- PASSWORD LOGIN ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${BASE_URL}/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.access_token);
        navigate("/home", { replace: true });
      } else {
        setMessage(data.detail || "Invalid credentials");
      }
    } catch {
      setMessage("Server error");
    }
  };

  // ---------------- LOGIN WITH OTP ----------------
  const sendLoginOtp = async () => {
    if (!email) return alert("Enter email");

    try {
      const res = await fetch(
        `${BASE_URL}/login-otp?email=${encodeURIComponent(email)}`,
        { method: "POST" }
      );

      const data = await res.json();

      if (res.ok) {
        alert("OTP sent");
        setStep("otpVerify");
      } else {
        alert(data.detail);
      }
    } catch {
      alert("Error sending OTP");
    }
  };

  const verifyLoginOtp = async () => {
    if (!otp) return alert("Enter OTP");

    try {
      const res = await fetch(`${BASE_URL}/verify-login-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp: parseInt(otp) }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.access_token);
        navigate("/home", { replace: true });
      } else {
        alert(data.detail);
      }
    } catch {
      alert("OTP verification failed");
    }
  };

  // ---------------- FORGOT PASSWORD ----------------
  const sendResetOtp = async () => {
    if (!email) return alert("Enter email");

    try {
      const res = await fetch(
        `${BASE_URL}/forgot-password?email=${encodeURIComponent(email)}`,
        { method: "POST" }
      );

      const data = await res.json();

      if (res.ok) {
        alert("OTP sent");
        setStep("otpResetVerify");
      } else {
        alert(data.detail);
      }
    } catch {
      alert("Error sending OTP");
    }
  };

  const verifyResetOtp = async () => {
    if (!otp) return alert("Enter OTP");

    try {
      const res = await fetch(`${BASE_URL}/verify-reset-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp: parseInt(otp) }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep("reset");
      } else {
        alert(data.detail);
      }
    } catch {
      alert("Error verifying OTP");
    }
  };

  const resetPassword = async () => {
    if (newPassword !== confirmPassword) {
      return alert("Passwords do not match");
    }

    try {
      const res = await fetch(`${BASE_URL}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          new_password: newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Password updated successfully");
        setStep("login");
      } else {
        alert(data.detail);
      }
    } catch {
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
            placeholder="Username"
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />

          <button type="submit">Login</button>

          <button type="button" onClick={() => setStep("otpLogin")}>
            Login with OTP
          </button>

          <button type="button" onClick={() => setStep("forgot")}>
            Forgot Password
          </button>

          {/* 🔥 SIGNUP REDIRECT */}
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

      {/* ---------------- OTP LOGIN ---------------- */}
      {step === "otpLogin" && (
        <div className="signin-form">
          <h2>Login with OTP</h2>

          <input
            type="email"
            placeholder="Enter email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <button onClick={sendLoginOtp}>Send OTP</button>
          <button onClick={() => setStep("login")}>Back</button>
        </div>
      )}

      {/* ---------------- OTP VERIFY ---------------- */}
      {step === "otpVerify" && (
        <div className="signin-form">
          <h2>Enter OTP</h2>

          <input
            type="number"
            placeholder="OTP"
            onChange={(e) => setOtp(e.target.value)}
          />

          <button onClick={verifyLoginOtp}>Verify & Login</button>
        </div>
      )}

      {/* ---------------- FORGOT PASSWORD ---------------- */}
      {step === "forgot" && (
        <div className="signin-form">
          <h2>Forgot Password</h2>

          <input
            type="email"
            placeholder="Enter email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <button onClick={sendResetOtp}>Send OTP</button>
          <button onClick={() => setStep("login")}>Back</button>
        </div>
      )}

      {/* ---------------- VERIFY RESET OTP ---------------- */}
      {step === "otpResetVerify" && (
        <div className="signin-form">
          <h2>Verify OTP</h2>

          <input
            type="number"
            placeholder="OTP"
            onChange={(e) => setOtp(e.target.value)}
          />

          <button onClick={verifyResetOtp}>Verify</button>
        </div>
      )}

      {step === "reset" && (
  <div className="signin-form">
    <h2>Reset Password</h2>

    {/* New Password */}
    <div style={{ position: "relative" }}>
      <input
        type={showPassword ? "text" : "password"}
        placeholder="Enter new password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <span
        onClick={() => setShowPassword(!showPassword)}
        style={{ position: "absolute", right: 80, top: 10, cursor: "pointer" }}
      >
        {showPassword ? "🔓" : "🔒"}
      </span>
    </div>

    {/* Confirm Password */}
    <div style={{ position: "relative", marginTop: "10px" }}>
      <input
        type={showConfirm ? "text" : "password"}
        placeholder="Confirm password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <span
        onClick={() => setShowConfirm(!showConfirm)}
        style={{ position: "absolute", right: 80, top: 10, cursor: "pointer" }}
      >
        {showConfirm ? "🔓" : "🔒"}
      </span>
    </div>

    {/* Strength */}
    <p style={{ color: getStrength().color }}>
      Strength: {getStrength().text}
    </p>

    {/* Validation */}
    <ul style={{ fontSize: "12px", textAlign: "left" }}>
      <li style={{ color: checks.length ? "green" : "red" }}>
        At least 6 characters
      </li>
      <li style={{ color: checks.uppercase ? "green" : "red" }}>
        One uppercase letter
      </li>
      <li style={{ color: checks.number ? "green" : "red" }}>
        One number
      </li>
      <li style={{ color: checks.special ? "green" : "red" }}>
        One special character
      </li>
    </ul>

    {/* Match check */}
    {confirmPassword && newPassword !== confirmPassword && (
      <p style={{ color: "red" }}>Passwords do not match</p>
    )}

    {/* Submit */}
    <button
      onClick={resetPassword}
      disabled={!allValid || newPassword !== confirmPassword}
    >
      Update Password
    </button>
  </div>
  )}
    </div>
  );
}

export default Signin;