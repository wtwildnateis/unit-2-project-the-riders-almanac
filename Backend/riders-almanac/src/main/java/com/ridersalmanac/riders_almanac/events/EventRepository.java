package com.ridersalmanac.riders_almanac.events;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {

    @Query("""
            select e from Event e
            where e.isDeleted = false
            and (:from is null or e.startTime >= :from)
            and (:to   is null or e.startTime <  :to)
            order by e.startTime asc
            """)

    List<Event> findWindow(Instant from, Instant to);

    Optional<Event> findByIdAndIsDeletedFalse(Long id);

    boolean existsByIdAndOwnerIdAndIsDeletedFalse(Long id, Long ownerId);
}