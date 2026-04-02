from fastapi import APIRouter
from schemas import Employee
from typing import List

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