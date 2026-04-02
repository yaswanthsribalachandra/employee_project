import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Form from "./form";
import Employee from "./employeedetails";
import Signin from "./signin";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* <App /> */}
    <div>
      {/*<Form />*/}
      <Employee />
      {/* <Signin /> */}
    </div>
  </React.StrictMode>
);