package com.ridersalmanac.riders_almanac.users.dto;

import jakarta.validation.constraints.Size;

//for updating displayname
public record UserUpdateRequest(
        @Size(max = 100) String displayName
) {}