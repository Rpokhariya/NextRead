import os
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from . import schemas, database, crud
from dotenv import load_dotenv

load_dotenv()

# This tells FastAPI which URL to check for the token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# --- PASSWORD HASHING ---

# We use passlib to handle password hashing. 'argon2' is the chosen secure algorithm.
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# This function checks if a plain-text password matches a stored hash.
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# This function takes a plain-text password and returns its hash.
def get_password_hash(password):
    return pwd_context.hash(password)

# --- JWT TOKEN CREATION ---

# We load our secrets from the .env file
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# This function creates the JWT access token.
def create_access_token(data: dict):
    to_encode = data.copy()
    # Set an expiration time for the token
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    # Encode the token with our data, secret key, and algorithm
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# This  decodes the JWT to get the user's email,
# then fetches the user from the database.
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = crud.get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user