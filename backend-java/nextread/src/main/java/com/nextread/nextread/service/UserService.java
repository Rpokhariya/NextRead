package com.nextread.nextread.service;

import com.nextread.nextread.entity.Goal;
import com.nextread.nextread.entity.User;
import com.nextread.nextread.repository.GoalRepository;
import com.nextread.nextread.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final GoalRepository goalRepository;

    public UserService(
            UserRepository userRepository,
            GoalRepository goalRepository
    ) {
        this.userRepository = userRepository;
        this.goalRepository = goalRepository;
    }


    // =====================================================
    // GET USER
    // =====================================================

    @Transactional(readOnly = true)
    public User getByEmail(String email) {

        User user =
                userRepository.findByEmail(email)
                        .orElse(null);

        if (user == null) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Could not validate credentials"
            );
        }

        return user;
    }


    // =====================================================
    // SET ALL GOALS
    // =====================================================

    @Transactional
    public User setGoals(
            String email,
            List<Integer> goalIds
    ) {

        User user =
                getByEmail(email);

        Set<Integer> uniqueIds =
                new HashSet<>(goalIds);

        List<Goal> goals =
                goalRepository.findAllById(uniqueIds);

        if (goals.size() != uniqueIds.size()) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "One or more goal IDs are invalid."
            );
        }

        user.getGoals().clear();
        user.getGoals().addAll(goals);

        return userRepository.save(user);
    }


    // =====================================================
    // ADD GOAL
    // =====================================================

    @Transactional
    public User addGoal(
            String email,
            Integer goalId
    ) {

        User user =
                getByEmail(email);

        Goal goal =
                goalRepository.findById(goalId)
                        .orElse(null);

        if (goal == null) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Goal with ID "
                            + goalId
                            + " not found."
            );
        }

        if (user.getGoals()
                .stream()
                .anyMatch(g ->
                        g.getId().equals(goalId))) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "User already has this goal."
            );
        }

        user.getGoals().add(goal);

        return userRepository.save(user);
    }


    // =====================================================
    // REMOVE GOAL
    // =====================================================

    @Transactional
    public User removeGoal(
            String email,
            Integer goalId
    ) {

        User user =
                getByEmail(email);

        Goal existing =
                user.getGoals()
                        .stream()
                        .filter(g ->
                                g.getId().equals(goalId))
                        .findFirst()
                        .orElse(null);

        if (existing == null) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Goal with ID "
                            + goalId
                            + " not found in user's goal list."
            );
        }

        user.getGoals().remove(existing);

        return userRepository.save(user);
    }
}