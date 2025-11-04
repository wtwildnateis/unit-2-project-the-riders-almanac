package com.ridersalmanac.riders_almanac.events.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record CreateEventRequest(

        @NotNull
        Long ownerId,

        @NotBlank
        String title,

        String type,

        String flyer,

        @NotNull
        Instant start,

        Instant end,

        String street,
        String city,
        String state,
        String zip,

        String description
) {}