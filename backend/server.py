from fastapi import FastAPI, APIRouter, HTTPException, Cookie, Response, WebSocket, WebSocketDisconnect
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import requests
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[tuple[WebSocket, str]] = []

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections.append((websocket, user_id))

    def disconnect(self, websocket: WebSocket):
        self.active_connections = [(ws, uid) for ws, uid in self.active_connections if ws != websocket]

    async def broadcast(self, message: dict):
        for connection, _ in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: EmailStr
    name: str
    picture: Optional[str] = None
    password_hash: Optional[str] = None
    created_at: datetime
    level: int = 1
    workouts_completed: int = 0
    points: int = 0
    current_badge: str = "Beginner"
    before_photo: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    occupation: Optional[str] = None
    health_sleep: Optional[int] = None
    health_physical_activity: Optional[int] = None
    health_water_intake: Optional[int] = None
    health_smoker: Optional[bool] = None
    health_nutrition: Optional[int] = None
    health_mental: Optional[int] = None
    health_time: Optional[int] = None
    health_fitness: Optional[int] = None
    health_strength: Optional[int] = None

class UserSignup(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class SessionExchange(BaseModel):
    session_id: str

class Workout(BaseModel):
    model_config = ConfigDict(extra="ignore")
    workout_id: str
    title: str
    description: str
    duration_minutes: int
    difficulty: str
    category: str
    created_at: datetime

class WorkoutCreate(BaseModel):
    title: str
    description: str
    duration_minutes: int
    difficulty: str
    category: str

class WorkoutCompletion(BaseModel):
    model_config = ConfigDict(extra="ignore")
    completion_id: str
    user_id: str
    workout_id: str
    completed_at: datetime

class CompleteWorkoutRequest(BaseModel):
    workout_id: str

class NutritionTip(BaseModel):
    model_config = ConfigDict(extra="ignore")
    tip_id: str
    title: str
    content: str
    category: str
    created_at: datetime

class NutritionTipCreate(BaseModel):
    title: str
    content: str
    category: str

class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    message_id: str
    user_id: str
    user_name: str
    user_picture: Optional[str]
    message: str
    timestamp: datetime

class SendMessageRequest(BaseModel):
    message: str

class UpdateProfileRequest(BaseModel):
    before_photo: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    occupation: Optional[str] = None

class UpdateHealthScoreRequest(BaseModel):
    health_sleep: Optional[int] = None
    health_physical_activity: Optional[int] = None
    health_water_intake: Optional[int] = None
    health_smoker: Optional[bool] = None
    health_nutrition: Optional[int] = None
    health_mental: Optional[int] = None
    health_time: Optional[int] = None
    health_fitness: Optional[int] = None
    health_strength: Optional[int] = None

# Helper functions
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

async def get_current_user(session_token: Optional[str] = Cookie(None), authorization: Optional[str] = None) -> User:
    token = session_token
    if not token and authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session_doc = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

def calculate_level_and_badge(workouts_completed: int) -> tuple[int, str, int, int]:
    # Progressive level thresholds: [cumulative_workouts, level, badge]
    levels = [
        (0, 1, "Beginner"),          # Level 1: 0-4 workouts
        (5, 2, "Warrior"),           # Level 2: 5-14 workouts
        (15, 3, "Champion"),         # Level 3: 15-34 workouts
        (35, 4, "Legend"),           # Level 4: 35-64 workouts
        (65, 5, "Weapon Master"),    # Level 5: 65-104 workouts
        (105, 6, "Ultimate Weapon")  # Level 6: 105-154 workouts
    ]
    
    # Workouts needed for each level
    level_requirements = {
        1: 5,   # Need 5 workouts to reach Level 2
        2: 10,  # Need 10 more workouts to reach Level 3
        3: 20,  # Need 20 more workouts to reach Level 4
        4: 30,  # Need 30 more workouts to reach Level 5
        5: 40,  # Need 40 more workouts to reach Level 6
        6: 50   # Need 50 more workouts (max level)
    }
    
    current_level = 1
    current_badge = "Beginner"
    workouts_in_current_level = workouts_completed
    
    # Find current level based on total workouts
    for threshold, level, badge in reversed(levels):
        if workouts_completed >= threshold:
            current_level = level
            current_badge = badge
            workouts_in_current_level = workouts_completed - threshold
            break
    
    # Get workouts needed for next level
    workouts_for_next_level = level_requirements.get(current_level, 50)
    
    return current_level, current_badge, workouts_in_current_level, workouts_for_next_level

# Auth endpoints
@api_router.post("/auth/signup")
async def signup(user_data: UserSignup):
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    password_hash = get_password_hash(user_data.password)
    
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password_hash": password_hash,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "level": 1,
        "workouts_completed": 0,
        "points": 0,
        "current_badge": "Beginner"
    }
    
    await db.users.insert_one(user_doc)
    
    session_token = f"session_{uuid.uuid4().hex}"
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    }
    await db.user_sessions.insert_one(session_doc)
    
    response = Response(content=json.dumps({"message": "User created successfully"}), media_type="application/json")
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    return response

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc or not user_doc.get("password_hash"):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user_doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    session_token = f"session_{uuid.uuid4().hex}"
    session_doc = {
        "user_id": user_doc["user_id"],
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    }
    await db.user_sessions.insert_one(session_doc)
    
    response = Response(content=json.dumps({"message": "Login successful"}), media_type="application/json")
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    return response

