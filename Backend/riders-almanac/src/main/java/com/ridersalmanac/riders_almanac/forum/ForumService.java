package com.ridersalmanac.riders_almanac.forum;

import com.ridersalmanac.riders_almanac.forum.dto.*;
import com.ridersalmanac.riders_almanac.users.Role;
import com.ridersalmanac.riders_almanac.users.User;
import com.ridersalmanac.riders_almanac.users.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ForumService {

    private final ForumRepository posts;
    private final CommentRepository comments;
    private final PostImageRepository images;
    private final UserRepository users;

    // posts

    @Transactional
    public PostResponse createPost(Long authorId, PostCreateRequest req) {
        User author = users.findById(authorId).orElseThrow();

        Post p = Post.builder()
                .author(author)
                .title(req.title())
                .body(req.body())
                .tags(req.tags())
                .status(Post.Status.PUBLISHED)
                .isDeleted(false)
                .lastActivityAt(Instant.now())
                .build();

        if (req.imageUrls() != null) {
            for (int i = 0; i < req.imageUrls().size(); i++) {
                p.getImages().add(PostImage.builder()
                        .post(p)
                        .url(req.imageUrls().get(i))
                        .sortOrder(i)
                        .build());
            }
        }

        p = posts.save(p);
        return toDto(p);
    }

    public PageResponse<PostResponse> feed(int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page,0), Math.min(size,50));
        List<PostResponse> items = posts.findFeed(pageable).stream().map(this::toDto).toList();
        // cheap total (you can add a count query later)
        long total = posts.count();
        return new PageResponse<>(items, pageable.getPageNumber(), pageable.getPageSize(), total);
    }

    public PostResponse getPost(Long id) {
        Post p = posts.findByIdAndIsDeletedFalse(id).orElseThrow();
        return toDto(p);
    }

    @Transactional
    public PostResponse updatePost(Long id, Long currentUserId, PostUpdateRequest req) {
        Post p = posts.findByIdAndIsDeletedFalse(id).orElseThrow();
        User current = users.findById(currentUserId).orElseThrow();
        ensureCanModify(p.getAuthor(), current);

        if (req.title() != null) p.setTitle(req.title());
        if (req.body() != null)  p.setBody(req.body());
        if (req.tags() != null)  p.setTags(req.tags());
        p.setLastActivityAt(Instant.now());
        return toDto(p);
    }

    @Transactional
    public void deletePost(Long id, Long currentUserId) {
        Post p = posts.findByIdAndIsDeletedFalse(id).orElseThrow();
        User current = users.findById(currentUserId).orElseThrow();
        ensureCanModify(p.getAuthor(), current);

        p.setDeleted(true);
        p.setStatus(Post.Status.DELETED);
    }

    // for comments

    @Transactional
    public CommentResponse addComment(Long authorId, CommentCreateRequest req) {
        User author = users.findById(authorId).orElseThrow();
        Post post = posts.findByIdAndIsDeletedFalse(req.postId()).orElseThrow();

        Comment parent = null;
        if (req.parentId() != null) {
            parent = comments.findById(req.parentId()).orElseThrow();
            if (!parent.getPost().getId().equals(post.getId()))
                throw new IllegalArgumentException("Parent comment belongs to a different post");
        }

        Comment c = Comment.builder()
                .post(post)
                .author(author)
                .parent(parent)
                .body(req.body())
                .status(Comment.Status.PUBLISHED)
                .isDeleted(false)
                .build();

        c = comments.save(c);
        post.setLastActivityAt(Instant.now());
        return toDto(c);
    }

    public List<CommentResponse> listComments(Long postId) {
        return comments.findForPost(postId).stream().map(this::toDto).toList();
    }

    @Transactional
    public CommentResponse updateComment(Long id, Long currentUserId, CommentUpdateRequest req) {
        Comment c = comments.findById(id).orElseThrow();
        User current = users.findById(currentUserId).orElseThrow();
        ensureCanModify(c.getAuthor(), current);

        c.setBody(req.body());
        return toDto(c);
    }

    @Transactional
    public void deleteComment(Long id, Long currentUserId) {
        Comment c = comments.findById(id).orElseThrow();
        User current = users.findById(currentUserId).orElseThrow();
        ensureCanModify(c.getAuthor(), current);

        c.setDeleted(true);
        c.setStatus(Comment.Status.DELETED);
    }

// post rules & mapping

    private void ensureCanModify(User owner, User current) {
        if (owner.getId().equals(current.getId())) return;
        boolean isStaff = current.getRoles().stream()
                .map(Role::getName)
                .anyMatch(r -> r.equals("ROLE_ADMIN") || r.equals("ROLE_MOD"));
        if (!isStaff) throw new SecurityException("Not allowed.");
    }

    private PostResponse toDto(Post p) {
        List<String> imgs = p.getImages().stream()
                .sorted((a,b) -> Integer.compare(
                        a.getSortOrder() == null ? 0 : a.getSortOrder(),
                        b.getSortOrder() == null ? 0 : b.getSortOrder()))
                .map(PostImage::getUrl)
                .toList();

        return new PostResponse(
                p.getId(), p.getTitle(), p.getBody(), p.getTags(),
                p.getAuthor().getId(), p.getAuthor().getUsername(),
                imgs, p.getCreatedAt(), p.getUpdatedAt(), p.getLastActivityAt()
        );
    }

    private CommentResponse toDto(Comment c) {
        return new CommentResponse(
                c.getId(),
                c.getPost().getId(),
                c.getParent() == null ? null : c.getParent().getId(),
                c.getAuthor().getId(),
                c.getAuthor().getUsername(),
                c.getBody(),
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }
}