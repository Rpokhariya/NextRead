import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from your .env file
load_dotenv()

# This variable will hold our configured model, initialized to None
model = None

try:
    # Get the API Key from the environment
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("CRITICAL: GOOGLE_API_KEY not found in environment variables.")
    
    # Configure the library with your API key
    genai.configure(api_key=api_key)
    
    # --- FINAL, STABLE MODEL NAME ---
    # We are using a stable model name that we know your key has access to.
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    print("Google AI Model configured successfully.")
except Exception as e:
    # If configuration fails, print a clear error and set the model to None
    print(f" Error configuring Google AI Model: {e}")
    model = None


def generate_book_summary(title: str, author: str) -> str:
    """
    Generates a one-paragraph summary for a book using the Gemini API library.
    """
    # If the model failed to initialize during startup, return an error immediately.
    if not model:
        return "AI model is not available due to a configuration error."

    try:
        # Create a carefully crafted prompt for the AI model
        prompt = (
            f"Provide a concise, engaging, one-paragraph summary for the book "
            f"'{title}' by '{author}'. Focus on the main plot or key ideas. "
            f"Do not include any introductory phrases like 'This book is about...'."
        )
        
        # Call the API to generate the content
        response = model.generate_content(prompt)
        
        # Clean up the response text for storage
        summary = response.text.strip().replace('\n', ' ')
        return summary
        
    except Exception as e:
        # If the API call itself fails, log the detailed error and return a user-friendly message.
        print(f"--- DETAILED AI ERROR ---")
        print(f"An error of type {type(e).__name__} occurred: {e}")
        print(f"---------------------------")
        return "Could not generate a summary at this time."