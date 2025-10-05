from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List

# --- Book Schema ---
class Book(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    title: str
    author: str | None = None
    description: str | None = None
    cover_image_url: str | None = None
    average_rating: float | None = None
    ratings_count: int | None = None
    user_rating: float | None = None


# --- Goal Schema ---
class Goal(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str

# Schema for SETTING or REPLACING the user's goals with a list
class UserGoalsUpdate(BaseModel):
    goal_ids: List[int]

# Schema for ADDING a single goal
class UserGoalAdd(BaseModel):
    goal_id: int




# --- Ratings Schema ---
class RatingCreate(BaseModel):
    rating: float = Field(..., ge=1, le=5) # Rating must be between 1 and 5

# --- User Schemas ---

# This is the "form" for creating a new user.
# It tells our API to expect an email and a password.
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=72)

# This is the "form" for sending user data back from our API.
# Notice it has no password, so we never accidentally send it to the frontend.
class User(BaseModel):
    # This config setting tells Pydantic to read data even if it's not a dict,
    # but an ORM model (or any object with attributes).
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    email: EmailStr

# This schema extends the base User to include their associated goals.
class UserWithGoals(User):
    goals: List[Goal] = []

# --- Token Schemas ---

# This is the "form" for sending a JWT back to the user upon login.
class Token(BaseModel):
    access_token: str
    token_type: str