@api_router.post("/auth/session")
async def exchange_session(data: SessionExchange):
    # REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    response = requests.get(
        "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
        headers={"X-Session-ID": data.session_id}
    )
    
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Invalid session ID")
    
    oauth_data = response.json()
    
    user_doc = await db.users.find_one({"email": oauth_data["email"]}, {"_id": 0})
    
    if user_doc:
        user_id = user_doc["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "name": oauth_data["name"],
                "picture": oauth_data.get("picture")
            }}
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": oauth_data["email"],
            "name": oauth_data["name"],
            "picture": oauth_data.get("picture"),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "level": 1,
            "workouts_completed": 0,
            "points": 0,
            "current_badge": "Beginner"
        }
        await db.users.insert_one(user_doc)
    
    session_token = oauth_data["session_token"]
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    }
    await db.user_sessions.insert_one(session_doc)
    
    response_obj = Response(content=json.dumps({"message": "Session established"}), media_type="application/json")
    response_obj.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    return response_obj

@api_router.get("/auth/me")
async def get_me(session_token: Optional[str] = Cookie(None), authorization: Optional[str] = None):
    user = await get_current_user(session_token, authorization)
    return user

@api_router.post("/auth/logout")
async def logout(session_token: Optional[str] = Cookie(None)):
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response = Response(content=json.dumps({"message": "Logged out"}), media_type="application/json")
    response.delete_cookie(key="session_token", path="/")

@api_router.put("/profile")
async def update_profile(profile_data: UpdateProfileRequest, session_token: Optional[str] = Cookie(None), authorization: Optional[str] = None):
    user = await get_current_user(session_token, authorization)
    
    update_fields = {}
    if profile_data.before_photo is not None:
        update_fields["before_photo"] = profile_data.before_photo
    if profile_data.height is not None:
        update_fields["height"] = profile_data.height
    if profile_data.weight is not None:
        update_fields["weight"] = profile_data.weight
    if profile_data.occupation is not None:
        update_fields["occupation"] = profile_data.occupation
    
    if update_fields:
        await db.users.update_one(
            {"user_id": user.user_id},
            {"$set": update_fields}
        )
    
    return {"message": "Profile updated successfully"}

@api_router.put("/profile/health-score")
async def update_health_score(health_data: UpdateHealthScoreRequest, session_token: Optional[str] = Cookie(None), authorization: Optional[str] = None):
    user = await get_current_user(session_token, authorization)
    
    update_fields = {}
    if health_data.health_sleep is not None:
        update_fields["health_sleep"] = health_data.health_sleep
    if health_data.health_physical_activity is not None:
        update_fields["health_physical_activity"] = health_data.health_physical_activity
    if health_data.health_water_intake is not None:
        update_fields["health_water_intake"] = health_data.health_water_intake
    if health_data.health_smoker is not None:
        update_fields["health_smoker"] = health_data.health_smoker
    if health_data.health_nutrition is not None:
        update_fields["health_nutrition"] = health_data.health_nutrition
    if health_data.health_mental is not None:
        update_fields["health_mental"] = health_data.health_mental
    if health_data.health_time is not None:
        update_fields["health_time"] = health_data.health_time
    if health_data.health_fitness is not None:
        update_fields["health_fitness"] = health_data.health_fitness
    if health_data.health_strength is not None:
        update_fields["health_strength"] = health_data.health_strength
    
    if update_fields:
        await db.users.update_one(
            {"user_id": user.user_id},
            {"$set": update_fields}
        )
    
    return {"message": "Health score updated successfully"}

