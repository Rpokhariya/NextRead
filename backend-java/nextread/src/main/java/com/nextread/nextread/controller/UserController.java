package com.nextread.nextread.controller;

import com.nextread.nextread.dto.MessageResponseDTO;
import com.nextread.nextread.dto.UserGoalAddDTO;
import com.nextread.nextread.dto.UserGoalsUpdateDTO;
import com.nextread.nextread.dto.UserResponseDTO;
import com.nextread.nextread.entity.User;
import com.nextread.nextread.service.UserService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users/me")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }


    // =====================================================
    // GET CURRENT USER
    // GET /users/me
    // =====================================================

    @GetMapping
    public UserResponseDTO getCurrentUser(
            @AuthenticationPrincipal String email
    ) {

        User user =
                userService.getByEmail(email);

        return new UserResponseDTO(user);
    }


    // =====================================================
    // SET / REPLACE ALL GOALS
    // PUT /users/me/goals
    // =====================================================

    @PutMapping("/goals")
    public ResponseEntity<MessageResponseDTO> setGoals(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody UserGoalsUpdateDTO request
    ) {

        userService.setGoals(
                email,
                request.getGoalIds()
        );

        return ResponseEntity.ok(
                new MessageResponseDTO(
                        "Successfully set goals for user " + email
                )
        );
    }


    // =====================================================
    // ADD ONE GOAL
    // POST /users/me/goals
    // =====================================================

    @PostMapping("/goals")
    public ResponseEntity<MessageResponseDTO> addGoal(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody UserGoalAddDTO request
    ) {

        User user =
                userService.addGoal(
                        email,
                        request.getGoalId()
                );

        String goalName =
                user.getGoals()
                        .stream()
                        .filter(g ->
                                g.getId()
                                        .equals(request.getGoalId()))
                        .findFirst()
                        .map(g -> g.getName())
                        .orElse("goal");

        return ResponseEntity.ok(
                new MessageResponseDTO(
                        "Successfully added goal '"
                                + goalName
                                + "' for user "
                                + email
                )
        );
    }


    // =====================================================
    // REMOVE ONE GOAL
    // DELETE /users/me/goals/{goalId}
    // =====================================================

    @DeleteMapping("/goals/{goalId}")
    public ResponseEntity<MessageResponseDTO> removeGoal(
            @AuthenticationPrincipal String email,
            @PathVariable Integer goalId
    ) {

        userService.removeGoal(
                email,
                goalId
        );

        return ResponseEntity.ok(
                new MessageResponseDTO(
                        "Successfully removed goal for user "
                                + email
                )
        );
    }
}