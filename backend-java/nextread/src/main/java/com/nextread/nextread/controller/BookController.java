package com.nextread.nextread.controller;

import com.nextread.nextread.dto.BookResponseDTO;
import com.nextread.nextread.dto.BookSearchDTO;
import com.nextread.nextread.dto.PopularBookDTO;
import com.nextread.nextread.dto.RatingCreateDTO;
import com.nextread.nextread.entity.Book;
import com.nextread.nextread.service.BookService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/books")
public class BookController {

    private final BookService bookService;

    public BookController(
            BookService bookService
    ) {
        this.bookService = bookService;
    }


    // =====================================================
    // POPULAR BOOKS
    // GET /books/popular
    // PUBLIC
    // =====================================================

    @GetMapping("/popular")
    public List<PopularBookDTO> getPopularBooks() {

        return bookService
                .getPopularBooks()
                .stream()
                .map(PopularBookDTO::new)
                .toList();
    }


    // =====================================================
    // SEARCH BOOKS
    // GET /books/search?q=...
    // PUBLIC
    // =====================================================

    @GetMapping("/search")
    public List<BookSearchDTO> searchBooks(
            @RequestParam(required = false) String q
    ) {

        return bookService.searchBooks(q);
    }


    // =====================================================
    // BOOK DETAILS
    // GET /books/{bookId}
    // PROTECTED
    // =====================================================

    @GetMapping("/{bookId}")
    public BookResponseDTO getBook(
            @PathVariable Integer bookId,
            @AuthenticationPrincipal String email
    ) {

        Book book =
                bookService.getBook(bookId);

        Double userRating =
                bookService.getUserRating(
                        bookId,
                        email
                );

        return new BookResponseDTO(
                book,
                userRating
        );
    }


    // =====================================================
    // RATE BOOK
    // POST /books/{bookId}/rate
    // PROTECTED
    // =====================================================

    @PostMapping("/{bookId}/rate")
    public ResponseEntity<BookResponseDTO> rateBook(
            @PathVariable Integer bookId,
            @Valid @RequestBody RatingCreateDTO request,
            @AuthenticationPrincipal String email
    ) {

        Book book =
                bookService.rateBook(
                        bookId,
                        email,
                        request.getRating()
                );

        return ResponseEntity.ok(
                new BookResponseDTO(
                        book,
                        request.getRating()
                )
        );
    }
}