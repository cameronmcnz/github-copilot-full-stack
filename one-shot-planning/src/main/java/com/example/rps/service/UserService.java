package com.example.rps.service;

import com.example.rps.entity.User;
import com.example.rps.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final String cookieName;
    private final long cookieMaxAgeDays;

    public UserService(
            UserRepository userRepository,
            @Value("${app.cookie.name}") String cookieName,
            @Value("${app.cookie.max-age-days}") long cookieMaxAgeDays
    ) {
        this.userRepository = userRepository;
        this.cookieName = cookieName;
        this.cookieMaxAgeDays = cookieMaxAgeDays;
    }

    @Transactional
    public User resolveOrCreateUser(String cookieValue, HttpServletRequest request, HttpServletResponse response) {
        Optional<User> existingUser = Optional.ofNullable(cookieValue)
                .flatMap(userRepository::findByPublicId);

        User user = existingUser.orElseGet(this::createUser);
        writeCookie(user.getPublicId(), request, response);
        return user;
    }

    public String getCookieName() {
        return cookieName;
    }

    private User createUser() {
        User user = new User();
        user.setPublicId(UUID.randomUUID().toString());
        return userRepository.save(user);
    }

    private void writeCookie(String publicId, HttpServletRequest request, HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(cookieName, publicId)
                .httpOnly(true)
                .secure(request.isSecure())
                .sameSite("Strict")
                .path("/")
                .maxAge(cookieMaxAgeDays * 24 * 60 * 60)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}