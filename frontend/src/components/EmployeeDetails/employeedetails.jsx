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

  // 🔐 Auth check state
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // 🔥 Prediction States
  const [predictData, setPredictData] = useState({
    location: "",
    position: ""
  });
  const [predictedSalary, setPredictedSalary] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ✅ AUTH CHECK
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/signin", { replace: true });
    } else {
      setIsAuthChecked(true);
    }
  }, [navigate]);

  // ✅ Load role
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole ? storedRole.toLowerCase() : "");
  }, []);

  // ✅ Fetch employees
  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data);
    } catch (error) {
      console.error("Error fetching employees:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/signin", { replace: true });
      }
    }
  };

  useEffect(() => {
    if (isAuthChecked) {
      fetchEmployees();
    }
  }, [isAuthChecked]);

  // ✅ DELETE
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

  // ✅ EDIT
  const handleEdit = (emp) => {
    setSelectedEmployee({ ...emp });
    setShowForm(true);
  };

  // ✅ ADD
  const handleAdd = () => {
    setSelectedEmployee(null);
    setShowForm(true);
  };

  // ✅ CLOSE MODAL
  const closeForm = () => {
    setShowForm(false);
    setSelectedEmployee(null);
  };

  // 🔥 PREDICT SALARY
  const handlePredict = async () => {
    if (!predictData.location || !predictData.position) {
      alert("Please enter both fields");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/ai/predict-salary", predictData);

      setPredictedSalary(res.data.predicted_salary);
    } catch (error) {
      console.error("Prediction failed:", error);
      alert("Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOGOUT WITH POPUP 🔥
  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) return;

    localStorage.removeItem("token");
    localStorage.removeItem("role");

    navigate("/signin", { replace: true });
  };

  // ⛔ Prevent UI flicker
  if (!isAuthChecked) return null;

  return (
    <div className="container">

      {/* 🔥 Top Right Logout */}
      <div className="top-right">
        <button onClick={handleLogout}>Logout</button>
      </div>

      <h2>Employee List</h2>

      {/* 🔥 ADMIN ONLY: PREDICTION */}
      {role === "admin" && (
        <div className="predict-box">
          <h3>Salary Prediction</h3>

          <div className="predict-form">
            <input
              type="text"
              placeholder="Enter Location"
              value={predictData.location}
              onChange={(e) =>
                setPredictData({
                  ...predictData,
                  location: e.target.value
                })
              }
            />

            <input
              type="text"
              placeholder="Enter Position"
              value={predictData.position}
              onChange={(e) =>
                setPredictData({
                  ...predictData,
                  position: e.target.value
                })
              }
            />

            <button onClick={handlePredict}>
              {loading ? "Predicting..." : "Predict"}
            </button>
          </div>

          {predictedSalary && (
            <div className="result-box">
              💰 Predicted Salary: <strong>{predictedSalary}</strong>
            </div>
          )}
        </div>
      )}

      {/* ADD BUTTON */}
      <button className="add-btn" onClick={handleAdd}>
        Add Employee
      </button>

      {/* TABLE */}
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