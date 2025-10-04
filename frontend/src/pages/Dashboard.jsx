import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { authAPI, goalsAPI, booksAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import BookCard from '../components/BookCard';
import BookDetailModal from '../components/BookDetailModal';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const [searchResults, setSearchResults] = useState(null);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // const [selectedBook, setSelectedBook] = useState(null);
  
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [userGoals, setUserGoals] = useState([]);
  const [allGoals, setAllGoals] = useState([]);
  const [isGoalsLoading, setIsGoalsLoading] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    if (!user.hasCompletedGoals) { navigate('/goals'); return; }
    loadDashboardData();
  }, [user, navigate]);

  useEffect(() => {
    if (showGoalsModal) {
      const fetchGoalsData = async () => {
        setIsGoalsLoading(true);
        const [userResult, allGoalsResult] = await Promise.all([
          authAPI.getCurrentUser(),
          goalsAPI.getAll()
        ]);
        if (userResult.success) setUserGoals(userResult.data.goals || []);
        else toast.error("Could not fetch your current goals.");
        if (allGoalsResult.success) setAllGoals(allGoalsResult.data || []);
        else toast.error("Could not fetch available goals.");
        setIsGoalsLoading(false);
      };
      fetchGoalsData();
    }
  }, [showGoalsModal]);

  const handleBookUpdate = (updatedBook) => {
      const updater = (books) => books.map(b => b.id === updatedBook.id ? updatedBook : b);
      
      setRecommendedBooks(prev => updater(prev));
      setPopularBooks(prev => updater(prev));
      setSearchResults(prev => prev ? updater(prev) : null);
  };

  const loadDashboardData = async () => {
    setLoading(true);
    const [recommendedResult, popularResult] = await Promise.all([
      booksAPI.getRecommendations(),
      booksAPI.getPopular()
    ]);
    if (recommendedResult.success) setRecommendedBooks(recommendedResult.data);
    else {
      toast.warning('No personalized recommendations available yet, update your goals ');
      setRecommendedBooks([]);
    }
    if (popularResult.success) setPopularBooks(popularResult.data);
    else setPopularBooks([]);
    setLoading(false);
  };

  const handleSearch = async (query) => {
    const result = await booksAPI.search(query);
    if (result.success) {
      setSearchResults(result.data.length > 0 ? result.data : []);
      toast.info(result.data.length > 0 ? `Found ${result.data.length} book(s)` : 'No books found');
    } else {
      toast.error('Search failed. Please try again.');
    }
  };

  const clearSearch = () => setSearchResults(null);

  const handleAddGoal = async (goalId) => {
    const result = await goalsAPI.addGoal(goalId);
    if (result.success) {
      const newGoal = allGoals.find(g => g.id === goalId);
      if (newGoal) {
        toast.success(`'${newGoal.name}' added to your goals!`);
        setUserGoals(prev => [...prev, newGoal]);
      }
    } else {
      toast.error(result.error || "Failed to add goal.");
    }
  };

  const handleRemoveGoal = async (goalId) => {
    const goalToRemove = userGoals.find(g => g.id === goalId);
    const result = await goalsAPI.deleteGoal(goalId);
    if (result.success && goalToRemove) {
      toast.success(`'${goalToRemove.name}' removed from your goals.`);
      setUserGoals(prev => prev.filter(g => g.id !== goalId));
    } else {
      toast.error(result.error || "Failed to remove goal.");
    }
  };

  const closeGoalsModal = () => {
    setShowGoalsModal(false);
    loadDashboardData();
  };

  const managedGoalsList = useMemo(() => {
    const userGoalIds = new Set(userGoals.map(g => g.id));
    return allGoals.map(goal => ({
      ...goal,
      isActive: userGoalIds.has(goal.id)
    }));
  }, [allGoals, userGoals]);

  const handleStartSearchingClick = () => {
    // Scroll to search bar with offset for sticky header
    const headerEl = document.querySelector('header');
    let headerHeight = headerEl ? headerEl.offsetHeight : 0;
    if (searchRef.current) {
      const y = searchRef.current.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setTimeout(() => {
        const input = searchRef.current.querySelector('input');
        input?.focus();
      }, 500);
    }
  };

  if (!user) return null;

  if (loading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <Header />
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald mb-4"></div>
        <p className="text-gray-600 font-sans">Loading your recommendations...</p>
      </div>
    </div>
  );

