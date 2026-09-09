package com.nextread.nextread.repository;

import com.nextread.nextread.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookRepository extends JpaRepository<Book, Integer> {

    @Query(value = """
            SELECT *
            FROM (
                SELECT
                    b.*,
                    ROW_NUMBER() OVER (
                        PARTITION BY bg.goal_id
                        ORDER BY b.average_rating DESC, b.ratings_count DESC
                    ) AS book_rank
                FROM books b
                JOIN book_goals bg ON b.id = bg.book_id
                WHERE b.ratings_count >= :minRatings
            ) ranked
            WHERE ranked.book_rank <= 2
            ORDER BY ranked.average_rating DESC,
                     ranked.ratings_count DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<Book> findPopularBooks(
            @Param("limit") int limit,
            @Param("minRatings") int minRatings
    );

    @Query(value = """
            SELECT DISTINCT b.*
            FROM books b
            JOIN book_goals bg ON b.id = bg.book_id
            JOIN user_goals ug ON ug.goal_id = bg.goal_id
            WHERE ug.user_id = :userId
              AND b.ratings_count >= :minRatings
            ORDER BY b.average_rating DESC
            """, nativeQuery = true)
    List<Book> findRecommendationsForUser(
            @Param("userId") Integer userId,
            @Param("minRatings") int minRatings
    );

    List<Book> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(
            String title,
            String author
    );
}
