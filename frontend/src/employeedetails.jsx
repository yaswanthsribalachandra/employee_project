import React, { useEffect, useState } from "react";
import Form from "./form";
import "./Employee.css";

const BASE_URL = "http://127.0.0.1:8000";

function EmployeeDetails() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${BASE_URL}/employees`);
      const data = await res.json();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);
  const handleDelete = async (empid) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmDelete) return;

    try {
      await fetch(`${BASE_URL}/employees/${empid}`, {
        method: "DELETE",
      });
      fetchEmployees();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };


  const handleEdit = (emp) => {
    setSelectedEmployee(emp);
    setShowForm(true);
  };


  const handleAdd = () => {
    setSelectedEmployee(null); 
    setShowForm(true);
  };


  const closeForm = () => {
    setShowForm(false);
    setSelectedEmployee(null);
  };

  return (
    <div className="container">
      <h2>Employee List</h2>

      {/* ➕ Add Button */}
      <button className="add-btn" onClick={handleAdd}>
        Add Employee
      </button>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Position</th>
            <th>Phone</th>
            <th>Salary</th>
            <th>Location</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((emp) => (
            <tr key={emp.empid}>
              <td>{emp.empid}</td>
              <td>{emp.name}</td>
              <td>{emp.position}</td>
              <td>{emp.phone}</td>
              <td>{emp.salary}</td>
              <td>{emp.location}</td>
              <td>{emp.address}</td>

              <td>
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(emp)}
                >
                  Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(emp.empid)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🔥 Modal (Add / Edit) */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">

            {/* ❌ Cross */}
            <span className="close-icon" onClick={closeForm}>
              &times;
            </span>

            <Form
              emp={selectedEmployee}
              onUpdate={() => {
                fetchEmployees();
                closeForm();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeDetails;