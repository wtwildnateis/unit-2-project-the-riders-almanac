package com.ridersalmanac.riders_almanac.forum.dto;

import jakarta.validation.constraints.*;

import java.util.List;

public record PostCreateRequest(
        @NotBlank @Size(max=140) String title,
        @NotBlank String body,
        @Size(max=200) String tags,
        List<@NotBlank String> imageUrls
) {}
