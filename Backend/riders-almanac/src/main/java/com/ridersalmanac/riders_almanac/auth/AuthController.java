package com.ridersalmanac.riders_almanac.auth;

import com.ridersalmanac.riders_almanac.auth.dto.*;
import com.ridersalmanac.riders_almanac.users.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserRepository users;
    private final RoleRepository roles; // simple repo: findByName(String)
    private final PasswordEncoder encoder;
    private final AuthenticationManager authManager;
    private final JwtService jwt;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest req) {
        if (users.existsByUsername(req.username())) throw new IllegalArgumentException("Username taken");
        if (users.existsByEmail(req.email())) throw new IllegalArgumentException("Email in use");

        var user = User.builder()
                .username(req.username())
                .email(req.email())
                .displayName(req.displayName())
                .passwordHash(encoder.encode(req.password()))
                .build();

        // assigns USER roles
        var userRole = roles.findByName("USER").orElseGet(() -> roles.save(Role.builder().name("USER").build()));
        user.getRoles().add(userRole);
        users.save(user);

        String token = jwt.generate(user.getUsername());
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(req.username(), req.password()));
        String token = jwt.generate(req.username());
        return ResponseEntity.ok(new AuthResponse(token));
    }


}