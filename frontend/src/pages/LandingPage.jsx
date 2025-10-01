import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { booksAPI } from '../services/api';
import BookCard from '../components/BookCard';
import AuthModal from '../components/AuthModal';
import BookDetailModal from '../components/BookDetailModal'; // Import the detail modal

const quotes = [
    "A room without books is like a body without a soul.",
    "So many books, so little time...",
    "A reader lives a thousand lives before he dies.",
];

const LandingPage = () => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'signin' });
  const [popularBooks, setPopularBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- NEW STATE FOR SEARCH ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResultBook, setSearchResultBook] = useState(null);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Cycle through quotes
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(quoteInterval);
  }, []);

  // Fetch popular books from the backend
  useEffect(() => {
    const loadPopularBooks = async () => {
      setLoading(true);
      const result = await booksAPI.getPopular();
      if (result.success && result.data) {
        setPopularBooks(result.data);
      } else {
        toast.error('Could not fetch popular books. Please ensure the backend is running.');
        setPopularBooks([]);
      }
      setLoading(false);
    };
    loadPopularBooks();
  }, []);

  // --- NEW FUNCTION TO HANDLE SEARCH ---
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
        toast.info("Please enter a book title or author to search.");
        return;
    }
    setIsSearchLoading(true);
    const result = await booksAPI.search(searchQuery);
    if (result.success && result.data.length > 0) {
        // If books are found, show the detail modal for the first result
        setSearchResultBook(result.data[0]);
    } else if (result.success) {
        toast.info(`No books found for "${searchQuery}".`);
    } else {
        toast.error(result.error);
    }
    setIsSearchLoading(false);
  };

  return (
    <div className="bg-cream font-sans">
      {/* ... (Hero Section and Popular Books Section remain the same) ... */}
      <div className="relative h-[83vh] flex items-center justify-center text-white text-center px-4">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.pexels.com/photos/3747468/pexels-photo-3747468.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')" }}
        ></div>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cream to-transparent"></div>
        <div className="relative z-10 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-4 drop-shadow-lg">{quotes[currentQuoteIndex]}</h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto drop-shadow-md">
            Discover your next favorite book with personalized recommendations tailored to your reading goals.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setAuthModal({ isOpen: true, mode: 'signin' })}
              className="px-8 py-3 bg-golden text-navy font-semibold rounded-md hover:bg-yellow-500 transition-all shadow-lg transform hover:scale-105"
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthModal({ isOpen: true, mode: 'signup' })}
              className="px-8 py-3 bg-emerald text-white font-semibold rounded-md hover:bg-teal-700 transition-all shadow-lg transform hover:scale-105"
            >
              Get Recommendations
            </button>
          </div>
        </div>
      </div>
      <div className="py-20 px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold text-teal-800">Popular Books</h2>
          <p className="text-lg text-gray-600 mt-2">See what readers around the world are loving</p>
        </div>
        {loading ? (
           <div className="text-center py-12">
             <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-800"></div>
             <p className="mt-4 text-gray-600">Loading popular books...</p>
           </div>
        ) : (
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {popularBooks.slice(0, 4).map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
        <div className="text-center mt-12">
          <button 
            onClick={() => {
              if (user) {
                navigate('/dashboard');
              } else {
                setAuthModal({ isOpen: true, mode: 'signin' });
              }
            }}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-100 transition-colors font-sans"
          >
            View More Books
          </button>
        </div>
      </div>

      {/* Explore Section with updated functionality */}
      <div className="bg-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-serif font-bold text-navy">Explore Before You Join</h2>
            <p className="text-lg text-gray-600 mt-2 mb-8 font-sans">Try searching for books to see what NextRead can offer</p>
            <div className="flex items-center max-w-xl mx-auto shadow-md rounded-md">
                <input 
                    type="text"
                    placeholder="Search for any book..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full px-5 py-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-golden font-sans"
                />
                <button 
                    onClick={handleSearch}
                    disabled={isSearchLoading}
                    className="px-6 py-3 bg-golden text-navy font-semibold rounded-r-md hover:bg-yellow-500 transition-colors disabled:opacity-50"
                >
                    {isSearchLoading ? '...' : 'Search'}
                </button>
            </div>
            <p className="text-gray-600 mt-6 font-sans">
                Want personalized recommendations? <a href="#" onClick={(e) => { e.preventDefault(); setAuthModal({ isOpen: true, mode: 'signup' }); }} className="text-emerald font-semibold hover:underline">Create a free account</a>
            </p>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="text-center py-10 bg-cream">
        <p className="text-navy font-serif text-2xl mb-1">NextRead</p>
        <p className="text-gray-500 font-sans">Your personalized book recommendation companion</p>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        defaultMode={authModal.mode}
      />
      {/* This will render the detail modal when a book is found by the search */}
      {searchResultBook && (
        <BookDetailModal 
            book={searchResultBook}
            onClose={() => setSearchResultBook(null)}
        />
      )}
    </div>
  );
};

export default LandingPage;