@api_router.get("/profile/health-score")
async def get_health_score(session_token: Optional[str] = Cookie(None), authorization: Optional[str] = None):
    user = await get_current_user(session_token, authorization)
    
    # Calculate Dad Health Score (average of all metrics out of 10)
    metrics = []
    
    if user.health_sleep is not None:
        metrics.append(user.health_sleep)
    if user.health_physical_activity is not None:
        metrics.append(user.health_physical_activity)
    if user.health_water_intake is not None:
        metrics.append(user.health_water_intake)
    if user.health_smoker is not None:
        # If smoker/vaper, score is 0, if not, score is 10
        metrics.append(0 if user.health_smoker else 10)
    if user.health_nutrition is not None:
        metrics.append(user.health_nutrition)
    if user.health_mental is not None:
        metrics.append(user.health_mental)
    if user.health_time is not None:
        metrics.append(user.health_time)
    if user.health_fitness is not None:
        metrics.append(user.health_fitness)
    if user.health_strength is not None:
        metrics.append(user.health_strength)
    
    total_score = round(sum(metrics) / len(metrics), 1) if metrics else 0
    
    return {
        "sleep": user.health_sleep,
        "physical_activity": user.health_physical_activity,
        "water_intake": user.health_water_intake,
        "smoker": user.health_smoker,
        "nutrition": user.health_nutrition,
        "mental_health": user.health_mental,
        "time": user.health_time,
        "fitness": user.health_fitness,
        "strength": user.health_strength,
        "total_score": total_score,
        "max_score": 10
    }


    return response

# Workout endpoints
@api_router.get("/workouts", response_model=List[Workout])
async def get_workouts(session_token: Optional[str] = Cookie(None), authorization: Optional[str] = None):
    await get_current_user(session_token, authorization)
    workouts = await db.workouts.find({}, {"_id": 0}).to_list(1000)
    
    for workout in workouts:
        if isinstance(workout['created_at'], str):
            workout['created_at'] = datetime.fromisoformat(workout['created_at'])
    
    return workouts

@api_router.post("/workouts", response_model=Workout)
async def create_workout(workout_data: WorkoutCreate, session_token: Optional[str] = Cookie(None), authorization: Optional[str] = None):
    await get_current_user(session_token, authorization)
    
    workout_id = f"workout_{uuid.uuid4().hex[:12]}"
    workout_doc = {
        "workout_id": workout_id,
        "title": workout_data.title,
        "description": workout_data.description,
        "duration_minutes": workout_data.duration_minutes,
        "difficulty": workout_data.difficulty,
        "category": workout_data.category,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.workouts.insert_one(workout_doc)
    workout_doc['created_at'] = datetime.fromisoformat(workout_doc['created_at'])
    return Workout(**workout_doc)

@api_router.post("/workouts/complete")
async def complete_workout(data: CompleteWorkoutRequest, session_token: Optional[str] = Cookie(None), authorization: Optional[str] = None):
    user = await get_current_user(session_token, authorization)
    
    workout = await db.workouts.find_one({"workout_id": data.workout_id}, {"_id": 0})
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    
    existing_completion = await db.workout_completions.find_one({
        "user_id": user.user_id,
        "workout_id": data.workout_id
    })
    
    if existing_completion:
        raise HTTPException(status_code=400, detail="Workout already completed")
    
    completion_id = f"completion_{uuid.uuid4().hex[:12]}"
    completion_doc = {
        "completion_id": completion_id,
        "user_id": user.user_id,
        "workout_id": data.workout_id,
        "completed_at": datetime.now(timezone.utc).isoformat()
    }
    await db.workout_completions.insert_one(completion_doc)
    
    new_workouts_completed = user.workouts_completed + 1
    new_points = user.points + 10
    new_level, new_badge, workouts_in_level, workouts_for_next = calculate_level_and_badge(new_workouts_completed)
    
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$set": {
            "workouts_completed": new_workouts_completed,
            "points": new_points,
            "level": new_level,
            "current_badge": new_badge
        }}
    )
    
    leveled_up = new_level > user.level
    
    return {
        "message": "Workout completed!",
        "workouts_completed": new_workouts_completed,
        "points": new_points,
        "level": new_level,
        "badge": new_badge,
        "leveled_up": leveled_up
    }

