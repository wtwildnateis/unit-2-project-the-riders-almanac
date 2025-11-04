package com.ridersalmanac.riders_almanac.events;

import com.ridersalmanac.riders_almanac.events.dto.CreateEventRequest;
import com.ridersalmanac.riders_almanac.events.dto.EventResponse;
import com.ridersalmanac.riders_almanac.events.dto.UpdateEventRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService service;

    // Calendar list
    @GetMapping
    public List<EventResponse> list(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to
    ) {
        return service.list(from, to);
    }

    @GetMapping("/{id}")
    public EventResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    public EventResponse create(@Valid @RequestBody CreateEventRequest req) {
        return service.create(req);
    }

    @PutMapping("/{id}")
    public EventResponse update(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long currentUserId,
            @Valid @RequestBody UpdateEventRequest req
    ) {
        return service.update(id, currentUserId, req);
    }

    @DeleteMapping("/{id}")
    public void delete(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long currentUserId
    ) {
        service.delete(id, currentUserId);
    }
}