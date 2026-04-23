from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from schemas import Employee,User
from dotenv import load_dotenv
import os


load_dotenv()
MONGO_URL = os.getenv("MONGO_URI")
MONGO_URL="mongodb+srv://yaswanth:yaswanth12345@cluster1.sxnfzju.mongodb.net/Employees"

client = AsyncIOMotorClient(MONGO_URL)

async def init_db():
    db = client.get_database("Employees")   
    await init_beanie(
        database=db,
        document_models=[Employee,User]
    )
    
    
