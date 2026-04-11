#  Employee Management System (FastAPI)

A scalable and high-performance Employee Management API built using FastAPI. This project provides complete CRUD operations to manage employee records efficiently.

---

##  Features

- Add new employees  
- View all employees  
- Get employee by ID  
- Update employee details  
- Delete employees  
- Data validation using Pydantic  
- Async API handling  
- MongoDB integration  

---

##  Tech Stack

- Backend: FastAPI  
- Language: Python  
- Database: MongoDB  
- Server: Uvicorn  
- ODM: Motor (Async MongoDB driver)  

---

##  Project Structure

employee-management/

├── main.py  
├── database.py  
├── schemas.py  
├── routes/  
│   └── employee.py  
├── requirements.txt  
└── README.md  

---

##  Installation

1. Clone the repository

git clone https://github.com/your-username/employee-management.git  
cd employee-management  

2. Create virtual environment

python -m venv venv  
source venv/bin/activate     (Mac/Linux)  
venv\Scripts\activate        (Windows)  

3. Install dependencies

pip install -r requirements.txt  

---

## Run the Application

uvicorn main:app --reload  

---

##  API Documentation

Swagger UI:  
http://127.0.0.1:8000/docs  

ReDoc:  
http://127.0.0.1:8000/redoc  

---

##  API Endpoints

POST    /employees         -> Add employee  
GET     /employees         -> Get all employees  
GET     /employees/{id}    -> Get employee by ID  
PUT     /employees/{id}    -> Update employee  
DELETE  /employees/{id}    -> Delete employee  

---

##  Example Request

{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "Software Engineer",
  "salary": 60000
}

---

##  Example Response

{
  "message": "Employee added",
  "id": "661234abcd1234ef567890"
}

---

##  Future Enhancements

- JWT Authentication  
- Role-based access (Admin/User)  
- Email-based password reset (OTP)  
- Docker support  
- Deployment (AWS / Render)  
- Logging & monitoring  

---

##  Contributing

Contributions are welcome!  
Feel free to fork the repo and submit a pull request.

---

##  License

This project is licensed under the MIT License.

---

##  Author

Your Name  
GitHub: https://github.com/your-username  
LinkedIn: https://linkedin.com/in/your-profile  

---

##  Support

If you found this project helpful, give it a star on GitHub!
