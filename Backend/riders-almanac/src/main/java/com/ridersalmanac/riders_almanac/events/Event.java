package com.ridersalmanac.riders_almanac.events;

import com.ridersalmanac.riders_almanac.users.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(
        name = "events",
        indexes = {
                @Index(name = "idx_events_owner", columnList = "owner_id"),
        @Index(name = "idx_events_start_time", columnList = "start_time"),
        @Index(name = "idx_events_city_state", columnList = "city,state"),
        @Index(name = "idx_events_status_deleted", columnList = "status,is_deleted")
        }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Event {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable=false, length = 255)
    private String title;

    @Column(length = 40)
    private String type; // "Group Ride", "Bike Race", etc.

    @Column(name = "flyer_url", length = 500)
    private String flyer; // URL for flyer hosted through cloudinary

    @Column(name = "start_time", nullable = false)
    private Instant start;

    @Column(name = "end_time")
    private Instant end;

    @Column(length = 120)
    private String street;

    @Column(length = 80)
    private String city;

    @Column(length = 2)
    private String state; // US state codes for now, will revisit to establish global addresses

    @Column(length = 10)
    private String zip;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private Status status = Status.ACTIVE;
    public enum Status { ACTIVE, CANCELLED }

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deleted_by_user_id")
    private User deletedBy;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

}
