import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { booksAPI } from '../services/api';
import BookCard from '../components/BookCard';
import AuthModal from '../components/AuthModal';

const quotes = [
  "So many books, so little time.",
  "A reader lives a thousand lives before he dies.",
  "Books are a uniquely portable magic.",
  "There is no friend as loyal as a book.",
  "Reading is dreaming with open eyes."
];

const placeholderBooks = [
  {
    id: 1,
    title: "The Midnight Library",
    author: "Matt Haig",
    average_rating: 4.5,
    cover_image_url: "https://images.pexels.com/photos/1125026/pexels-photo-1125026.jpeg",
    description: "Between life and death there is a library."
  },
  {
    id: 2,
    title: "Atomic Habits",
    author: "James Clear",
    average_rating: 4.8,
    cover_image_url: "https://images.pexels.com/photos/1907785/pexels-photo-1907785.jpeg",
    description: "An easy and proven way to build good habits."
  },
  {
    id: 3,
    title: "Educated",
    author: "Tara Westover",
    average_rating: 4.6,
    cover_image_url: "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg",
    description: "A memoir of transformation."
  }
];

const LandingPage = () => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'signin' });
  const [searchQuery, setSearchQuery] = useState('');
  const [showGuestMode, setShowGuestMode] = useState(false);
  const [popularBooks, setPopularBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadPopularBooks();
  }, []);

  const loadPopularBooks = async () => {
    setLoading(true);
    const result = await booksAPI.getPopular();

    if (result.success && result.data.length > 0) {
      setPopularBooks(result.data);
    } else {
      setPopularBooks(placeholderBooks);
      if (!result.success) {
        toast.warning('Using sample books. Backend may not be running.');
      }
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowGuestMode(true);
    }
  };

  const handleBackToHome = () => {
    setShowGuestMode(false);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {!showGuestMode && (
          <div className="min-h-screen flex flex-col items-center justify-center text-center">
            <div className="mb-12 animate-fade-in">
              <h1 className="font-serif text-6xl md:text-7xl font-bold text-gray-800 dark:text-white mb-6">
                NextRead
              </h1>
              <div className="h-20 flex items-center justify-center">
                <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 italic animate-slide-up">
                  "{quotes[currentQuoteIndex]}"
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-slide-up">
              <button
                onClick={() => setAuthModal({ isOpen: true, mode: 'signin' })}
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthModal({ isOpen: true, mode: 'signup' })}
                className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-2 border-emerald-600 rounded-lg font-medium hover:bg-emerald-50 dark:hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl"
              >
                Get Started
              </button>
            </div>

            <div className="mb-16 w-full max-w-2xl animate-fade-in">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Explore books without signing up..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 rounded-full border-2 border-gray-300 dark:border-gray-600 focus:border-emerald-500 focus:outline-none dark:bg-gray-800 dark:text-white shadow-lg"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-full hover:from-emerald-700 hover:to-blue-700 transition-all"
                >
                  Explore
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-4xl font-bold text-gray-800 dark:text-white">
              Popular Books
            </h2>
            {showGuestMode && (
              <button
                onClick={handleBackToHome}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading books...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {popularBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}

          {showGuestMode && (
            <div className="mt-12 text-center">
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                Want personalized recommendations?
              </p>
              <button
                onClick={() => setAuthModal({ isOpen: true, mode: 'signup' })}
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                Sign Up Now
              </button>
            </div>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        defaultMode={authModal.mode}
      />
    </div>
  );
};

export default LandingPage;
