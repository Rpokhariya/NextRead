package com.nextread.nextread.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class BookSearchDTO {

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
    private Object userRating;

    public BookSearchDTO() {
    }

    public BookSearchDTO(
            Integer id,
            String title,
            String author,
            String description,
            String coverImageUrl,
            Double averageRating,
            Integer ratingsCount,
            Object userRating
    ) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.description = description;
        this.coverImageUrl = coverImageUrl;
        this.averageRating = averageRating;
        this.ratingsCount = ratingsCount;
        this.userRating = userRating;
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

    @JsonProperty("cover_image_url")
    public String getCoverImageUrl() {
        return coverImageUrl;
    }

    @JsonProperty("average_rating")
    public Double getAverageRating() {
        return averageRating;
    }

    @JsonProperty("ratings_count")
    public Integer getRatingsCount() {
        return ratingsCount;
    }

    @JsonProperty("user_rating")
    public Object getUserRating() {
        return userRating;
    }
}