import React, { useState } from 'react';
import BookDetailModal from './BookDetailModal'; 
import placeholderImg from '../assets/placeholder_img.jpg'; 
import { booksAPI } from '../services/api';
import { toast } from 'react-toastify';

const StarIcon = () => ( <svg className="w-4 h-4 text-golden mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.955a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.366 2.446a1 1 0 00-.364 1.118l1.287 3.955c.3.921-.755 1.688-1.54 1.118l-3.366-2.446a1 1 0 00-1.175 0l-3.366 2.446c-.784.57-1.838-.197-1.54-1.118l1.287-3.955a1 1 0 00-.364-1.118L2.08 9.382c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" /></svg> );
const BookIcon = () => ( <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg> );

// LOGIC CHANGE: Component now accepts 'onBookUpdate' prop
const BookCard = ({ book, onBookUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [detailedBook, setDetailedBook] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    if (!book) return null;

    // LOGIC CHANGE: handleReadMore now notifies the parent
    const handleReadMore = async () => {
        setIsModalOpen(true);
        setIsLoading(true);

        const result = await booksAPI.getById(book.id);
        
        if (result.success) {
            setDetailedBook(result.data);
            // This new 'if' block is the key to fixing the refresh issue
            if (onBookUpdate) {
                onBookUpdate(result.data);
            }
        } else {
            toast.error("Could not load book details.");
            setIsModalOpen(false);
        }
        setIsLoading(false);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setDetailedBook(null);
    };
    
    const placeholderSeededUrl = "https://placehold.co/200x300?text=Not+Found";

    const imageUrl = 
    book.cover_image_url && book.cover_image_url !== placeholderSeededUrl
        ? book.cover_image_url
        : placeholderImg;
    const tagline = book.description && book.description !== "No description available."
        ? `"${book.description.substring(0, 40)}..."` 
        : '"Click to see more...."';

    // --- THE UI BELOW IS UNCHANGED ---
    return (
        <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <img 
                    src={imageUrl} 
                    alt={`Cover for ${book.title}`}
                    className="w-full h-56 object-cover"
                />
                <div className="p-5">
                    <h3 className="text-xl font-serif font-bold text-navy truncate" title={book.title}>{book.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-3 font-sans truncate" title={book.author}>{book.author}</p>
                    <div className="flex items-center mb-3">
                        <StarIcon />
                        <span className="text-sm text-gray-700 font-semibold font-sans">{book.average_rating?.toFixed(1)}</span>
                    </div>
                    <p className="text-sm text-gray-500 italic mb-4 h-10 font-sans">{tagline}</p>
                    <button 
                        onClick={handleReadMore}
                        className="text-sm text-emerald font-semibold hover:underline flex items-center font-sans"
                    >
                        <BookIcon />
                        Read more
                    </button>
                </div>
            </div>

            {isModalOpen && (
                <BookDetailModal 
                    book={detailedBook} 
                    isLoading={isLoading}
                    onClose={handleCloseModal} 
                />
            )}
        </>
    );
};

export default BookCard;