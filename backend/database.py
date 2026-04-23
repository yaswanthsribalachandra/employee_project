from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from schemas import Employee
from dotenv import load_dotenv
import os


load_dotenv()
MONGO_URL = os.getenv("MONGO_URI")

client = AsyncIOMotorClient(MONGO_URL)

async def init_db():
    db = client.get_database("Employees")   
    await init_beanie(
        database=db,
        document_models=[Employee]
    )
    
    
