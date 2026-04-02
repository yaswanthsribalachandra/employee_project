import React, { useState, useEffect } from "react";
import "./form.css";
const BASE_URL = "http://127.0.0.1:8000";

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
        await fetch(`${BASE_URL}/employees/${formData.empid}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch(`${BASE_URL}/employees`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      onUpdate(); 
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{isEdit ? "Edit Employee" : "Add Employee"}</h3>

      {/* Only show ID when adding */}
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
          transition: "0.3s ease",
  }}
>
  {isEdit ? "Update" : "Add"}
</button>
    </form>
  );
}

export default Form;