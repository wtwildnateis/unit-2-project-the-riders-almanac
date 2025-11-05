package com.ridersalmanac.riders_almanac.users.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangeUsernameRequest(
        @NotBlank @Size(min = 8, max = 50) String username
) {}