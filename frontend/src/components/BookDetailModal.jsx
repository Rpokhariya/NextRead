import React, { useState } from 'react';
import { toast } from 'react-toastify'; // CORRECTED: Using react-toastify to match your project
import { booksAPI } from '../services/api';
import placeholderImg from '../assets/placeholder_img.jpg';

// --- Helper Icons remain the same ---
const StarIcon = ({ className = "w-5 h-5 text-golden" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.955a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.366 2.446a1 1 0 00-.364 1.118l1.287 3.955c.3.921-.755 1.688-1.54 1.118l-3.366-2.446a1 1 0 00-1.175 0l-3.366 2.446c-.784.57-1.838-.197-1.54-1.118l1.287-3.955a1 1 0 00-.364-1.118L2.08 9.382c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
    </svg>
);
const UsersIcon = () => (
    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
);


// --- New StarRating component using the correct toast library ---
const StarRating = ({ bookId, user, onBookUpdate, userRating }) => {
    const [rating, setRating] = useState(userRating || 0);
    const [hover, setHover] = useState(0);
    const [isRated, setIsRated] = useState(!!userRating);

    const handleRating = async (rateValue) => {
        if (!user) {
            toast.info("Please log in to rate books.");
            return; 
        }

        if (isRated) {
            toast.error("You have already submitted a rating.");
            return;
        }
        const response = await booksAPI.rate(bookId, rateValue);
        if (response.success) {
            setRating(rateValue);
            setIsRated(true);
            toast.success(`Thank you for rating this book ${rateValue} stars!`);

            if (onBookUpdate) {
                onBookUpdate(response.data);
            }
        } else {
            toast.error(response.error);
            if (response.error.includes("already rated")) {
                setIsRated(true);
            }
        }
    };

    // NEW: A clear variable to control the disabled state.
    const isDisabled = isRated || !user;

    return (
        <div className="mt-8">
            {/* CHANGED: The title now changes if the user is not logged in. */}
            <h3 className="text-lg font-bold text-navy mb-3 font-sans text-center sm:text-left">
                {isRated ? "Thank you for your rating!" : (user ? "Rate this book" : "Log in to rate this book")}
            </h3>
            <div className="flex items-center justify-center sm:justify-start space-x-1">
                {[...Array(5)].map((_, index) => {
                    const starValue = index + 1;
                    return (
                        <button
                            key={starValue}
                            // CHANGED: Button is disabled if rated OR if there's no user.
                            disabled={isDisabled} 
                            onClick={() => handleRating(starValue)}
                            onMouseEnter={() => !isDisabled && setHover(starValue)}
                            onMouseLeave={() => setHover(0)}
                            // CHANGED: Hover effect is disabled for guests.
                            className={`transition-transform duration-150 ease-in-out ${!isDisabled ? 'hover:scale-125' : ''}`}
                        >
                            <StarIcon 
                                // CHANGED: The cursor is 'not-allowed' for guests.
                                className={`w-8 h-8 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${
                                    starValue <= (hover || rating) ? 'text-golden' : 'text-gray-300'
                                }`}
                            />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};


const BookDetailModal = ({ book, isLoading, onClose ,user,onBookUpdate }) => {
    const formatRatingsCount = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'm';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return num;
    };
    
    const renderContent = () => {
        if (isLoading || !book) {
            return (
                <div className="flex items-center justify-center h-96">
                    <p className="text-navy font-semibold">Loading details...</p>
                </div>
            );
        }
        const placeholderSeededUrl = "https://placehold.co/200x300?text=Not+Found";
        const imageUrl = 
            book.cover_image_url && book.cover_image_url !== placeholderSeededUrl
                ? book.cover_image_url
                : placeholderImg;
                
        return (
            <>
                <div className="flex flex-col sm:flex-row gap-8">
                    <img 
                        src={imageUrl} 
                        alt={`Cover for ${book.title}`}
                        className="w-40 h-60 object-cover rounded-md shadow-lg flex-shrink-0 mx-auto sm:mx-0"
                    />
                    <div className="flex flex-col text-center sm:text-left">
                        <h2 className="text-3xl font-serif font-bold text-navy">{book.title}</h2>
                        <p className="text-md text-gray-500 mt-1 mb-3 font-sans">{book.author}</p>
                        <div className="flex items-center gap-4 justify-center sm:justify-start">
                            <div className="flex items-center gap-2">
                                <StarIcon className="w-5 h-5 text-golden" />
                                <span className="text-lg text-gray-700 font-semibold font-sans">{book.average_rating?.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <UsersIcon />
                                <span className="text-lg text-gray-700 font-semibold font-sans">
                                    {formatRatingsCount(book.ratings_count)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-bold text-navy mb-2 font-sans">About this book</h3>
                    <p className="text-gray-600 text-sm font-sans max-h-48 overflow-y-auto">
                        {book.description || "No summary available."}
                    </p>
                </div>

                <StarRating 
                    bookId={book.id} 
                    user={user} 
                    onBookUpdate={onBookUpdate}
                    userRating={book.user_rating} 
                />

            </>
        );
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-cream rounded-lg shadow-2xl w-full max-w-3xl relative p-8 text-left animate-slide-up-fast"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                {renderContent()}
            </div>
        </div>
    );
};

export default BookDetailModal;