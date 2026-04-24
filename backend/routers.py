from fastapi import APIRouter
from schemas import Employee,User
from typing import List
from fastapi import HTTPException
from passlib.context import CryptContext
from passlib.exc import UnknownHashError
from dotenv import load_dotenv
import os


load_dotenv()
ADMIN_SECRET = os.getenv("ADMIN_SECRET")

router = APIRouter()



pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

@router.get("/employees", response_model=List[Employee])
async def get_employees():
    return await Employee.find().to_list()
@router.post("/employees", response_model=Employee)
async def create_employee(employee: Employee):
    existing = await Employee.find_one(Employee.empid == employee.empid)
    
    if existing:
        return {"error": "Employee with this empid already exists"}

    await employee.insert()
    return employee

@router.get("/employees/{empid}")
async def get_employee(empid: int):
    employee = await Employee.find_one(Employee.empid == empid)

    if not employee:
        return {"error": "Not found"}

    return employee
@router.patch("/employees/{empid}", response_model=Employee)
async def update_employee(empid: int, data: Employee):
    existing = await Employee.find_one(Employee.empid == empid)

    if not existing:
        return {"error": "Not found"}

    update_data = data.dict(exclude_unset=True)

    for field, value in update_data.items():
        setattr(existing, field, value)

    await existing.save()
    return existing

@router.delete("/employees/{empid}")
async def delete_employee(empid: int):
    employee = await Employee.find_one(Employee.empid == empid)

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    await employee.delete()

    return {"message": "Employee deleted successfully"}




@router.post("/createuser")
async def createuser(user: User, admin_key: str = None):

    if not user.username or not user.password:
        raise HTTPException(status_code=400, detail="Missing fields")

    existing_user = await User.find_one(User.username == user.username)
    if existing_user:
        raise HTTPException(status_code=409, detail="User already exists")

    user.password = hash_password(user.password)
    
    if admin_key == ADMIN_SECRET:
        user.role = "admin"
    else:
        user.role = "user"

    await user.insert()

    return {"message": "User created", "role": user.role}


@router.post("/signin")
async def signin(user: User):

    existing_user = await User.find_one(User.username == user.username)

    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        if not verify_password(user.password, existing_user.password):
            raise HTTPException(status_code=401, detail="Invalid credentials")

    except UnknownHashError:
        if user.password != existing_user.password:
            raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "message": "Login successful",
        "username": existing_user.username,
        "role": existing_user.role   
    }