# app/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# This is a "dependency" that provides a database session to our endpoints
# and ensures it's properly closed after the request is finished.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Test block 
# if __name__ == "__main__":
#     try:
#         # engine.connect() will fail if the database connection details are wrong
#         with engine.connect() as connection:
#             print("Database connection successful!")
#     except Exception as e:
#         print(f"Database connection failed.")
#         print(f"   Error: {e}")