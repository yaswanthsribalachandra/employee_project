from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from schemas import Employee

MONGO_URL = "mongodb+srv://yaswanth:<password>@cluster1.sxnfzju.mongodb.net/Employees?retryWrites=true&w=majority"

client = AsyncIOMotorClient(MONGO_URL)

async def init_db():
    db = client.get_database("Employees")   
    await init_beanie(
        database=db,
        document_models=[Employee]
    )
    
    
