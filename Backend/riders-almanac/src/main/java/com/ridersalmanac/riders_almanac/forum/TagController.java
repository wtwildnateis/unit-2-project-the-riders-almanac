package com.ridersalmanac.riders_almanac.forum;

import com.ridersalmanac.riders_almanac.forum.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forum/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService service;

    @GetMapping
    public List<TagDto> list(@RequestParam(required=false) String q) {
        var list = (q == null || q.isBlank()) ? service.listEnabled() : service.search(q);
        return list.stream().map(t -> new TagDto(t.getId(), t.getSlug(), t.getLabel())).toList();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MOD')")
    public TagDto create(@RequestBody TagCreateRequest req) {
        return service.create(req);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MOD')")
    public TagDto update(@PathVariable Long id, @RequestBody TagUpdateRequest req) {
        return service.update(id, req);
    }

}

