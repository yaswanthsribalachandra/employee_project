import React, { useEffect, useState } from "react";
import Form from "../form/form.jsx";
import "./Employee.css";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

function EmployeeDetails() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [role, setRole] = useState("");

  const navigate = useNavigate();

  // Load role
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole ? storedRole.toLowerCase() : "");
  }, []);

  // use axios (api) instead of fetch
  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees"); 
      setEmployees(res.data);
    } catch (error) {
      console.error("Error fetching employees:", error);

  
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/signin");
      }
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (empid) => {
    if (role !== "admin") {
      alert("Only admin can delete!");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this employee?"
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/employees/${empid}`); 

      setEmployees((prev) =>
        prev.filter((emp) => emp.empid !== empid)
      );

      if (selectedEmployee?.empid === empid) {
        closeForm();
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  // EDIT
  const handleEdit = (emp) => {
    setSelectedEmployee({ ...emp });
    setShowForm(true);
  };

  // ADD
  const handleAdd = () => {
    setSelectedEmployee(null);
    setShowForm(true);
  };

  // CLOSE MODAL
  const closeForm = () => {
    setShowForm(false);
    setSelectedEmployee(null);
  };

  return (
    <div className="container">
      <h2>Employee List</h2>

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
          {employees.length > 0 ? (
            employees.map((emp) => (
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

                  {role === "admin" && (
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(emp.empid)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8">No employees found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* MODAL */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
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