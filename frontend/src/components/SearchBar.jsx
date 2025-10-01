import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto mb-8">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for books..."
          className="w-full px-6 py-4 rounded-full border-2 border-gray-300 dark:border-gray-600 focus:border-emerald-500 focus:outline-none dark:bg-gray-800 dark:text-white shadow-lg"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-full hover:from-emerald-700 hover:to-blue-700 transition-all"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
