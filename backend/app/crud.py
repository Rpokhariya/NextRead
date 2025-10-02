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


# --- Function to set multiple goals for a user ---
def set_user_goals(db: Session, user: models.User, goal_ids: list[int]):
    """
    Replaces a user's active goals with a new list of goals.
    """
    # 1. Clear the user's existing goals
    user.goals.clear()
    
    # 2. Find the new goal objects from the provided IDs
    new_goals = db.query(models.Goal).filter(models.Goal.id.in_(goal_ids)).all()
    
    # 3. Add the new goals to the user's goal list
    user.goals.extend(new_goals)
    
    # 4. Commit the session to save all changes
    db.commit()
    db.refresh(user)
    return user

# --- Function to ADD a single goal to a user's list ---
def add_goal_to_user(db: Session, user: models.User, goal_id: int):
    """
    Adds a single goal to a user's list of active goals.
    Prevents adding a goal if it's already in the user's list.
    """
    # 1. Check if the user already has this goal
    for existing_goal in user.goals:
        if existing_goal.id == goal_id:
            return None # Return None or raise an exception to indicate it's a duplicate

    # 2. Find the goal object from the database
    goal_to_add = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if not goal_to_add:
        # This case should be handled in the API layer, but it's good practice
        return None 

    # 3. Add the new goal to the user's goal list
    user.goals.append(goal_to_add)
    
    # 4. Commit and refresh
    db.commit()
    db.refresh(user)
    return user

# --- Function to REMOVE a single goal from a user's list ---
def remove_goal_from_user(db: Session, user: models.User, goal_id: int):
    """
    Removes a single goal from a user's list of active goals.
    """
    # 1. Find the goal object to remove from the user's current list
    goal_to_remove = None
    for goal in user.goals:
        if goal.id == goal_id:
            goal_to_remove = goal
            break

    # 2. If the goal is found in the user's list, remove it
    if goal_to_remove:
        user.goals.remove(goal_to_remove)
        db.commit()
        db.refresh(user)
        return user
    
    # 3. If the user doesn't have this goal, there's nothing to do
    return None


def get_goal_by_id(db: Session, goal_id: int):
    """
    Reads the database to find a goal by its ID.
    """
    return db.query(models.Goal).filter(models.Goal.id == goal_id).first()



def get_recommendations_for_user(db: Session, user_id: int):
    """
    Gets book recommendations for a user based on all of their active goals,
    sorted by average rating in descending order.
    """
    # 1. Find the user and their associated goals
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or not user.goals:
        return []
        
    # 2. Get a list of all goal IDs for the user
    user_goal_ids = [goal.id for goal in user.goals]
    
    # 3. Query for books linked to ANY of those goals
    #    - .in_(user_goal_ids) finds books where the goal_id is in our list
    #    - .distinct() ensures we don't get duplicate books if a book matches multiple goals
    recommended_books = (
        db.query(models.Book)
        .join(models.book_goals_table)
        .filter(models.book_goals_table.c.goal_id.in_(user_goal_ids))
        .filter(models.Book.ratings_count >= 50)
        .order_by(models.Book.average_rating.desc())
        .distinct()
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


def get_book_by_id(db: Session, book_id: int):
    """
    Reads the database to find a book by its ID.
    """
    return db.query(models.Book).filter(models.Book.id == book_id).first()


def update_book_description(db: Session, book_id: int, description: str):
    """
    Updates the description for a specific book.
    """
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if db_book:
        db_book.description = description
        db.commit()
        db.refresh(db_book)
    return db_book



def rate_book(db: Session, user_id: int, book_id: int, rating: float):
    """
    Allows a user to rate a book. If the rating already exists, it's updated.
    After rating, it recalculates and updates the book's average rating and count.
    """
    # Find if a rating by this user for this book already exists
    existing_rating = db.query(models.Rating).filter(
        models.Rating.user_id == user_id,
        models.Rating.book_id == book_id
    ).first()

    if existing_rating:
        # If it exists, update the rating
        existing_rating.rating = rating
    else:
        # If not, create a new rating
        new_rating = models.Rating(user_id=user_id, book_id=book_id, rating=rating)
        db.add(new_rating)
    
    db.commit()

    # --- RECALCULATION LOGIC ---
    # After saving the rating, recalculate the book's stats
    
    # 1. Get the new average rating and total count
    stats = db.query(
        func.avg(models.Rating.rating).label("average"),
        func.count(models.Rating.id).label("count")
    ).filter(models.Rating.book_id == book_id).one()

    # 2. Find the book to update
    book_to_update = db.query(models.Book).filter(models.Book.id == book_id).first()
    
    # 3. Update the book's stats
    if book_to_update and stats:
        book_to_update.average_rating = round(stats.average, 2) if stats.average else 0
        book_to_update.ratings_count = stats.count if stats.count else 0
        db.commit()
        db.refresh(book_to_update)
        
    return book_to_update