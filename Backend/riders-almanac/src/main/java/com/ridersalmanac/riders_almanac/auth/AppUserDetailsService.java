package com.ridersalmanac.riders_almanac.auth;

import com.ridersalmanac.riders_almanac.users.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AppUserDetailsService implements UserDetailsService {
    private final UserRepository users;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var u = users.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        var authorities = u.getRoles().stream()
                .map(r -> "ROLE_" + r.getName().replaceFirst("^ROLE_", "")) // ensure ROLE_ prefix
                .map(org.springframework.security.core.authority.SimpleGrantedAuthority::new)
                .toList();
        return new org.springframework.security.core.userdetails.User(
                u.getUsername(), u.getPasswordHash(), authorities);
    }
}