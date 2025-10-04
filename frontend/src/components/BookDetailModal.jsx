import React from 'react'; // Make sure React is imported
import placeholderImg from '../assets/placeholder_img.jpg';

// --- Helper Icons (StarIcon, UsersIcon) remain the same ---
const StarIcon = () => (
    <svg className="w-5 h-5 text-golden" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.955a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.366 2.446a1 1 0 00-.364 1.118l1.287 3.955c.3.921-.755 1.688-1.54 1.118l-3.366-2.446a1 1 0 00-1.175 0l-3.366 2.446c-.784.57-1.838-.197-1.54-1.118l1.287-3.955a1 1 0 00-.364-1.118L2.08 9.382c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
    </svg>
);

const UsersIcon = () => (
    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
);


const BookDetailModal = ({ book, isLoading, onClose }) => {
    // Function to format numbers remains the same
    const formatRatingsCount = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'm';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return num;
    };
    
    // This is the new part to handle the loading state
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
                
        // This is your existing JSX for displaying the book
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
                                <StarIcon />
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
                <div className="mt-8 flex gap-4">
                    <button className="flex-1 px-6 py-3 bg-golden text-navy font-semibold rounded-md hover:bg-yellow-500 transition-colors">
                        Add to Wishlist
                    </button>
                    <button className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-100 transition-colors">
                        Mark as Read
                    </button>
                </div>
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