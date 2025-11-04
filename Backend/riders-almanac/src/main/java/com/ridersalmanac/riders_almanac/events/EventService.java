package com.ridersalmanac.riders_almanac.events;

import com.ridersalmanac.riders_almanac.events.dto.CreateEventRequest;
import com.ridersalmanac.riders_almanac.events.dto.EventMapper;
import com.ridersalmanac.riders_almanac.events.dto.EventResponse;
import com.ridersalmanac.riders_almanac.events.dto.UpdateEventRequest;
import com.ridersalmanac.riders_almanac.users.Role;
import com.ridersalmanac.riders_almanac.users.User;
import com.ridersalmanac.riders_almanac.users.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository events;
    private final UserRepository users;

    @Transactional
    public EventResponse create(CreateEventRequest req) {
        User owner = users.findById(req.ownerId())
                .orElseThrow(() -> new IllegalArgumentException("Owner not found"));

        Event e = new Event();
        e.setOwner(owner);
        e.setTitle(req.title());
        e.setType(req.type());
        e.setFlyer(req.flyer());
        e.setStart(req.start());
        e.setEnd(req.end());
        e.setStreet(req.street());
        e.setCity(req.city());
        e.setState(req.state());
        e.setZip(req.zip());
        e.setDescription(req.description());
        e.setStatus(Event.Status.ACTIVE);
        e.setIsDeleted(false);

        e = events.save(e);
        return EventMapper.toDto(e);
    }

    public List<EventResponse> list(Instant from, Instant to) {
        var list = (from != null && to != null)
                ? events.findByIsDeletedFalseAndStatusAndStartBetweenOrderByStartAsc(Event.Status.ACTIVE, from, to)
                : events.findByIsDeletedFalseAndStatusOrderByStartAsc(Event.Status.ACTIVE);

        return list.stream().map(EventMapper::toDto).toList();
    }

    public EventResponse get(Long id) {
        var e = requireEvent(id);
        return EventMapper.toDto(e);
    }

    @Transactional
    public EventResponse update(Long id, Long currentUserId, UpdateEventRequest req) {
        var e = requireEvent(id);
        var current = requireUser(currentUserId);
        ensureCanModify(e, current);

        if (req.title() != null) e.setTitle(req.title());
        if (req.type() != null) e.setType(req.type());
        if (req.flyer() != null) e.setFlyer(req.flyer());
        if (req.start() != null) e.setStart(req.start());
        if (req.end() != null) e.setEnd(req.end());
        if (req.street() != null) e.setStreet(req.street());
        if (req.city() != null) e.setCity(req.city());
        if (req.state() != null) e.setState(req.state());
        if (req.zip() != null) e.setZip(req.zip());
        if (req.description() != null) e.setDescription(req.description());
        if (req.status() != null) e.setStatus(Event.Status.valueOf(req.status()));

        return EventMapper.toDto(e);
    }

    @Transactional
    public void delete(Long id, Long currentUserId) {
        var e = requireEvent(id);
        var current = requireUser(currentUserId);
        ensureCanModify(e, current);

        e.setIsDeleted(true);
        e.setDeletedAt(Instant.now());
        e.setDeletedBy(current);
    }

    private Event requireEvent(Long id) {
        return events.findById(id).orElseThrow(() -> new IllegalArgumentException("Event not found"));
    }

    private User requireUser(Long id) {
        return users.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private void ensureCanModify(Event e, User current) {
        if (e.getOwner().getId().equals(current.getId())) return;
        if (isAdminOrMod(current)) return;
        throw new SecurityException("You can only modify your own events.");
    }

    private boolean isAdminOrMod(User u) {
        for (Role r : u.getRoles()) {
            String name = r.getName();
            if ("ROLE_ADMIN".equals(name) || "ROLE_MOD".equals(name)) return true;
        }
        return false;
    }
}