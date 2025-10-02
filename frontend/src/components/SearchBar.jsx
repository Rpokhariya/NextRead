import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // if (query.trim()) {
      onSearch(query);
    // }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex items-center w-full bg-white rounded-full shadow-lg border border-gray-200/75">
        {/* Magnifying Glass Icon */}
        <div className="pl-5 pr-2 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Input Field */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for any book..."
          className="w-full flex-grow bg-transparent text-lg text-gray-700 placeholder-gray-400 border-none focus:outline-none focus:ring-0 py-4"
        />

        {/* Search Button */}
        <button
          type="submit"
          className="px-8 py-4 bg-yellow-500 text-gray-900 font-semibold rounded-full hover:bg-yellow-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;