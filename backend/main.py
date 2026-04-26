from fastapi import FastAPI
from routers import router
from contextlib import asynccontextmanager
from database import init_db
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    await init_db()
    #print("Database connected")
    yield
    # shutdown (optional)
    #print("App shutting down")

app = FastAPI(
    lifespan=lifespan,
    title="this is a simple CRUD operation for Employees"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)