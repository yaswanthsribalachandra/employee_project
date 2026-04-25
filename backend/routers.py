from fastapi import APIRouter, HTTPException, Depends
from schemas import Employee, User
from typing import List
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
import os


load_dotenv()

router = APIRouter()


SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = 30

if not SECRET_KEY:
    raise Exception("SECRET_KEY not found in .env file")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="signin")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


async def get_current_user(payload=Depends(verify_token)):
    username = payload.get("sub")
    user = await User.find_one(User.username == username)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


def admin_only(payload=Depends(verify_token)):
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only access")
    return payload


@router.get("/employees", response_model=List[Employee])
async def get_employees(user=Depends(get_current_user)):
    return await Employee.find().to_list()

@router.post("/employees", response_model=Employee)
async def create_employee(employee: Employee,user=Depends(get_current_user)):
    existing = await Employee.find_one(Employee.empid == employee.empid)

    if existing:
        raise HTTPException(status_code=400, detail="Employee already exists")

    await employee.insert()
    return employee

@router.get("/employees/{empid}", response_model=Employee)
async def get_employee(empid: int, user=Depends(get_current_user)):
    employee = await Employee.find_one(Employee.empid == empid)

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    return employee

@router.patch("/employees/{empid}", response_model=Employee)
async def update_employee(empid: int, data: Employee, user=Depends(get_current_user)):
    existing = await Employee.find_one(Employee.empid == empid)

    if not existing:
        raise HTTPException(status_code=404, detail="Employee not found")

    update_data = data.dict(exclude_unset=True)

    for field, value in update_data.items():
        setattr(existing, field, value)

    await existing.save()
    return existing

@router.delete("/employees/{empid}")
async def delete_employee(empid: int, user=Depends(admin_only)):
    employee = await Employee.find_one(Employee.empid == empid)

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    await employee.delete()
    return {"message": "Employee deleted successfully"}


@router.post("/createuser")
async def createuser(user: User):

    if not user.username or not user.password:
        raise HTTPException(status_code=400, detail="Missing fields")

    existing_user = await User.find_one(User.username == user.username)
    if existing_user:
        raise HTTPException(status_code=409, detail="User already exists")

    user.password = hash_password(user.password)
    user.role = "user"

    await user.insert()

    return {
        "message": "User created successfully",
        "role": user.role
    }

@router.post("/signin")
async def signin(user: User):

    existing_user = await User.find_one(User.username == user.username)

    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(user.password, existing_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "sub": existing_user.username,
        "role": existing_user.role
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": existing_user.role
    }