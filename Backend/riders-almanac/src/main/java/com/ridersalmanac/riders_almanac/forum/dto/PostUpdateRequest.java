package com.ridersalmanac.riders_almanac.forum.dto;

import jakarta.validation.constraints.*;

public record PostUpdateRequest(
        @Size(max=140) String title,
        String body,
        @Size(max=200) String tags
) {}
