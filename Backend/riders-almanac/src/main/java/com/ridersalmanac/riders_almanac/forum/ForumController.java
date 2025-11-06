package com.ridersalmanac.riders_almanac.forum;

import com.ridersalmanac.riders_almanac.forum.dto.*;
import com.ridersalmanac.riders_almanac.users.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/forum")
@RequiredArgsConstructor
public class ForumController {

    private final ForumService service;
    private final UserRepository users;

// posts

    @GetMapping("/posts")
    public PageResponse<PostResponse> feed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return service.feed(page, size);
    }

    @GetMapping("/posts/{id}")
    public PostResponse get(@PathVariable Long id) {
        return service.getPost(id);
    }

    @PostMapping("/posts")
    public PostResponse create(
            @Valid @RequestBody PostCreateRequest req,
            @AuthenticationPrincipal UserDetails principal
    ) {
        Long authorId = currentUserId(principal);
        return service.createPost(authorId, req);
    }

    @PutMapping("/posts/{id}")
    public PostResponse update(
            @PathVariable Long id,
            @Valid @RequestBody PostUpdateRequest req,
            @AuthenticationPrincipal UserDetails principal
    ) {
        Long currentUserId = currentUserId(principal);
        return service.updatePost(id, currentUserId, req);
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal
    ) {
        Long currentUserId = currentUserId(principal);
        service.deletePost(id, currentUserId);
        return ResponseEntity.noContent().build();
    }

// comments

    @GetMapping("/posts/{postId}/comments")
    public java.util.List<CommentResponse> comments(@PathVariable Long postId) {
        return service.listComments(postId);
    }

    @PostMapping("/comments")
    public CommentResponse addComment(
            @Valid @RequestBody CommentCreateRequest req,
            @AuthenticationPrincipal UserDetails principal
    ) {
        Long authorId = currentUserId(principal);
        return service.addComment(authorId, req);
    }

    @PutMapping("/comments/{id}")
    public CommentResponse updateComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentUpdateRequest req,
            @AuthenticationPrincipal UserDetails principal
    ) {
        Long currentUserId = currentUserId(principal);
        return service.updateComment(id, currentUserId, req);
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal
    ) {
        Long currentUserId = currentUserId(principal);
        service.deleteComment(id, currentUserId);
        return ResponseEntity.noContent().build();
    }

// small helper

    private Long currentUserId(UserDetails principal) {
        return users.findByUsername(principal.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"))
                .getId();
    }
}