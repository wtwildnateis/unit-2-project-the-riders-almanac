package com.ridersalmanac.riders_almanac.events;

import com.ridersalmanac.riders_almanac.users.User;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

public class Event {
    private Long id;
    private User owner;
    private String title;
    private String type;
    private String flyer;
    private Instant start;
    private Instant end;
    private String street;
    private String city;
    private String state;
    private String zip;
    private String description;


    @Getter
    @Setter
    private Status status = Status.ACTIVE;
    public enum Status { ACTIVE, CANCELLED }
    private Boolean isDeleted = false;
    private Instant deletedAt;
    private User deletedBy;
    private Instant createdAt;
    private Instant updatedAt;

}
