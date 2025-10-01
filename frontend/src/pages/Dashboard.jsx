import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { booksAPI } from '../services/api';
import Header from '../components/Header';
import BookCard from '../components/BookCard';
import SearchBar from '../components/SearchBar';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState(null);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [spotlightBook, setSpotlightBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedBookForRating, setSelectedBookForRating] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    if (!user.hasCompletedGoals) {
      navigate('/goals');
      return;
    }

    loadDashboardData();
  }, [user, navigate]);

  const loadDashboardData = async () => {
    setLoading(true);

    const [recommendedResult, popularResult] = await Promise.all([
      booksAPI.getRecommendations(),
      booksAPI.getPopular()
    ]);

    if (recommendedResult.success && recommendedResult.data.length > 0) {
      setRecommendedBooks(recommendedResult.data);
      setSpotlightBook(recommendedResult.data[0]);
    } else {
      toast.warning('No personalized recommendations available yet');
      setRecommendedBooks([]);
    }

    if (popularResult.success && popularResult.data.length > 0) {
      setPopularBooks(popularResult.data);
      if (!spotlightBook && popularResult.data.length > 0) {
        setSpotlightBook(popularResult.data[0]);
      }
    } else {
      setPopularBooks([]);
    }

    setLoading(false);
  };

  const handleSearch = async (query) => {
    const result = await booksAPI.search(query);

    if (result.success) {
      if (result.data.length > 0) {
        setSearchResults(result.data);
        toast.success(`Found ${result.data.length} book(s)`);
      } else {
        toast.info('No books found for your search');
        setSearchResults([]);
      }
    } else {
      toast.error('Search failed. Please try again.');
    }
  };

  const clearSearch = () => {
    setSearchResults(null);
  };

  const openRatingModal = (book) => {
    setSelectedBookForRating(book);
    setRating(0);
    setHoverRating(0);
    setShowRatingModal(true);
  };

  const closeRatingModal = () => {
    setShowRatingModal(false);
    setSelectedBookForRating(null);
    setRating(0);
    setHoverRating(0);
  };

  const submitRating = async () => {
    if (!rating || !selectedBookForRating) {
      toast.warning('Please select a rating');
      return;
    }

    const result = await booksAPI.rate(selectedBookForRating.id, rating);

    if (result.success) {
      toast.success('Thank you for rating!');
      closeRatingModal();
      loadDashboardData();
    } else {
      toast.error(result.error || 'Failed to submit rating');
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your recommendations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-serif text-4xl font-bold text-gray-800 dark:text-white mb-2">
              Welcome back!
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Continue your reading journey
            </p>
          </div>

          <button
            onClick={() => setShowGoalsModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg hover:from-emerald-700 hover:to-blue-700 transition-all shadow-md"
          >
            Update Goals
          </button>
        </div>

        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        {searchResults ? (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-3xl font-bold text-gray-800 dark:text-white">
                Search Results ({searchResults.length})
              </h2>
              <button
                onClick={clearSearch}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Clear Search
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {searchResults.map((book) => (
                <div key={book.id}>
                  <BookCard book={book} />
                  <button
                    onClick={() => openRatingModal(book)}
                    className="mt-2 w-full px-3 py-1 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                  >
                    Rate Book
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {spotlightBook && (
              <div className="mb-12">
                <h2 className="font-serif text-3xl font-bold text-gray-800 dark:text-white mb-6">
                  Today's Spotlight
                </h2>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3">
                      <img
                        src={spotlightBook.cover_image_url || 'https://via.placeholder.com/300x400?text=No+Cover'}
                        alt={spotlightBook.title}
                        className="w-full h-96 object-cover"
                      />
                    </div>
                    <div className="md:w-2/3 p-8">
                      <h3 className="font-serif text-4xl font-bold text-gray-800 dark:text-white mb-3">
                        {spotlightBook.title}
                      </h3>
                      <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
                        {spotlightBook.author || 'Unknown Author'}
                      </p>
                      <div className="flex items-center mb-4">
                        <span className="text-yellow-500 text-3xl">★</span>
                        <span className="ml-2 text-2xl font-medium text-gray-700 dark:text-gray-200">
                          {spotlightBook.average_rating?.toFixed(1) || 'N/A'}
                        </span>
                        {spotlightBook.ratings_count && (
                          <span className="ml-2 text-gray-500 dark:text-gray-400">
                            ({spotlightBook.ratings_count} ratings)
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        {spotlightBook.description || 'A must-read book that will captivate your imagination.'}
                      </p>
                      <button
                        onClick={() => openRatingModal(spotlightBook)}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg hover:from-emerald-700 hover:to-blue-700 transition-all font-medium"
                      >
                        Rate This Book
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {recommendedBooks.length > 0 && (
              <div className="mb-12">
                <h2 className="font-serif text-3xl font-bold text-gray-800 dark:text-white mb-6">
                  Recommended for You
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {recommendedBooks.slice(1).map((book) => (
                    <div key={book.id}>
                      <BookCard book={book} />
                      <button
                        onClick={() => openRatingModal(book)}
                        className="mt-2 w-full px-3 py-1 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                      >
                        Rate Book
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {popularBooks.length > 0 && (
              <div className="mb-12">
                <h2 className="font-serif text-3xl font-bold text-gray-800 dark:text-white mb-6">
                  Popular Right Now
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {popularBooks.map((book) => (
                    <div key={book.id}>
                      <BookCard book={book} />
                      <button
                        onClick={() => openRatingModal(book)}
                        className="mt-2 w-full px-3 py-1 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                      >
                        Rate Book
                      </button>
                    </div>
                  ))}
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
            <button
              onClick={() => setShowGoalsModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
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

      {showRatingModal && selectedBookForRating && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={closeRatingModal}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeRatingModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="font-serif text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Rate "{selectedBookForRating.title}"
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              How would you rate this book?
            </p>
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <svg
                    className={`w-12 h-12 ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-500 fill-current'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                    fill={star <= (hoverRating || rating) ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <button
                onClick={submitRating}
                disabled={!rating}
                className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                  rating
                    ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white hover:from-emerald-700 hover:to-blue-700'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                Submit Rating
              </button>
              <button
                onClick={closeRatingModal}
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