@api_router.get("/workouts/progress")
async def get_workout_progress(session_token: Optional[str] = Cookie(None), authorization: Optional[str] = None):
    user = await get_current_user(session_token, authorization)
    
    completions = await db.workout_completions.find({"user_id": user.user_id}, {"_id": 0}).to_list(1000)
    
    current_level, current_badge, workouts_in_current_level, workouts_for_next_level = calculate_level_and_badge(user.workouts_completed)
    
    workouts_until_next_level = workouts_for_next_level - workouts_in_current_level
    progress_percentage = (workouts_in_current_level / workouts_for_next_level) * 100 if workouts_for_next_level > 0 else 100
    
    return {
        "total_workouts_completed": user.workouts_completed,
        "current_level": current_level,
        "current_badge": current_badge,
        "points": user.points,
        "workouts_in_current_level": workouts_in_current_level,
        "workouts_for_next_level": workouts_for_next_level,
        "workouts_until_next_level": workouts_until_next_level,
        "progress_percentage": progress_percentage,
        "completed_workout_ids": [c["workout_id"] for c in completions]
    }

# Nutrition endpoints
@api_router.get("/nutrition", response_model=List[NutritionTip])
async def get_nutrition_tips(session_token: Optional[str] = Cookie(None), authorization: Optional[str] = None):
    await get_current_user(session_token, authorization)
    tips = await db.nutrition_tips.find({}, {"_id": 0}).to_list(1000)
    
    for tip in tips:
        if isinstance(tip['created_at'], str):
            tip['created_at'] = datetime.fromisoformat(tip['created_at'])
    
    return tips

@api_router.post("/nutrition", response_model=NutritionTip)
async def create_nutrition_tip(tip_data: NutritionTipCreate, session_token: Optional[str] = Cookie(None), authorization: Optional[str] = None):
    await get_current_user(session_token, authorization)
    
    tip_id = f"tip_{uuid.uuid4().hex[:12]}"
    tip_doc = {
        "tip_id": tip_id,
        "title": tip_data.title,
        "content": tip_data.content,
        "category": tip_data.category,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.nutrition_tips.insert_one(tip_doc)
    tip_doc['created_at'] = datetime.fromisoformat(tip_doc['created_at'])
    return NutritionTip(**tip_doc)

# Chat endpoints
@api_router.get("/chat/messages", response_model=List[ChatMessage])
async def get_chat_messages(limit: int = 50, session_token: Optional[str] = Cookie(None), authorization: Optional[str] = None):
    await get_current_user(session_token, authorization)
    messages = await db.chat_messages.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
    messages.reverse()
    
    for msg in messages:
        if isinstance(msg['timestamp'], str):
            msg['timestamp'] = datetime.fromisoformat(msg['timestamp'])
    
    return messages

@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket, token: Optional[str] = None):
    try:
        if not token:
            await websocket.close(code=1008)
            return
        user = await get_current_user(session_token=token)
    except:
        await websocket.close(code=1008)
        return
    
    await manager.connect(websocket, user.user_id)
    
    try:
        while True:
            data = await websocket.receive_json()
            message_text = data.get("message", "").strip()
            
            if not message_text:
                continue
            
            message_id = f"msg_{uuid.uuid4().hex[:12]}"
            message_doc = {
                "message_id": message_id,
                "user_id": user.user_id,
                "user_name": user.name,
                "user_picture": user.picture,
                "message": message_text,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
            await db.chat_messages.insert_one(message_doc)
            
            broadcast_msg = {
                "message_id": message_id,
                "user_id": user.user_id,
                "user_name": user.name,
                "user_picture": user.picture,
                "message": message_text,
                "timestamp": message_doc["timestamp"]
            }
            
            await manager.broadcast(broadcast_msg)
    
    except WebSocketDisconnect:
        manager.disconnect(websocket)

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()