package com.nextread.nextread.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class UserGoalsUpdateDTO {

    @NotNull
    @JsonProperty("goal_ids")
    private List<Integer> goalIds;

    public UserGoalsUpdateDTO() {
    }

    public List<Integer> getGoalIds() {
        return goalIds;
    }

    public void setGoalIds(List<Integer> goalIds) {
        this.goalIds = goalIds;
    }
}