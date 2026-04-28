from fastapi import APIRouter, HTTPException, Depends
from schemas import Employee, User, SalaryInput, OTPVerification,ResetPassword
from typing import List
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
import os
import pickle
import pandas as pd
import random
import smtplib
from email.mime.text import MIMEText


#loading the .env file
load_dotenv()

#initializing the router
router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = 30
MODEL_PATH = "../salary_model.pkl"

if not SECRET_KEY:
    raise Exception("SECRET_KEY not found in .env file")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="signin")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    '''Hash a password for storing.'''
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    '''Verify a stored password against one provided by user.'''
    return pwd_context.verify(plain_password, hashed_password)

#function for creating JWT token
def create_access_token(data: dict):
    '''Create a JWT token with an expiration time.'''
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str = Depends(oauth2_scheme)):
    '''Verify the JWT token and return the payload.'''
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


async def get_current_user(payload=Depends(verify_token)):
    '''Get the current user from the token payload.'''
    username = payload.get("sub")
    user = await User.find_one(User.username == username)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


def admin_only(payload=Depends(verify_token)):
    '''Ensure the user is an admin.'''
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only access")
    return payload


@router.get("/employees", response_model=List[Employee])
async def get_employees(user=Depends(get_current_user)):
    '''Get a list of all employees.'''
    return await Employee.find().to_list()

@router.post("/employees", response_model=Employee)
async def create_employee(employee: Employee,user=Depends(get_current_user)):
    '''Create a new employee.'''
    existing = await Employee.find_one(Employee.empid == employee.empid)

    if existing:
        raise HTTPException(status_code=400, detail="Employee already exists")

    await employee.insert()
    return employee

@router.get("/employees/{empid}", response_model=Employee)
async def get_employee(empid: int, user=Depends(get_current_user)):
    '''Get a single employee by ID.'''
    employee = await Employee.find_one(Employee.empid == empid)

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    return employee

@router.patch("/employees/{empid}", response_model=Employee)
async def update_employee(empid: int, data: Employee, user=Depends(get_current_user)):
    '''Update an existing employee.'''
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
    '''Delete an employee by ID.'''
    employee = await Employee.find_one(Employee.empid == empid)

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    await employee.delete()
    return {"message": "Employee deleted successfully"}


@router.post("/createuser")
async def createuser(user: User):
    '''Create a new user.'''
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
    '''Sign in an existing user.'''

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
    
#print(hash_password.__doc__)

@router.get("/ai/export-data")
async def export_data():
    employees = await Employee.find().to_list()

    data = []
    for emp in employees:
        if emp.location and emp.position and emp.salary:
            data.append({
                "location": emp.location,
                "position": emp.position,
                "salary": emp.salary
            })

    return data




#  Load model once (not inside function)
try:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
except Exception as e:
    model = None
    print(f" Model loading failed: {e}")


@router.post("/ai/predict-salary")
async def predict_salary(data: SalaryInput,user=Depends(admin_only)):
    """
    Predict salary based on location and position
    """

    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    try:
        #  Convert input to DataFrame (important for pipeline)
        input_df = pd.DataFrame([{
            "location": data.location,
            "position": data.position
        }])

        #  Make prediction
        prediction = model.predict(input_df)[0]

        return {
            "location": data.location,
            "position": data.position,
            "predicted_salary": round(float(prediction), 2)
        }

    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))
     
     

def generate_otp(length=6):
    return ''.join([str(random.randint(0, 9)) for _ in range(length)])


# ----------------------------
# EMAIL SENDER
# ----------------------------
def send_email_otp(receiver_email, otp):
    sender_email = "dasariyaswanthsribalachandra@gmail.com"
    app_password = os.getenv("EMAIL_PASS")

    subject = "Password Reset Verification Code"
    body = f"Dear User,\n\nYour One-Time Password (OTP) for resetting your password is **{otp}**. This code is valid for 5 minutes.\n\nFor security reasons, please do not share this OTP with anyone.\n\nRegards,\nSupport Team"

    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = sender_email
    msg['To'] = receiver_email

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        #server = smtplib.SMTP_SSL("smtp.gmail.com", 465)

        server.starttls()
        server.login(sender_email, app_password)
        server.send_message(msg)
        server.quit()
        print("Email sent successfully")
    except Exception as e:
        print("Error:", e)


# ----------------------------
# SEND OTP
# ----------------------------
@router.post("/forgot-password")
async def send_otp(email: str):

    user = await User.find_one({"username": email})

    if not user:
        raise HTTPException(status_code=404, detail="User not found. Sign up first.")

    otp = int(generate_otp())
    expiry_time = datetime.utcnow() + timedelta(minutes=5)

    # ✅ Save OTP in user
    user.otp = otp
    user.otp_expiry = expiry_time
    await user.save()

    send_email_otp(email, otp)

    return {"message": "OTP sent successfully"}


# ----------------------------
# VERIFY OTP
# ----------------------------
@router.post("/verify-reset-otp")
async def verify_otp(data: OTPVerification):

    user = await User.find_one({"username": data.email})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.otp:
        raise HTTPException(status_code=400, detail="OTP not generated")

    # ❗ expiry check
    if datetime.utcnow() > user.otp_expiry:
        user.otp = None
        user.otp_expiry = None
        await user.save()
        raise HTTPException(status_code=400, detail="OTP expired")

    # ❗ match OTP
    if user.otp != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    # ✅ success → clear OTP
    '''user.otp = None
    user.otp_expiry = None
    await user.save()'''

    return {"message": "OTP verified successfully"}

@router.post("/reset-password")
async def reset_password(data: ResetPassword):

    user = await User.find_one({"username": data.email})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # ❌ Prevent same password reuse
    if verify_password(data.new_password, user.password):
        raise HTTPException(status_code=400, detail="New password must be different from old password")

    # ✅ Hash and overwrite password
    user.password = hash_password(data.new_password)

    # clear OTP (optional if not needed here)
    #user.otp = None
    #user.otp_expiry = None

    await user.save()

    return {"message": "Password updated successfully"}
