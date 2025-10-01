import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import BookCard from '../components/BookCard';
import SearchBar from '../components/SearchBar';

const mockSpotlightBook = {
  id: 'spotlight',
  title: "Project Hail Mary",
  author: "Andy Weir",
  rating: "4.9",
  cover: "https://images.pexels.com/photos/2908984/pexels-photo-2908984.jpeg",
  tagline: "A lone astronaut must save humanity",
  description: "Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the earth itself will perish.",
  genre: "Science Fiction, Thriller, Adventure"
};

const mockRecommendedBooks = [
  {
    id: 'r1',
    title: "The Psychology of Money",
    author: "Morgan Housel",
    rating: "4.7",
    cover: "https://images.pexels.com/photos/3943723/pexels-photo-3943723.jpeg",
    tagline: "Timeless lessons on wealth"
  },
  {
    id: 'r2',
    title: "Educated",
    author: "Tara Westover",
    rating: "4.6",
    cover: "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg",
    tagline: "A memoir of transformation"
  },
  {
    id: 'r3',
    title: "The Power of Now",
    author: "Eckhart Tolle",
    rating: "4.5",
    cover: "https://images.pexels.com/photos/1853542/pexels-photo-1853542.jpeg",
    tagline: "Spiritual enlightenment guide"
  },
  {
    id: 'r4',
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    rating: "4.6",
    cover: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg",
    tagline: "How we make decisions"
  },
  {
    id: 'r5',
    title: "The Alchemist",
    author: "Paulo Coelho",
    rating: "4.4",
    cover: "https://images.pexels.com/photos/1242348/pexels-photo-1242348.jpeg",
    tagline: "Follow your dreams"
  }
];

const mockPopularBooks = [
  {
    id: 'p1',
    title: "It Ends with Us",
    author: "Colleen Hoover",
    rating: "4.5",
    cover: "https://images.pexels.com/photos/2228570/pexels-photo-2228570.jpeg"
  },
  {
    id: 'p2',
    title: "The Thursday Murder Club",
    author: "Richard Osman",
    rating: "4.6",
    cover: "https://images.pexels.com/photos/2228553/pexels-photo-2228553.jpeg"
  },
  {
    id: 'p3',
    title: "Verity",
    author: "Colleen Hoover",
    rating: "4.5",
    cover: "https://images.pexels.com/photos/3358707/pexels-photo-3358707.jpeg"
  },
  {
    id: 'p4',
    title: "The Four Winds",
    author: "Kristin Hannah",
    rating: "4.7",
    cover: "https://images.pexels.com/photos/2558605/pexels-photo-2558605.jpeg"
  },
  {
    id: 'p5',
    title: "Circe",
    author: "Madeline Miller",
    rating: "4.6",
    cover: "https://images.pexels.com/photos/2333394/pexels-photo-2333394.jpeg"
  }
];

const readingTips = [
  "Read 20 pages before bed for better sleep",
  "Try alternating between fiction and non-fiction",
  "Keep a reading journal to track your thoughts",
  "Join a book club to discover new perspectives",
  "Set a realistic reading goal for the month"
];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState(null);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [readingStreak, setReadingStreak] = useState(7);
  const [dailyTip, setDailyTip] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    if (!user.hasCompletedGoals) {
      navigate('/goals');
    }

    const tip = readingTips[Math.floor(Math.random() * readingTips.length)];
    setDailyTip(tip);
  }, [user, navigate]);

  const handleSearch = (query) => {
    const mockResults = [
      {
        id: 's1',
        title: query,
        author: "Search Result Author",
        rating: "4.5",
        cover: "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg"
      },
      ...mockRecommendedBooks.slice(0, 6)
    ];
    setSearchResults(mockResults);
  };

  const clearSearch = () => {
    setSearchResults(null);
  };

  const toggleWishlist = (bookId) => {
    setWishlist((prev) =>
      prev.includes(bookId)
        ? prev.filter((id) => id !== bookId)
        : [...prev, bookId]
    );
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-serif text-4xl font-bold text-gray-800 dark:text-white mb-2">
              Welcome back, {user.name}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Continue your reading journey
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Reading Streak</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {readingStreak} days
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowGoalsModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg hover:from-emerald-700 hover:to-blue-700 transition-all shadow-md"
            >
              Update Goals
            </button>
          </div>
        </div>

        {dailyTip && (
          <div className="mb-8 bg-gradient-to-r from-emerald-100 to-blue-100 dark:from-emerald-900 dark:to-blue-900 rounded-lg p-4 shadow-md animate-fade-in">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="font-medium text-gray-800 dark:text-white mb-1">Daily Reading Tip</p>
                <p className="text-gray-700 dark:text-gray-300">{dailyTip}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        {searchResults ? (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-3xl font-bold text-gray-800 dark:text-white">
                Search Results & Similar Books
              </h2>
              <button
                onClick={clearSearch}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {searchResults.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-12">
              <h2 className="font-serif text-3xl font-bold text-gray-800 dark:text-white mb-6">
                Today's Spotlight
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3">
                    <img
                      src={mockSpotlightBook.cover}
                      alt={mockSpotlightBook.title}
                      className="w-full h-96 object-cover"
                    />
                  </div>
                  <div className="md:w-2/3 p-8">
                    <h3 className="font-serif text-4xl font-bold text-gray-800 dark:text-white mb-3">
                      {mockSpotlightBook.title}
                    </h3>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
                      {mockSpotlightBook.author}
                    </p>
                    <div className="flex items-center mb-4">
                      <span className="text-yellow-500 text-3xl">★</span>
                      <span className="ml-2 text-2xl font-medium text-gray-700 dark:text-gray-200">
                        {mockSpotlightBook.rating}
                      </span>
                    </div>
                    <p className="text-emerald-600 dark:text-emerald-400 italic mb-4 text-lg">
                      {mockSpotlightBook.tagline}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                      {mockSpotlightBook.description}
                    </p>
                    <button
                      onClick={() => toggleWishlist(mockSpotlightBook.id)}
                      className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        wishlist.includes(mockSpotlightBook.id)
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white hover:from-emerald-700 hover:to-blue-700'
                      }`}
                    >
                      {wishlist.includes(mockSpotlightBook.id) ? '❤️ In Wishlist' : '+ Add to Wishlist'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="font-serif text-3xl font-bold text-gray-800 dark:text-white mb-6">
                Recommended for You
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {mockRecommendedBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </div>

            <div className="mb-12">
              <h2 className="font-serif text-3xl font-bold text-gray-800 dark:text-white mb-6">
                Popular Right Now
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {mockPopularBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </div>

            {wishlist.length > 0 && (
              <div className="mb-12">
                <h2 className="font-serif text-3xl font-bold text-gray-800 dark:text-white mb-6">
                  My Wishlist
                </h2>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                  <p className="text-gray-700 dark:text-gray-300">
                    You have {wishlist.length} book{wishlist.length !== 1 ? 's' : ''} in your wishlist
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showGoalsModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowGoalsModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-serif text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Update Your Goals
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Want to change your reading preferences?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowGoalsModal(false);
                  navigate('/goals');
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg hover:from-emerald-700 hover:to-blue-700 transition-all"
              >
                Go to Goals
              </button>
              <button
                onClick={() => setShowGoalsModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
