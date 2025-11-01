package com.ridersalmanac.riders_almanac.events;

import com.ridersalmanac.riders_almanac.users.User;

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

}
