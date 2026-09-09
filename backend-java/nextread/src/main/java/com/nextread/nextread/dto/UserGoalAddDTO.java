package com.nextread.nextread.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;

public class UserGoalAddDTO {

    @NotNull
    @JsonProperty("goal_id")
    private Integer goalId;

    public UserGoalAddDTO() {
    }

    public Integer getGoalId() {
        return goalId;
    }

    public void setGoalId(Integer goalId) {
        this.goalId = goalId;
    }
}