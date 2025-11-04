package com.ridersalmanac.riders_almanac.events;

import com.ridersalmanac.riders_almanac.events.Event.Status;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    // Calendar events, all active non deleted events
    List<Event> findByIsDeletedFalseAndStatusAndStartBetweenOrderByStartAsc(
            Status status, Instant from, Instant to
    );

    // All upcoming events
    List<Event> findByIsDeletedFalseAndStatusOrderByStartAsc(Status status);
}