package com.ridersalmanac.riders_almanac.forum;

import com.ridersalmanac.riders_almanac.forum.dto.*;
import com.ridersalmanac.riders_almanac.moderation.ModerationLog;
import com.ridersalmanac.riders_almanac.moderation.ModerationService;
import com.ridersalmanac.riders_almanac.users.Role;
import com.ridersalmanac.riders_almanac.users.User;
import com.ridersalmanac.riders_almanac.users.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageRequest;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ForumService {

    private final ForumRepository posts;
    private final CommentRepository comments;
    private final PostImageRepository images;
    private final UserRepository users;
    private final ModerationService moderation;

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
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(size, 50));
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
        ensureCanModifyPost(p, current);

        if (req.title() != null) p.setTitle(req.title());
        if (req.body() != null) p.setBody(req.body());
        if (req.tags() != null) p.setTags(req.tags());
        p.setLastActivityAt(Instant.now());
        return toDto(p);
    }

    @Transactional
    public void deletePost(Long id, Long currentUserId) {
        Post p = posts.findByIdAndIsDeletedFalse(id).orElseThrow();
        User current = users.findById(currentUserId).orElseThrow();
        ensureCanModifyPost(p, current);

        p.setDeleted(true);
        p.setStatus(Post.Status.DELETED);
    }

    // for comments

    @Transactional
    public CommentResponse addComment(Long authorId, CommentCreateRequest req) {
        User author = users.findById(authorId).orElseThrow();
        Post post = posts.findByIdAndIsDeletedFalse(req.postId()).orElseThrow();
        if (post.isLocked()) {
            throw new SecurityException("Post is locked by moderators");
        }

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
        var page = comments.findPageForPost(postId, PageRequest.of(0, 50)); // first 50, tweak as you like
        return page.getContent().stream().map(this::toDto).toList();
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

    public PageResponse<CommentResponse> comments(Long postId, int page, int size) {
        posts.findById(postId).orElseThrow(() -> new IllegalArgumentException("Post not found"));
        var pageable = PageRequest.of(page, size); // sorting already in query
        var pageObj = comments.findPageForPost(postId, pageable);

        var items = pageObj.getContent().stream().map(this::toDto).toList();
        return new PageResponse<>(
                items,
                pageObj.getNumber(),
                pageObj.getSize(),
                pageObj.getTotalElements()
        );
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
                .sorted((a, b) -> Integer.compare(
                        a.getSortOrder() == null ? 0 : a.getSortOrder(),
                        b.getSortOrder() == null ? 0 : b.getSortOrder()))
                .map(PostImage::getUrl)
                .toList();

        return new PostResponse(
                p.getId(),
                p.getTitle(),
                p.getBody(),
                p.getTags(),
                p.getAuthor().getId(),
                p.getAuthor().getUsername(),
                imgs,
                p.isLocked(),
                p.getCreatedAt(),
                p.getUpdatedAt(),
                p.getLastActivityAt()
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

    private void ensureCanModifyPost(Post post, User current) {
        boolean isStaff = current.getRoles().stream()
                .map(Role::getName)
                .anyMatch(r -> r.equals("ROLE_ADMIN") || r.equals("ROLE_MOD"));

        // if locked, only staff can modify
        if (post.isLocked() && !isStaff) {
            throw new SecurityException("Post is locked by moderators");
        }
        // if not locked: owner or staff may modify
        if (!post.getAuthor().getId().equals(current.getId()) && !isStaff) {
            throw new SecurityException("Not allowed.");
        }
    }


    @Transactional
    public PostResponse lockPost(Long postId, Long moderatorId, String reason) {
        Post p = posts.findByIdAndIsDeletedFalse(postId).orElseThrow();
        if (p.isLocked()) throw new IllegalArgumentException("Post already locked");

        User mod = users.findById(moderatorId).orElseThrow();
        boolean isStaff = mod.getRoles().stream()
                .map(Role::getName)
                .anyMatch(r -> r.equals("ROLE_ADMIN") || r.equals("ROLE_MOD"));
        if (!isStaff) throw new SecurityException("Moderator role required");

        p.setLocked(true);
        p.setLastActivityAt(Instant.now());
        moderation.log(
                mod,
                com.ridersalmanac.riders_almanac.moderation.ModerationLog.TargetType.POST,
                p.getId(),
                com.ridersalmanac.riders_almanac.moderation.ModerationLog.Action.LOCK,
                reason == null ? "Locked" : reason
        );
        return toDto(p);
    }

    @Transactional
    public PostResponse unlockPost(Long postId, Long moderatorId, String reason) {
        Post p = posts.findByIdAndIsDeletedFalse(postId).orElseThrow();
        if (!p.isLocked()) throw new IllegalArgumentException("Post is not locked");

        User mod = users.findById(moderatorId).orElseThrow();
        boolean isStaff = mod.getRoles().stream()
                .map(Role::getName)
                .anyMatch(r -> r.equals("ROLE_ADMIN") || r.equals("ROLE_MOD"));
        if (!isStaff) throw new SecurityException("Moderator role required");

        p.setLocked(false);
        p.setLastActivityAt(Instant.now());
        moderation.log(
                mod,
                com.ridersalmanac.riders_almanac.moderation.ModerationLog.TargetType.POST,
                p.getId(),
                com.ridersalmanac.riders_almanac.moderation.ModerationLog.Action.UNLOCK,
                reason == null ? "Unlocked" : reason
        );
        return toDto(p);
    }

    @Transactional
    public PostResponse hidePost(Long postId, Long modId, String reason) {
        var p = posts.findByIdAndIsDeletedFalse(postId).orElseThrow();
        var mod = users.findById(modId).orElseThrow();
        ensureStaff(mod);

        p.setStatus(Post.Status.HIDDEN);
        p.setLastActivityAt(Instant.now());
        moderation.log(mod,
                ModerationLog.TargetType.POST, p.getId(),
                ModerationLog.Action.HIDE, reason == null ? "Hidden" : reason);
        return toDto(p);
    }

    @Transactional
    public PostResponse restorePost(Long postId, Long modId, String reason) {
        var p = posts.findById(postId).orElseThrow(); // allow from HIDDEN/DELETED
        var mod = users.findById(modId).orElseThrow();
        ensureStaff(mod);

        p.setDeleted(false);
        p.setStatus(Post.Status.PUBLISHED);
        p.setLastActivityAt(Instant.now());
        moderation.log(mod,
                ModerationLog.TargetType.POST, p.getId(),
                ModerationLog.Action.RESTORE, reason == null ? "Restored" : reason);
        return toDto(p);
    }

    @Transactional
    public void hideComment(Long commentId, Long modId, String reason) {
        var c = comments.findById(commentId).orElseThrow();
        var mod = users.findById(modId).orElseThrow();
        ensureStaff(mod);

        c.setStatus(Comment.Status.HIDDEN);
        c.setDeleted(false);
        moderation.log(mod,
                ModerationLog.TargetType.COMMENT, c.getId(),
                ModerationLog.Action.HIDE, reason == null ? "Hidden" : reason);
    }

    @Transactional
    public void restoreComment(Long commentId, Long modId, String reason) {
        var c = comments.findById(commentId).orElseThrow();
        var mod = users.findById(modId).orElseThrow();
        ensureStaff(mod);

        c.setStatus(Comment.Status.PUBLISHED);
        c.setDeleted(false);
        moderation.log(mod,
                ModerationLog.TargetType.COMMENT, c.getId(),
                ModerationLog.Action.RESTORE, reason == null ? "Restored" : reason);
    }

    private void ensureStaff(User u) {
        boolean isStaff = u.getRoles().stream().map(r -> r.getName())
                .anyMatch(n -> n.equals("ROLE_ADMIN") || n.equals("ROLE_MOD"));
        if (!isStaff) throw new SecurityException("Moderator role required");
    }
}