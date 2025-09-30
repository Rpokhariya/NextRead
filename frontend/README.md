# NextRead - Book Recommendation Frontend

A modern React-based web application for discovering and rating books with personalized recommendations.

## Features

- **Landing Page**: Browse popular books without authentication
- **User Authentication**: Sign up and login functionality
- **Goal Selection**: Choose reading goals for personalized recommendations
- **User Dashboard**:
  - View personalized book recommendations based on selected goals
  - Search books by title or author
  - Rate books (1-5 stars)
  - Browse popular books
  - Motivational reading quotes

## Tech Stack

- **React 18** with Vite
- **Material-UI (MUI)** for UI components
- **React Router DOM** for routing
- **Axios** for API calls
- **JWT** for authentication

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── BookCard.jsx    # Book display card with rating functionality
│   │   ├── Header.jsx      # Navigation header
│   │   └── SearchBar.jsx   # Book search component
│   ├── pages/              # Page components
│   │   ├── LandingPage.jsx        # Public home page (GET /books/popular)
│   │   ├── LoginPage.jsx          # Login page (POST /login)
│   │   ├── RegisterPage.jsx       # Sign up page (POST /register)
│   │   ├── GoalSelectionPage.jsx  # Goal selection (GET /goals, POST /users/me/goal)
│   │   └── UserDashboard.jsx      # Main dashboard (GET /users/me/recommendations, etc.)
│   ├── services/
│   │   └── api.js          # API service with all backend endpoints
│   ├── App.jsx             # Main app with routing
│   └── main.jsx            # Entry point
├── .env                     # Environment variables
└── package.json
```

## API Integration

The frontend communicates with the backend API through the following endpoints:

### Authentication
- `POST /register` - Register new user
- `POST /login` - Login and get JWT token

### Goals
- `GET /goals` - Fetch all available goals
- `POST /users/me/goal?goal_id={id}` - Set user goal (requires auth)

### Books
- `GET /books/popular` - Get popular books
- `GET /books/search?q={query}` - Search books by title/author
- `GET /books/{book_id}` - Get book details
- `POST /books/{book_id}/rate` - Rate a book (requires auth)
- `GET /users/me/recommendations` - Get personalized recommendations (requires auth)

## Setup and Installation

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Configure environment variables:
Create a `.env` file in the frontend directory:
```env
VITE_API_BASE_URL=http://localhost:8000
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Key Features Explained

### Authentication Flow
1. User registers via `/register` page
2. User logs in via `/login` page - receives JWT token stored in localStorage
3. Protected routes check for token presence
4. API interceptor automatically adds token to requests
5. Unauthorized requests (401) redirect to login

### Goal Selection
- Users must select at least 3 reading goals
- Selected goals are saved via multiple API calls
- After saving, user is redirected to dashboard

### Dashboard Features
- **Personalized Recommendations**: Books based on selected goals
- **Search**: Real-time search with results display
- **Popular Books**: Trending books section
- **Book Rating**: Modal dialog for rating books (1-5 stars)
- **Expandable Descriptions**: Click to view full book descriptions

### Responsive Design
- Mobile-first approach
- Grid layout adapts to screen size
- Touch-friendly interactions

## Component Details

### BookCard
- Displays book cover, title, author, rating
- Expandable description on click
- Optional rating button for authenticated users
- API Endpoint: Various (used across multiple pages)

### Header
- Shows app branding
- Authentication status (logged in/out)
- Login/Signup buttons or logout option
- User email display when authenticated

### SearchBar
- Real-time book search
- API Endpoint: `GET /books/search?q={query}`

## State Management

The application uses React hooks for state management:
- `useState` for component-level state
- `useEffect` for data fetching
- `useNavigate` for programmatic navigation
- localStorage for JWT token persistence

## Error Handling

- Loading states during API calls
- Error messages for failed requests
- Form validation feedback
- 401 errors trigger automatic logout

## Future Enhancements Ready

The frontend is built to be resilient to backend changes:
- API service layer abstracts endpoint details
- Components receive data as props
- No hard-coded business logic
- Easy to add new features without breaking existing functionality
