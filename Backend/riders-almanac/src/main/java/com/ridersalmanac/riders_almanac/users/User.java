package com.ridersalmanac.riders_almanac.users;

import ch.qos.logback.core.status.Status;
import lombok.Getter;
import lombok.Setter;

import javax.management.relation.Role;
import java.util.HashSet;
import java.util.Set;

public class User {
    private Long id;
    private String username;
    private String email;
    private String passwordHash;
    private String displayName;
    @Setter
    @Getter
    private Status status = Status.ACTIVE;

    public enum Status { ACTIVE, SUSPENDED }
    @Getter
    @Setter
    private Set<Role> roles = new HashSet<>();

}
