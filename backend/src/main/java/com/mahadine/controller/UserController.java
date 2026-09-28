package com.mahadine.controller;

import com.mahadine.dto.ApiResponse;
import com.mahadine.dto.UpdateProfileRequest;
import com.mahadine.dto.UserResponse;
import com.mahadine.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok("Profile fetched", userService.getProfile(authentication.getName())));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(Authentication authentication,
                                                                     @Valid @RequestBody UpdateProfileRequest request) {
        UserResponse updated = userService.updateProfile(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", updated));
    }
}
