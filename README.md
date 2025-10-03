# Live demo: https://nextreadapp.netlify.app/

## NextRead

### 📖 Project Description

NextRead is a book recommendation website designed to help users discover their next read based on specific, curated learning goals rather than generic genres. Whether you want to master a new skill, explore a historical period, or understand a complex topic, NextRead provides a tailored list of books to guide your learning journey.

The platform is built with a secure login system using **JSON Web Tokens (JWT)** to manage user sessions, protecting user data and enabling personalized experiences like tracking rated books. A key feature allows users to rate books, which instantly updates the book's overall score for the entire community. To provide insightful previews, the application leverages the **Google Gemini API** to automatically generate high-quality book summaries. These summaries are generated once and then saved, ensuring they load instantly for all future visitors, which enhances performance and reduces API costs.

### ✨ Key Features

* **Goal-Oriented Recommendations:** Find books curated to help you achieve specific learning or development goals.
* **Secure User Authentication:** A robust login and registration system built with JWT for secure session management.
* **Dynamic Book Ratings:** Users can rate books, and the average score is instantly calculated and displayed for everyone.
* **AI-Generated Summaries:** Uses the Google Gemini API to automatically generate concise and informative book summaries.
* **Optimized Performance:** Summaries are cached after the first generation to ensure they load instantly for all subsequent users, improving page speed and user experience.

### 🛠️ Technologies & Tools

* **Frontend:** React <!-- Add your specific framework like React, Vue, etc. if you used one -->
* **Backend:** Fast API
* **Database:** PostgreSQL <!-- Choose the one you used -->
* **Authentication:** JSON Web Tokens (JWT)
* **APIs:** Google Gemini API


### ⚙️ Local Installation & Setup

To get a local copy up and running, follow these simple steps.


#### Installation

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/Rpokhariya/NextRead.git](https://github.com/Rpokhariya/NextRead.git)
    cd NextRead
    ```

2.  **Install Backend Dependencies:**
    ```bash
    npm install
    ```

3.  **Install Frontend Dependencies (if you have a separate `client` folder):**
    ```bash
    cd client
    npm install
    cd ..
    ```

4.  **Create a `.env` file** in the root directory and add the necessary environment variables:
    ```env
    # Example .env file
    DATABASE_URL="your_postgresql_connection_string"
    JWT_SECRET="your_strong_and_secret_key_for_jwt"
    GEMINI_API_KEY="your_google_gemini_api_key"
    ```

5.  **Run the Development Server:**
    ```bash
    npm run dev  
    ```
    The application should now be available at `http://localhost:3000` (or your configured port).



