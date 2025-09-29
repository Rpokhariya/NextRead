# app/crud.py
from sqlalchemy.orm import Session
from . import models, auth, schemas
from sqlalchemy import func, or_

# function to get list of goals
def get_goals(db: Session):
    """
    Reads the database to get a list of all goals.
    """
    return db.query(models.Goal).all()


def get_user_by_email(db: Session, email: str):
    """
    Reads the database to find a user by their email address.
    Returns the user object if found, otherwise returns None.
    """
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    """
    Creates a new user in the database.
    Hashes the password before storing it.
    """
    # Get the hashed password from our auth logic
    hashed_password = auth.get_password_hash(user.password)

    # Create a new SQLAlchemy User model instance
    db_user = models.User(email=user.email, hashed_password=hashed_password)

    # Add the new user instance to the session (staging it for saving)
    db.add(db_user)

    # Commit the changes to the database
    db.commit()

    # Refresh the instance to get the new data from the DB (like the generated ID)
    db.refresh(db_user)

    return db_user


def set_active_goal(db: Session, user_id: int, goal_id: int):
    """
    Sets or updates the active goal for a given user.
    """
    active_goal = db.query(models.UserActiveGoal).filter(models.UserActiveGoal.user_id == user_id).first()
    if active_goal:
        # If the user already has a goal, update it
        active_goal.goal_id = goal_id
    else:
        # If the user doesn't have a goal, create a new entry
        active_goal = models.UserActiveGoal(user_id=user_id, goal_id=goal_id)
        db.add(active_goal)
    db.commit()
    return active_goal


def get_goal_by_id(db: Session, goal_id: int):
    """
    Reads the database to find a goal by its ID.
    """
    return db.query(models.Goal).filter(models.Goal.id == goal_id).first()



def get_recommendations_for_user(db: Session, user_id: int):
    """
    Gets book recommendations for a user based on their active goal,
    sorted by average rating in descending order.
    """
    # 1. Find the user's active goal
    active_goal_link = db.query(models.UserActiveGoal).filter(models.UserActiveGoal.user_id == user_id).first()
    
    if not active_goal_link:
        return []
        
    goal_id = active_goal_link.goal_id
    
    # 2. Query for books linked to that goal and sort them
    #    - .join() connects the books table with the book_goals table
    #    - .filter() selects only the books matching the user's goal_id
    #    - .order_by() sorts the results by the average_rating column in descending order
    recommended_books = (
        db.query(models.Book)
        .join(models.book_goals_table)
        .filter(models.book_goals_table.c.goal_id == goal_id)
        .filter(models.Book.ratings_count >= 50)
        .order_by(models.Book.average_rating.desc())
        .all()
    )

    return recommended_books


def get_popular_books(db: Session, limit: int = 12, min_ratings: int = 100):
    """
    Gets a curated list of popular books using a pure SQLAlchemy ORM query
    that ranks books within each goal category.
    """
    
    # --- Step 1: Create a subquery to rank books within each goal ---
    # This is the SQLAlchemy way of writing a window function:
    # ROW_NUMBER() OVER(PARTITION BY goal_id ORDER BY rating DESC)
    book_rank_subquery = (
        db.query(
            models.Book,
            func.row_number()
            .over(
                partition_by=models.book_goals_table.c.goal_id,
                order_by=[models.Book.average_rating.desc(), models.Book.ratings_count.desc()]
            )
            .label("rank")
        )
        .join(models.book_goals_table)
        .filter(models.Book.ratings_count >= min_ratings)
        .subquery()
    )

    # --- Step 2: Query from the subquery to select the top-ranked books ---
    # This is like saying "SELECT * FROM (the subquery above) WHERE rank <= 2"
    popular_books = (
        db.query(book_rank_subquery)
        .filter(book_rank_subquery.c.rank <= 2)
        .order_by(book_rank_subquery.c.average_rating.desc(), book_rank_subquery.c.ratings_count.desc())
        .limit(limit)
        .all()
    )
    
    return popular_books



def search_books(db: Session, query: str):
    """
    Searches for books with a title or author that contains the query string.
    The search is case-insensitive.
    """
    search_term = f"%{query}%" # Add wildcards for partial matching
    
    # .ilike() is a case-insensitive "LIKE" query
    # or_() lets us search in either the title or the author column
    search_results = (
        db.query(models.Book)
        .filter(
            or_(
                models.Book.title.ilike(search_term),
                models.Book.author.ilike(search_term)
            )
        )
        .all()
    )
    return search_results