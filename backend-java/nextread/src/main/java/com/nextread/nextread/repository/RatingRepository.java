package com.nextread.nextread.repository;

import com.nextread.nextread.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RatingRepository extends JpaRepository<Rating, Integer> {

    Optional<Rating> findByBookIdAndUserId(Integer bookId, Integer userId);

    List<Rating> findByBookId(Integer bookId);

    List<Rating> findByUserId(Integer userId);
}