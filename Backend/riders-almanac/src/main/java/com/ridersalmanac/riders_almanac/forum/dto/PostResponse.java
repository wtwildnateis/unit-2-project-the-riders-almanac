package com.ridersalmanac.riders_almanac.forum.dto;

import java.time.Instant;
import java.util.List;

public record PostResponse(
        Long id,
        String title,
        String body,
        String tags,
        Long authorId,
        String authorUsername,
        List<String> images,
        boolean locked,
        Instant createdAt,
        Instant updatedAt,
        Instant lastActivityAt
) {}
