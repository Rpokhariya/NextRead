import React, { useRef, useMemo, useEffect, useCallback } from 'react';
import BookCard from './BookCard';

// This Arrow component is unchanged and correct.
const Arrow = ({ direction, onClick }) => {
  const directionClasses = direction === 'left' ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2';
  const icon = direction === 'left' ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
  );

  return (
    <button
      onClick={onClick}
      className={`absolute top-1/2 z-10 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${directionClasses}`}
      aria-label={direction === 'left' ? 'Scroll left' : 'Scroll right'}
    >
      {icon}
    </button>
  );
};

const BookCarousel = ({ books, user, onBookUpdate }) => {
    const scrollContainerRef = useRef(null);
    const isTransitioningRef = useRef(false);
    
    const canLoop = books.length > 5;
    const CLONE_COUNT = canLoop ? 5 : 0;

    const extendedBooks = useMemo(() => {
        if (!canLoop) return books;
        const firstClones = books.slice(0, CLONE_COUNT);
        const lastClones = books.slice(-CLONE_COUNT);
        return [...lastClones, ...books, ...firstClones];
    }, [books, canLoop, CLONE_COUNT]);
    
    // THE FIX IS IN THIS FUNCTION
    const handleLoop = useCallback(() => {
        if (!scrollContainerRef.current || isTransitioningRef.current) return;
        
        const el = scrollContainerRef.current;
        const cardWidth = el.firstChild.clientWidth + 32;

        // --- NEW FORWARD SCROLL LOGIC ---
        // This is more robust. It checks if the scrollbar is at the very end.
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) {
            isTransitioningRef.current = true;
            el.style.scrollBehavior = 'auto';
            el.scrollLeft = cardWidth * CLONE_COUNT;
        }
        // --- BACKWARD SCROLL LOGIC (UNCHANGED, AS IT WAS WORKING) ---
        else if (el.scrollLeft <= cardWidth * (CLONE_COUNT - 1)) {
            isTransitioningRef.current = true;
            el.style.scrollBehavior = 'auto';
            el.scrollLeft = cardWidth * (books.length + CLONE_COUNT - 1);
        }

        setTimeout(() => {
            isTransitioningRef.current = false;
            if(el.style.scrollBehavior === 'auto') {
              el.style.scrollBehavior = 'smooth';
            }
        }, 50);

    }, [books.length, CLONE_COUNT]);

    // This useEffect is unchanged and correct.
    useEffect(() => {
        if (!canLoop || !scrollContainerRef.current) return;
        const el = scrollContainerRef.current;
        const cardWidth = el.firstChild.clientWidth + 32;
        
        el.style.scrollBehavior = 'auto';
        el.scrollLeft = cardWidth * CLONE_COUNT;
        el.style.scrollBehavior = 'smooth';
    }, [books, canLoop, CLONE_COUNT]);


    const handleScroll = (direction) => {
        const el = scrollContainerRef.current;
        if (el && !isTransitioningRef.current) {
            const scrollAmount = el.clientWidth * 0.8;
            el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    // This fallback is unchanged and correct.
    if (!canLoop) {
      return (
          <div className="flex overflow-x-auto space-x-8 py-4 scrollbar-hide">
              {books.map(book => (
                  <div key={book.id} className="w-64 flex-shrink-0">
                      <BookCard book={book} user={user} onBookUpdate={onBookUpdate} />
                  </div>
              ))}
          </div>
      );
    }
    
    return (
        <div className="relative group">
            <Arrow direction="left" onClick={() => handleScroll('left')} />
            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto space-x-8 py-4 scrollbar-hide"
                onScroll={handleLoop}
            >
                {extendedBooks.map((book, index) => (
                    <div key={`${book.id}-${index}`} className="w-64 flex-shrink-0">
                        <BookCard book={book} user={user} onBookUpdate={onBookUpdate} />
                    </div>
                ))}
            </div>
            <Arrow direction="right" onClick={() => handleScroll('right')} />
        </div>
    );
};

export default BookCarousel;