package com.ridersalmanac.riders_almanac.users.dto;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(min = 2, max = 100) String displayName
) {}