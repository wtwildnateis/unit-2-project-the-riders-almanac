package com.ridersalmanac.riders_almanac.forum;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;

import java.util.List;
import java.util.Optional;

public interface ForumRepository extends JpaRepository<Post, Long> {

    @Query("""
           select p from Post p
           where p.isDeleted = false and p.status = com.ridersalmanac.riders_almanac.forum.Post.Status.PUBLISHED
           order by coalesce(p.lastActivityAt, p.createdAt) desc
           """)
    List<Post> findFeed(Pageable pageable);

    Optional<Post> findByIdAndIsDeletedFalse(Long id);
}

