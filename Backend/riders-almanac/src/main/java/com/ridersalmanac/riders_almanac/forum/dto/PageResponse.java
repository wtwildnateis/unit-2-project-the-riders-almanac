package com.ridersalmanac.riders_almanac.forum.dto;

import java.util.List;

public record PageResponse<T>(
        List<T> items,
        int page,
        int size,
        long total
) {}