const renderBookGrid = (books) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
    {books.map((book) => (
      <BookCard 
        key={book.id} 
        book={book} 
        onBookUpdate={handleBookUpdate} 
      />
    ))}
  </div>
);

  return (
    <div className="min-h-screen bg-cream font-sans">
      <Header />
<div className="container mx-auto px-4 pt-6 pb-8">
  {/* Welcome & Update Goals section in a rounded light cream box */}
  <div className="mb-6 rounded-2xl bg-lightcream px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow">
    <div>
      <h1 className="font-serif text-2xl font-bold text-navy mb-1">Welcome back!</h1>
      <p className="text-gray-600 font-sans">Continue your reading journey.</p>
    </div>
    <button
      onClick={() => setShowGoalsModal(true)}
      className="px-6 py-2 bg-emerald text-white font-semibold rounded-md hover:bg-teal-700 transition-all shadow-md"
    >
      Update Goals
    </button>
  </div>

  {/* Search & Discover heading */}
<h2 className="font-serif text-3xl font-bold text-navy mb-4 mt-16 text-center">
  Search & Discover
</h2>

  {/* Search bar */}
  <div ref={searchRef} className="mb-24">
    <SearchBar onSearch={handleSearch} />
  </div>

        {searchResults ? (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-3xl font-bold text-navy">
                Search Results ({searchResults.length})
              </h2>
              <button
                onClick={clearSearch}
                className="text-sm text-gray-600 hover:text-navy font-semibold transition-colors"
              >
                &larr; Back to Recommendations
              </button>
            </div>
            {renderBookGrid(searchResults)}
          </div>
        ) : (
          <>
            {recommendedBooks.length > 0 && (
              <div className="mb-12">
                <h2 className="font-serif text-3xl font-bold text-navy mb-6">
                  Recommended for You
                </h2>
                {renderBookGrid(recommendedBooks, )}
              </div>
            )}
            {popularBooks.length > 0 && (
              <div className="mb-12">
                <h2 className="font-serif text-3xl font-bold text-navy mb-6">
                  Popular Right Now
                </h2>
                {renderBookGrid(popularBooks.slice(0,10))}
              </div>
            )}

            <div className="my-16">
              <div className="bg-lightcream rounded-lg shadow-lg p-12 text-center">
                                <div className="flex justify-center mb-4">
                  <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeLinecap="round" />
                  </svg>
                </div>
                <h2 className="font-serif text-3xl font-bold text-navy mb-3">

                  Can't Find What You're Looking For?
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto mb-8 font-sans">
                  Search our entire collection of books to discover your next favorite read.
                </p>
                <button
                  onClick={handleStartSearchingClick}
                  className="px-8 py-3 bg-golden text-navy font-semibold rounded-md hover:bg-yellow-500 transition-all shadow-md"
                >
                  Start Searching
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showGoalsModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
          onClick={closeGoalsModal}
        >
          <div
            className="bg-cream rounded-lg shadow-2xl max-w-lg w-full p-6 relative animate-slide-up-fast"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeGoalsModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="pt-8">
              {isGoalsLoading ? (
                <div className="text-center p-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald"></div>
                </div>
              ) : (
                <>
                  <h2 className="font-serif text-2xl font-bold text-navy mb-4 text-center">
                    Manage Your Goals
                  </h2>
                  <p className="text-gray-600 mb-6 text-center font-sans">
                    Select your interests to get personalized recommendations.
                  </p>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                    {managedGoalsList.length > 0 ? (
                      managedGoalsList.map((goal) => (
                        <div
                          key={goal.id}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                        >
                          <span className="text-navy font-sans">{goal.name}</span>
                          {goal.isActive ? (
                            <button
                              onClick={() => handleRemoveGoal(goal.id)}
                              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-sans font-semibold"
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAddGoal(goal.id)}
                              className="px-3 py-1 text-sm bg-emerald text-white rounded-md hover:bg-teal-700 transition-colors font-sans font-semibold"
                            >
                              Add
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4 font-sans">
                        No goals available to select.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* {selectedBook && (
        <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />
      )} */}
    </div>
  );
};

export default Dashboard;