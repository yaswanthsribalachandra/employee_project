import React, { useState, useEffect } from "react";
import "./form.css";
import api from "../../services/api"; // ✅ use axios instance

function Form({ emp, onUpdate }) {
  const isEdit = !!emp;

  const [formData, setFormData] = useState({
    empid: "",
    name: "",
    position: "",
    phone: "",
    salary: "",
    location: "",
    address: "",
  });

  useEffect(() => {
    if (emp) {
      setFormData(emp);
    } else {
      setFormData({
        empid: "",
        name: "",
        position: "",
        phone: "",
        salary: "",
        location: "",
        address: "",
      });
    }
  }, [emp]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEdit) {
        await api.patch(`/employees/${formData.empid}`, formData); // ✅ token auto added
      } else {
        await api.post(`/employees`, formData); // ✅ token auto added
      }

      onUpdate();
    } catch (error) {
      console.error("Error:", error);

      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{isEdit ? "Edit Employee" : "Add Employee"}</h3>

      {!isEdit && (
        <input
          type="number"
          name="empid"
          value={formData.empid}
          onChange={handleChange}
          placeholder="Employee ID"
          required
        />
      )}

      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Name"
        required
      />

      <input
        type="text"
        name="position"
        value={formData.position}
        onChange={handleChange}
        placeholder="Position"
        required
      />

      <input
        type="text"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="Phone"
        required
      />

      <input
        type="number"
        name="salary"
        value={formData.salary}
        onChange={handleChange}
        placeholder="Salary"
        required
      />

      <input
        type="text"
        name="location"
        value={formData.location}
        onChange={handleChange}
        placeholder="Location"
        required
      />

      <input
        type="text"
        name="address"
        value={formData.address}
        onChange={handleChange}
        placeholder="Address"
        required
      />

      <button
        type="submit"
        className="update-btn"
        style={{
          padding: "10px 16px",
          backgroundColor: isEdit ? "#28a745" : "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "15px",
          fontWeight: "500",
        }}
      >
        {isEdit ? "Update" : "Add"}
      </button>
    </form>
  );
}

export default Form;