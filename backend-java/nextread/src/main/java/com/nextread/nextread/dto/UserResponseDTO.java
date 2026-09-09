package com.nextread.nextread.dto;

import com.nextread.nextread.entity.Goal;
import com.nextread.nextread.entity.User;

import java.util.List;

public class UserResponseDTO {

    private Integer id;
    private String email;
    private List<Goal> goals;

    public UserResponseDTO(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.goals = user.getGoals().stream().toList();
    }

    public Integer getId() { return id; }
    public String getEmail() { return email; }
    public List<Goal> getGoals() { return goals; }
}
