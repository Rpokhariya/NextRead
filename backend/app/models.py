# app/models.py
from sqlalchemy import Column, Integer, String, ForeignKey, Table, Float, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import relationship
from .database import Base

# Junction table for the many-to-many relationship between books and goals
book_goals_table = Table('book_goals', Base.metadata,
    Column('book_id', Integer, ForeignKey('books.id'), primary_key=True),
    Column('goal_id', Integer, ForeignKey('goals.id'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # Relationship to the UserActiveGoal table
    active_goal = relationship("UserActiveGoal", back_populates="user", uselist=False, cascade="all, delete-orphan")

class Book(Base):
    __tablename__ = "books"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    author = Column(String)
    description = Column(String)
    cover_image_url = Column(String)
    average_rating = Column(Float)
    ratings_count = Column(Integer)

    # Many-to-many relationship with Goal
    goals = relationship("Goal", secondary=book_goals_table, back_populates="books")

class Goal(Base):
    __tablename__ = "goals"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    # Many-to-many relationship with Book
    books = relationship("Book", secondary=book_goals_table, back_populates="goals")

class UserActiveGoal(Base):
    __tablename__ = "user_active_goal"
    user_id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    goal_id = Column(Integer, ForeignKey('goals.id'))

    # Relationships back to User and Goal
    user = relationship("User", back_populates="active_goal")
    goal = relationship("Goal")


class Rating(Base):
    __tablename__ = "ratings"
    id = Column(Integer, primary_key=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Float, nullable=False)

    __table_args__ = (
        CheckConstraint('rating >= 1 AND rating <= 5', name='rating_check'),
        UniqueConstraint('book_id', 'user_id', name='_book_user_uc'),
    )