import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./components/Auth/signup.jsx";
import Signin from "./components/Auth/signin.jsx";
import EmployeeDetails from "./components/EmployeeDetails/employeedetails.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/home" element={<EmployeeDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;