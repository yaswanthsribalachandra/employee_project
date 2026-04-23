from fastapi import APIRouter
from schemas import Employee,User
from typing import List
from fastapi import HTTPException

router = APIRouter()


@router.get("/employees", response_model=List[Employee])
async def get_employees():
    return await Employee.find().to_list()

@router.post("/employees", response_model=Employee)
async def create_employee(employee: Employee):
    last = await Employee.find().sort("-empid").first_or_none()
    employee.empid = 1 if not last else last.empid + 1

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

@router.post("/create_user")
async def create_user(user: User):

    if not user.username or not user.password:
        raise HTTPException(status_code=400, detail="Missing fields")

    existing_user = await User.find_one(User.username == user.username)

    if existing_user:
        raise HTTPException(status_code=409, detail="User already exists")

    await user.insert()
    return {"message": "User created"}

@router.post("/signin")
async def signin(user: User):

    # 🔍 Find user in DB
    existing_user = await User.find_one(User.username == user.username)

    if not existing_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # 🔐 Compare plain password
    if user.password != existing_user.password:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    # ✅ Success
    return {
        "message": "Login successful",
        "username": existing_user.username
    }
