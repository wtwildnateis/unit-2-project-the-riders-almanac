package com.ridersalmanac.riders_almanac.events;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {

    @Query("""
        select e from Event e
        where e.isDeleted = false
          and (:status is null or e.status = :status)
          and (:from  is null or e.start >= :from)
          and (:to    is null or e.start <  :to)
        order by e.start asc
    """)
    List<Event> findWindow(
            @Param("from") Instant from,
            @Param("to") Instant to,
            @Param("status") Event.Status status
    );

    Optional<Event> findByIdAndIsDeletedFalse(Long id);

    boolean existsByIdAndOwner_IdAndIsDeletedFalse(Long id, Long ownerId);
}