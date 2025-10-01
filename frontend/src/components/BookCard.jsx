import React, { useState } from 'react';

const BookCard = ({ book, size = 'normal' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer ${
          size === 'large' ? 'h-auto' : 'h-80'
        }`}
        onClick={() => setIsExpanded(true)}
      >
        <div className={size === 'large' ? 'h-80' : 'h-48'}>
          <img
            src={book.cover_image_url || book.cover || 'https://via.placeholder.com/300x400?text=No+Cover'}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="font-serif text-lg font-bold text-gray-800 dark:text-white line-clamp-2 mb-1">
            {book.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{book.author || 'Unknown Author'}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-yellow-500">★</span>
              <span className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                {book.average_rating?.toFixed(1) || book.rating || 'N/A'}
              </span>
              {book.ratings_count && (
                <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                  ({book.ratings_count})
                </span>
              )}
            </div>
            {book.tagline && (
              <span className="text-xs text-gray-500 dark:text-gray-400 italic line-clamp-1">
                {book.tagline}
              </span>
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsExpanded(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <button
                onClick={() => setIsExpanded(false)}
                className="absolute top-4 right-4 z-10 bg-gray-800 bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3">
                  <img
                    src={book.cover_image_url || book.cover || 'https://via.placeholder.com/300x400?text=No+Cover'}
                    alt={book.title}
                    className="w-full h-96 object-cover"
                  />
                </div>
                <div className="md:w-2/3 p-6">
                  <h2 className="font-serif text-3xl font-bold text-gray-800 dark:text-white mb-2">
                    {book.title}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">{book.author || 'Unknown Author'}</p>
                  <div className="flex items-center mb-4">
                    <span className="text-yellow-500 text-2xl">★</span>
                    <span className="ml-2 text-xl font-medium text-gray-700 dark:text-gray-200">
                      {book.average_rating?.toFixed(1) || book.rating || 'N/A'}
                    </span>
                    {book.ratings_count && (
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                        ({book.ratings_count} ratings)
                      </span>
                    )}
                  </div>
                  {book.tagline && (
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 italic mb-4">
                      {book.tagline}
                    </p>
                  )}
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {book.description || 'A captivating story that will take you on an unforgettable journey through pages filled with imagination and wonder.'}
                  </p>
                  {book.genre && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {book.genre.split(',').map((g, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 rounded-full text-xs"
                        >
                          {g.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookCard;
