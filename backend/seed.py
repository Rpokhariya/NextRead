import os
import pandas as pd
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables from your .env file
load_dotenv()

# --- DATABASE CONNECTION ---
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("No DATABASE_URL found in environment variables. Please check your .env file.")

engine = create_engine(DATABASE_URL)

# --- DATA PREPARATION ---
# Define the goals you curated in your CSV file
GOALS = [
    "Explore Fantasy Worlds",
    "Laugh with Sci-Fi Classics",
    "Learn About the World (Non-Fiction)",
    "Master the English Language",
    "Build Web Development Skills",
    "Read Young Adult Survival Stories",
    "Engage with Pop Culture",
    "Read Foundational Essays",
    "Dive into Historical Fiction",
    "Understand Modern Economics",
    "Improve Critical Thinking",
    "Analyze Social & Historical Trends",
    "Understand Postmodern Literature",
    "Explore Contemporary Fiction",
    "Learn from Scientific Minds",
    "Read Classic 20th-Century Novels"
]

# Path to your CSV file with cover URLs
csv_file_path = 'data/curated_books_with_covers.csv'

try:
    df = pd.read_csv(csv_file_path)
    # Handle potential empty values in columns that are needed
    df['authors'] = df['authors'].fillna('Unknown Author')
    print("Successfully loaded and prepared the CSV file.")
except FileNotFoundError:
    print(f"Error: The file {csv_file_path} was not found.")
    exit()

def seed_data():
    with engine.connect() as connection:
        print("Database connection successful. Seeding data...")

        with connection.begin() as transaction:
            try:
                # Clear existing data
                print("Clearing old data from tables...")
                connection.execute(text("DELETE FROM user_active_goal;"))
                connection.execute(text("DELETE FROM book_goals;"))
                connection.execute(text("DELETE FROM books;"))
                connection.execute(text("DELETE FROM goals;"))
                connection.execute(text("DELETE FROM users;"))

                # --- 1. SEED GOALS TABLE ---
                print("Seeding the 'goals' table...")
                for goal_name in GOALS:
                    connection.execute(text("INSERT INTO goals (name) VALUES (:name)"), {'name': goal_name})
                
                goals_from_db = connection.execute(text("SELECT id, name FROM goals;")).fetchall()
                goal_map = {name: goal_id for goal_id, name in goals_from_db}

                # --- 2. SEED BOOKS AND BOOK_GOALS TABLES ---
                print("Seeding the 'books' table and linking to goals...")
                for index, row in df.iterrows():
                    book_insert_query = text("""
                        INSERT INTO books (title, author, description, cover_image_url, average_rating, ratings_count)
                        VALUES (:title, :author, :description, :cover_image_url, :average_rating, :ratings_count) RETURNING id;
                    """)
                    result = connection.execute(book_insert_query, {
                        'title': row['title'],
                        'author': row['authors'],
                        'description': 'No description available.',
                        'cover_image_url': row['image_url'],
                        'average_rating': row['average_rating'],
                        'ratings_count': row['ratings_count']
                    })
                    book_id = result.fetchone()[0]

                    goal_name = row.get('goal')
                    if goal_name in goal_map:
                        goal_id = goal_map[goal_name]
                        connection.execute(
                            text("INSERT INTO book_goals (book_id, goal_id) VALUES (:book_id, :goal_id)"),
                            {'book_id': book_id, 'goal_id': goal_id}
                        )
                
                transaction.commit()
                print("\nData seeding completed successfully! Your database is ready.")

            except Exception as e:
                print(f"An error occurred: {e}")
                transaction.rollback()
                print("Transaction rolled back. No data was committed to the database.")

if __name__ == "__main__":
    seed_data()