# app/main.py

# --- Core Imports ---
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm # Import form data dependency
from sqlalchemy.orm import Session
from typing import List

# --- Local Imports ---
from . import models, schemas, crud, auth
from .database import engine, get_db
from . import ai


# --- Database Table Creation ---
# This line tells SQLAlchemy to create all tables from models.py if they don't exist
models.Base.metadata.create_all(bind=engine)


# --- FastAPI App Instance ---
app = FastAPI()


# temporary cors allowance
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"message": "Welcome to the API!"}

@app.get("/goals", response_model=List[schemas.Goal])
def read_goals(db: Session = Depends(get_db)):
    """
    This endpoint fetches and returns a list of all available learning goals.
    """
    goals = crud.get_goals(db)
    return goals


@app.get("/books/popular", response_model=List[schemas.Book])
def read_popular_books(db: Session = Depends(get_db)):
    """
    This endpoint returns a list of the top 10 most popular books
    based on average rating and a minimum number of ratings.
    """
    books = crud.get_popular_books(db)
    return books



@app.get("/books/search", response_model=List[schemas.Book])
def search_for_books(q: str | None = None, db: Session = Depends(get_db)):
    """
    This endpoint searches for books by title or author.
    The search query is passed as a URL query parameter, e.g., /books/search?q=potter
    """
    if not q:
        return [] # Return an empty list if no query is provided
        
    books = crud.search_books(db, query=q)
    return books


@app.post("/register", response_model=schemas.Token)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    This endpoint handles new user registration.
    """
    # Check if a user with this email already exists in the database.
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = crud.create_user(db=db, user=user)
    access_token = auth.create_access_token(data={"sub": new_user.email})

    # If the user doesn't exist, create them.
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    This endpoint handles user login using standard form data.
    This makes it compatible with the interactive docs' "Authorize" button.
    """
    # The user's email is now in `form_data.username`.
    user = crud.get_user_by_email(db, email=form_data.username)
    
    # The password comes from `form_data.password`.
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    # If credentials are correct, create a new JWT.
    access_token = auth.create_access_token(data={"sub": form_data.username})
    
    # Return the token.
    return {"access_token": access_token, "token_type": "bearer"}


# @app.post("/users/me/goal", status_code=status.HTTP_200_OK)
# def select_user_goals(
#     goals_update: schemas.UserGoalsUpdate, # Use the new schema
#     current_user: models.User = Depends(auth.get_current_user), # Get the full user model
#     db: Session = Depends(get_db)
# ):
#     """
#     This is a protected endpoint for a logged-in user to select their active goals.
#     This will REPLACE all existing goals with the list provided.
#     """
#     # Optional: Verify that all provided goal_ids are valid goals
#     goals_from_db = db.query(models.Goal).filter(models.Goal.id.in_(goals_update.goal_ids)).all()
#     if len(goals_from_db) != len(goals_update.goal_ids):
#         raise HTTPException(status_code=404, detail="One or more goal IDs are invalid.")

#     # Call the new CRUD function to set the goals
#     crud.set_user_goals(db=db, user=current_user, goal_ids=goals_update.goal_ids)
    
#     return {"message": f"Successfully updated goals for user {current_user.email}"}



