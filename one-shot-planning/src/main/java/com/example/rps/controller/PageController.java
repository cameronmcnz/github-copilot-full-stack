package com.example.rps.controller;

import com.example.rps.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    private final UserService userService;

    public PageController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/")
    public String index(
            @CookieValue(name = "rps-user-id", required = false) String userCookie,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        userService.resolveOrCreateUser(userCookie, request, response);
        return "index";
    }
}