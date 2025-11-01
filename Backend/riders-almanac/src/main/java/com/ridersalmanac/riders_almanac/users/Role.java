package com.ridersalmanac.riders_almanac.users;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity @Table(name="roles")
@Getter
@Setter
public class Role {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Short id;

    @Column(nullable=false, unique=true, length=20)
    private String name; // "USER", "ADMIN", "MOD"
}
