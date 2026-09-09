package com.nextread.nextread.service;

import com.nextread.nextread.dto.BookSearchDTO;
import com.nextread.nextread.entity.Book;
import com.nextread.nextread.entity.Rating;
import com.nextread.nextread.entity.User;
import com.nextread.nextread.repository.BookRepository;
import com.nextread.nextread.repository.RatingRepository;
import com.nextread.nextread.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final RatingRepository ratingRepository;
    private final UserRepository userRepository;
    private final AiService aiService;

    public BookService(
            BookRepository bookRepository,
            RatingRepository ratingRepository,
            UserRepository userRepository,
            AiService aiService
    ) {
        this.bookRepository = bookRepository;
        this.ratingRepository = ratingRepository;
        this.userRepository = userRepository;
        this.aiService = aiService;
    }


    // =====================================================
    // POPULAR BOOKS
    // =====================================================

    public List<Book> getPopularBooks() {

        return bookRepository.findPopularBooks(
                12,
                100
        );
    }


    // =====================================================
    // SEARCH
    // =====================================================

    public List<BookSearchDTO> searchBooks(
            String query
    ) {

        if (query == null ||
                query.trim().isEmpty()) {

            return List.of();
        }

        String searchTerm =
                query.trim();

        return bookRepository
                .findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(
                        searchTerm,
                        searchTerm
                )
                .stream()
                .map(book ->
                        new BookSearchDTO(
                                book.getId(),
                                book.getTitle(),
                                book.getAuthor(),
                                book.getDescription(),
                                book.getCoverImageUrl(),
                                book.getAverageRating(),
                                book.getRatingsCount(),
                                null
                        )
                )
                .toList();
    }


    // =====================================================
    // BOOK DETAILS
    // =====================================================

    @Transactional
    public Book getBook(
            Integer bookId
    ) {

        Book book =
                bookRepository.findById(bookId)
                        .orElse(null);

        if (book == null) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Book not found"
            );
        }

        // Generate AI summary when needed
        if ("No description available."
                .equals(book.getDescription())) {

            System.out.println(
                    "Generating new summary for '"
                            + book.getTitle()
                            + "'..."
            );

            String newDescription =
                    aiService.generateBookSummary(
                            book.getTitle(),
                            book.getAuthor()
                    );

            boolean successful =
                    newDescription != null
                            && !newDescription.equals(
                                "AI model is not available due to a configuration error."
                            )
                            && !newDescription.equals(
                                "Could not generate a summary at this time."
                            );

            if (successful) {

                book.setDescription(
                        newDescription
                );

                book =
                        bookRepository.save(book);
            }
        }

        return book;
    }


    // =====================================================
    // USER RATING
    // =====================================================

    @Transactional(readOnly = true)
    public Double getUserRating(
            Integer bookId,
            String email
    ) {

        if (email == null) {
            return null;
        }

        User user =
                userRepository.findByEmail(email)
                        .orElse(null);

        if (user == null) {
            return null;
        }

        return ratingRepository
                .findByBookIdAndUserId(
                        bookId,
                        user.getId()
                )
                .map(Rating::getRating)
                .orElse(null);
    }


    // =====================================================
    // RECOMMENDATIONS
    // =====================================================

    @Transactional(readOnly = true)
    public List<Book> getRecommendations(
            String email
    ) {

        User user =
                userRepository.findByEmail(email)
                        .orElse(null);

        if (user == null ||
                user.getGoals().isEmpty()) {

            return List.of();
        }

        return bookRepository
                .findRecommendationsForUser(
                        user.getId(),
                        50
                );
    }


    // =====================================================
    // RATE BOOK
    // =====================================================

    @Transactional
    public Book rateBook(
            Integer bookId,
            String email,
            Double ratingValue
    ) {

        Book book =
                getBook(bookId);

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.UNAUTHORIZED,
                                        "Could not validate credentials"
                                )
                        );

        if (ratingRepository
                .findByBookIdAndUserId(
                        bookId,
                        user.getId()
                )
                .isPresent()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "You have already rated this book."
            );
        }

        Rating rating =
                new Rating();

        rating.setBookId(bookId);
        rating.setUserId(user.getId());
        rating.setRating(ratingValue);

        ratingRepository.save(rating);


        double oldAverage =
                book.getAverageRating() == null
                        ? 0.0
                        : book.getAverageRating();

        int oldCount =
                book.getRatingsCount() == null
                        ? 0
                        : book.getRatingsCount();

        double total =
                oldAverage * oldCount
                        + ratingValue;

        int newCount =
                oldCount + 1;

        book.setRatingsCount(newCount);

        book.setAverageRating(
                Math.round(
                        (total / newCount) * 100.0
                ) / 100.0
        );

        return bookRepository.save(book);
    }
}