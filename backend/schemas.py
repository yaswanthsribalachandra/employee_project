from beanie import Document
from datetime import datetime
from pydantic import Field
from pydantic import BaseModel

class Employee(Document):
    empid: int | None = None
    name: str | None = None
    position: str | None = None
    phone: int | None = None
    salary: float | None = None
    location: str | None = None
    address: str | None = None

    class Settings:
        name = "employee"

class User(Document):
    username: str | None = None
    role: str | None = None
    password: str | None = None
    # ✅ OTP fields
    otp: int | None = None
    otp_expiry: datetime | None = None

    class Settings:
        name = "User"
class SalaryInput(BaseModel):
    location: str
    position: str
class OTPVerification(BaseModel):
    email: str
    otp: int
    
class ResetPassword(BaseModel):
    email: str
    new_password: str