package com.nextread.nextread.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.nextread.nextread.entity.Book;

public class PopularBookDTO {

    private Integer id;
    private String title;
    private String author;
    private String description;

    @JsonProperty("cover_image_url")
    private String coverImageUrl;

    @JsonProperty("average_rating")
    private Double averageRating;

    @JsonProperty("ratings_count")
    private Integer ratingsCount;

    @JsonProperty("user_rating")
    private Double userRating;

    public PopularBookDTO(Book book) {
        this.id = book.getId();
        this.title = book.getTitle();
        this.author = book.getAuthor();
        this.description = book.getDescription();
        this.coverImageUrl = book.getCoverImageUrl();
        this.averageRating = book.getAverageRating();
        this.ratingsCount = book.getRatingsCount();

        // Python endpoint currently returns null
        this.userRating = null;
    }

    public Integer getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getAuthor() {
        return author;
    }

    public String getDescription() {
        return description;
    }

    public String getCoverImageUrl() {
        return coverImageUrl;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public Integer getRatingsCount() {
        return ratingsCount;
    }

    public Double getUserRating() {
        return userRating;
    }
}