package com.nextread.nextread.repository;

import com.nextread.nextread.entity.Goal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GoalRepository extends JpaRepository<Goal, Integer> {

    Optional<Goal> findByName(String name);
}