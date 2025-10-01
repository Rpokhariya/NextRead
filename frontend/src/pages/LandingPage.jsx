import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BookCard from '../components/BookCard';
import AuthModal from '../components/AuthModal';

const quotes = [
  "So many books, so little time.",
  "A reader lives a thousand lives before he dies.",
  "Books are a uniquely portable magic.",
  "There is no friend as loyal as a book.",
  "Reading is dreaming with open eyes."
];

const mockPopularBooks = [
  {
    id: 1,
    title: "The Midnight Library",
    author: "Matt Haig",
    rating: "4.5",
    cover: "https://images.pexels.com/photos/1125026/pexels-photo-1125026.jpeg",
    tagline: "Infinite lives, infinite possibilities",
    description: "Between life and death there is a library, and within that library, the shelves go on forever."
  },
  {
    id: 2,
    title: "Atomic Habits",
    author: "James Clear",
    rating: "4.8",
    cover: "https://images.pexels.com/photos/1907785/pexels-photo-1907785.jpeg",
    tagline: "Transform your life one habit at a time",
    description: "An easy and proven way to build good habits and break bad ones."
  },
  {
    id: 3,
    title: "The Seven Husbands of Evelyn Hugo",
    author: "Taylor Jenkins Reid",
    rating: "4.7",
    cover: "https://images.pexels.com/photos/2067569/pexels-photo-2067569.jpeg",
    tagline: "A legendary story of Hollywood glamour",
    description: "Aging Hollywood icon Evelyn Hugo finally reveals her scandalous past."
  },
  {
    id: 4,
    title: "Dune",
    author: "Frank Herbert",
    rating: "4.6",
    cover: "https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg",
    tagline: "The greatest science fiction novel ever",
    description: "Set in the distant future amidst a feudal interstellar society."
  },
  {
    id: 5,
    title: "Where the Crawdads Sing",
    author: "Delia Owens",
    rating: "4.5",
    cover: "https://images.pexels.com/photos/256450/pexels-photo-256450.jpeg",
    tagline: "A haunting tale of the forgotten",
    description: "For years, rumors of the Marsh Girl have haunted Barkley Cove."
  },
  {
    id: 6,
    title: "The Silent Patient",
    author: "Alex Michaelides",
    rating: "4.4",
    cover: "https://images.pexels.com/photos/2383009/pexels-photo-2383009.jpeg",
    tagline: "The shocking psychological thriller",
    description: "Alicia Berenson hasn't spoken a single word since killing her husband."
  }
];

const LandingPage = () => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'signin' });
  const [searchQuery, setSearchQuery] = useState('');
  const [showGuestMode, setShowGuestMode] = useState(false);
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowGuestMode(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
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

          {!showGuestMode && (
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
          )}
        </div>

        <div className="py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-4xl font-bold text-gray-800 dark:text-white">
              Popular Books
            </h2>
            {showGuestMode && (
              <button
                onClick={() => setShowGuestMode(false)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {mockPopularBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

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