@app.get("/users/me/recommendations", response_model=List[schemas.Book])
def get_recommendations(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    This is a protected endpoint that returns book recommendations
    based on the logged-in user's currently selected goals.
    """
    books = crud.get_recommendations_for_user(db, user_id=current_user.id) # This now works with multiple goals
    return books



@app.get("/books/{book_id}", response_model=schemas.Book)
def read_book_details(book_id: int, db: Session = Depends(get_db)):
    """
    This endpoint gets the details for a single book.
    If the book's description is missing, it generates a new one
    using an AI model and saves ONLY successful results.
    """
    db_book = crud.get_book_by_id(db, book_id=book_id)
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")

    # We only need to check for the initial placeholder now.
    needs_summary = db_book.description == "No description available."

    if needs_summary:
        print(f"Generating new summary for '{db_book.title}'...")
        new_description = ai.generate_book_summary(title=db_book.title, author=db_book.author)
        
        is_successful_summary = new_description and new_description not in [
            "AI model is not available.",
            "Could not generate a summary at this time."
        ]

        if is_successful_summary:
            # If the AI call was successful, update the database.
            # The crud function will return the updated object.
            db_book = crud.update_book_description(db, book_id=book_id, description=new_description)
        else:
            # 1. Detach the book object from the database session.
            db.expunge(db_book)
            
            # 2. Now, we can safely change the description for this one response.
            # This change will NOT be saved to the database.
            db_book.description = new_description

    return db_book



@app.post("/books/{book_id}/rate", response_model=schemas.Book)
def rate_a_book(
    book_id: int,
    rating: schemas.RatingCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    This is a protected endpoint that allows a logged-in user to
    rate a book from 1 to 5.
    """
    # First, check if the book exists
    db_book = crud.get_book_by_id(db, book_id=book_id)
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Call the CRUD function to save the rating and get the updated book back
    updated_book = crud.rate_book(db=db, user_id=current_user.id, book_id=book_id, rating=rating.rating)
    return updated_book


# --- ADD THIS NEW ENDPOINT ---
@app.get("/users/me", response_model=schemas.UserWithGoals)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    """
    Gets the profile for the current logged-in user, including their selected goals.
    """
    return current_user

# --- SET / REPLACE all goals for a user (e.g., for first-time setup) ---
@app.put("/users/me/goals", status_code=status.HTTP_200_OK)
def set_user_goals(
    goals_update: schemas.UserGoalsUpdate, # Uses the schema with a LIST of IDs
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Sets or replaces all active goals for the logged-in user with the provided list.
    Ideal for initial setup or a complete reset of goals.
    """
    # Optional: Verify that all provided goal_ids are valid goals
    goals_from_db = db.query(models.Goal).filter(models.Goal.id.in_(goals_update.goal_ids)).all()
    if len(goals_from_db) != len(set(goals_update.goal_ids)): # Use set to handle duplicate IDs in input
        raise HTTPException(status_code=404, detail="One or more goal IDs are invalid.")

    # Call the CRUD function to replace all goals
    crud.set_user_goals(db=db, user=current_user, goal_ids=goals_update.goal_ids)
    
    return {"message": f"Successfully set goals for user {current_user.email}"}


# --- ADD a single goal to the user's list ---
@app.post("/users/me/goals", status_code=status.HTTP_200_OK)
def add_user_goal(
    goal_to_add: schemas.UserGoalAdd, # Uses the schema with a SINGLE ID
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Adds a single new goal to the logged-in user's list of active goals.
    """
    goal = crud.get_goal_by_id(db, goal_id=goal_to_add.goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail=f"Goal with ID {goal_to_add.goal_id} not found.")

    # Call the CRUD function to add one goal
    updated_user = crud.add_goal_to_user(db=db, user=current_user, goal_id=goal_to_add.goal_id)
    
    if updated_user is None:
         raise HTTPException(status_code=409, detail="User already has this goal.")
    
    return {"message": f"Successfully added goal '{goal.name}' for user {current_user.email}"}


# --- REMOVE a single goal from the user's list ---
@app.delete("/users/me/goals/{goal_id}", status_code=status.HTTP_200_OK)
def delete_user_goal(
    goal_id: int, # Goal ID comes from the URL path
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Removes a single goal from the logged-in user's list of active goals.
    """
    # Call the CRUD function to remove one goal
    result = crud.remove_goal_from_user(db=db, user=current_user, goal_id=goal_id)
    
    if result is None:
        raise HTTPException(status_code=404, detail=f"Goal with ID {goal_id} not found in user's goal list.")

    return {"message": f"Successfully removed goal for user {current_user.email}"}
