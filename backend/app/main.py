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


@app.post("/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    This endpoint handles new user registration.
    """
    # Check if a user with this email already exists in the database.
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # If the user doesn't exist, create them.
    return crud.create_user(db=db, user=user)


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


@app.post("/users/me/goal")
def select_user_goal(goal_id: int, current_user: schemas.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    """
    This is a protected endpoint for a logged-in user to select their active goal.
    """
    # 'Depends(auth.get_current_user)' is our "bouncer". It will require a valid
    # token and return the current user's data if the token is valid.
    
    # Save the user's goal choice to the database.

    goal = crud.get_goal_by_id(db, goal_id=goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    crud.set_active_goal(db=db, user_id=current_user.id, goal_id=goal_id)
    
    return {"message": f"Successfully set active goal for user {current_user.email}"}



@app.get("/users/me/recommendations", response_model=List[schemas.Book])
def get_recommendations(
    current_user: models.User = Depends(auth.get_current_user), # <-- BUG FIX: Changed schemas.User to models.User
    db: Session = Depends(get_db)
):
    """
    This is a protected endpoint that returns book recommendations
    based on the logged-in user's currently selected goal.
    """
    books = crud.get_recommendations_for_user(db, user_id=current_user.id)
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



# --- ADD THIS NEW ENDPOINT ---
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