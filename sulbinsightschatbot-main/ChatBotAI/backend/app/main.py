from fastapi import FastAPI
from core.bigquery_fetching import fetch_all_loan_data
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.config import setup_logging, settings
from api.chat import router as chat_router
from pydantic import BaseModel
from pathlib import Path

import logging
setup_logging()
logger = logging.getLogger(__name__)


# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     pass
    
#     # try:
#     #     # bigquery_data = await fetch_all_loan_data()
#     #     # app.state.bigquery_data  = bigquery_data
#     #     # if bigquery_data:
#     #     #     logger.info(
#     #     #         "Latest user data loaded successfully | count=%s",
#     #     #         len(bigquery_data), 
#     #     #     )
#     #     # else:
#     #     #     logger.warning("No user data found during setup")

#     # except Exception as e:
#     #     logger.exception("Failed to load latest user data")
 
#     # yield

app = FastAPI(title="ChatBot AI", version="1.0.0")

app.include_router(chat_router)

 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
USERS_FILE = Path(r"D:\ChatBotAI\backend\app\users.json")
def load_users():
    if USERS_FILE.exists():
        try:
            with open(USERS_FILE, 'r') as f:
                return json.load(f)
        except:
            return {}
    return {}


# Simple in-memory user store (email -> password hash)
# In production, use proper database and password hashing
registered_users = load_users()



class SigninRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    success: bool
    message: str
    name: str = None

@app.get("/")
def root():
    return {"message": "API is running 🚀"}


@app.post("/auth/signin", response_model=AuthResponse)
async def signin(request: SigninRequest):
    """Sign in to existing account"""
    try:
        email = request.email.strip().lower()
        print('reg',registered_users)
        
        # Check if account exists
        if email !="testuser@email.com":
            return AuthResponse(
                success=False,
                message="Account not found. Please create an account first."
            )
        
        # Check password
        # user = registered_users[email]
        if"123456" != request.password:
            return AuthResponse(
                success=False,
                message="Invalid password. Please try again."
            )
       
        logger.info(f"User signed in: {email}")
        
        return AuthResponse(
            success=True,
            message="Sign in successful!",
            name="Test user"
        )
    
    except Exception as e:
        logger.error(f"Signin error: {e}")
        return AuthResponse(
            success=False,
            message=f"Sign in failed: {str(e)}"
        )
