package com.ridersalmanac.riders_almanac.forum;

import com.ridersalmanac.riders_almanac.users.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "forum_posts", indexes = {
        @Index(name="idx_forum_posts_created_at", columnList = "created_at"),
        @Index(name="idx_forum_posts_status_deleted", columnList = "status,is_deleted")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Post {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false, fetch=FetchType.LAZY)
    @JoinColumn(name="author_id", nullable=false)
    private User author;

    @Column(nullable=false, length=140)
    private String title;

    @Lob @Column(nullable=false)
    private String body;

    @Column(length=200)
    private String tags;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false, length=16)
    private Status status = Status.PUBLISHED;
    public enum Status { PUBLISHED, HIDDEN, DELETED }

    @Builder.Default
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostImage> images = new ArrayList<>();

    @Builder.Default
    @Column(name="is_deleted", nullable=false)
    private boolean isDeleted = false;

    @CreationTimestamp @Column(name="created_at", updatable=false)
    private Instant createdAt;

    @UpdateTimestamp @Column(name="updated_at")
    private Instant updatedAt;

    @Column(name="last_activity_at")
    private Instant lastActivityAt;
}