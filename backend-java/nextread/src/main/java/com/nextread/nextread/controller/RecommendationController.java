package com.nextread.nextread.controller;

import com.nextread.nextread.dto.BookResponseDTO;
import com.nextread.nextread.service.BookService;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/users/me/recommendations")
public class RecommendationController {

    private final BookService bookService;

    public RecommendationController(
            BookService bookService
    ) {
        this.bookService = bookService;
    }

    @GetMapping
    public List<BookResponseDTO> getRecommendations(
            @AuthenticationPrincipal String email
    ) {

        return bookService
                .getRecommendations(email)
                .stream()
                .map(book ->
                        new BookResponseDTO(
                                book,
                                null
                        )
                )
                .toList();
    }
}