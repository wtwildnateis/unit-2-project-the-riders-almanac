package com.ridersalmanac.riders_almanac.forum;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    @Query("""
           select c from Comment c
           where c.post.id = :postId and c.isDeleted = false and c.status = com.ridersalmanac.riders_almanac.forum.Comment.Status.PUBLISHED
           order by c.createdAt asc
           """)
    List<Comment> findForPost(@Param("postId") Long postId);
}

