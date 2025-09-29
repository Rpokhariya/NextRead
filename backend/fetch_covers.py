import pandas as pd
import requests
import time
import os

# --- CONFIGURATION ---
INPUT_CSV_PATH = 'data/curated_books.csv'
OUTPUT_CSV_PATH = 'data/curated_books_with_covers.csv'

# --- SCRIPT ---
def fetch_cover_images():
    try:
        df = pd.read_csv(INPUT_CSV_PATH)
        print(f"Successfully loaded {INPUT_CSV_PATH}")
    except FileNotFoundError:
        print(f"ERROR: Input file not found at {INPUT_CSV_PATH}")
        return

    image_urls = []
    print("Starting to fetch cover images from Google Books API...")

    for index, row in df.iterrows():
        # Use ISBN if available, otherwise use title and author
        search_query = ""
        if 'isbn' in row and pd.notna(row['isbn']):
            search_query = f"isbn:{row['isbn']}"
        else:
            title = row.get('title', '')
            author = row.get('authors', '')
            search_query = f"intitle:{requests.utils.quote(title)}+inauthor:{requests.utils.quote(author)}"

        url = f"https://www.googleapis.com/books/v1/volumes?q={search_query}"

        try:
            response = requests.get(url)
            response.raise_for_status()  # Raise an exception for bad status codes
            data = response.json()

            thumbnail_url = data['items'][0]['volumeInfo']['imageLinks']['thumbnail']
            image_urls.append(thumbnail_url)
            print(f"SUCCESS: Found cover for '{row['title']}'")

        except (requests.exceptions.RequestException, KeyError, IndexError) as e:
            image_urls.append("https://placehold.co/200x300?text=Not+Found")
            print(f"FAILURE: Could not find cover for '{row['title']}'. Using placeholder.")

        time.sleep(1) # Wait 1 second to be polite to the API

    df['image_url'] = image_urls
    df.to_csv(OUTPUT_CSV_PATH, index=False)
    print(f"\nProcess complete. New file saved to {OUTPUT_CSV_PATH}")

if __name__ == "__main__":
    fetch_cover_images()