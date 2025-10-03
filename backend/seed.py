import pandas as pd
from dotenv import load_dotenv
from app.database import SessionLocal
from app import models

load_dotenv()

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

csv_file_path = 'data/curated_books_with_covers.csv'

def seed_data():
    session = SessionLocal()
    try:
        print("Clearing old data from tables...")
        # Clear association table first
        session.execute(models.book_goals_table.delete())
        session.query(models.Book).delete()
        session.query(models.Goal).delete()
        session.commit()

        print("Seeding goals table...")
        goal_objs = {}
        for goal_name in GOALS:
            goal = models.Goal(name=goal_name)
            session.add(goal)
            session.flush()  # Get goal.id before commit
            goal_objs[goal_name] = goal
        session.commit()

        print("Seeding books and linking to goals...")
        df = pd.read_csv(csv_file_path)
        df['authors'] = df['authors'].fillna('Unknown Author')
        for _, row in df.iterrows():
            book = models.Book(
                title=row['title'],
                author=row['authors'],
                description=row.get('description', 'No description available.'),
                cover_image_url=row.get('image_url', ''),
                average_rating=row.get('average_rating', 0),
                ratings_count=row.get('ratings_count', 0)
            )
            # Link book to goal using relationship
            goal_name = row.get('goal')
            if goal_name in goal_objs:
                book.goals.append(goal_objs[goal_name])
            session.add(book)
        session.commit()

        print("\nData seeding completed successfully! Your database is ready.")

    except Exception as e:
        print(f"An error occurred: {e}")
        session.rollback()
        print("Transaction rolled back. No data was committed to the database.")
    finally:
        session.close()

if __name__ == "__main__":
    seed_data()