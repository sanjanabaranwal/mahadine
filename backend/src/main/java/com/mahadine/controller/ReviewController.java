package com.mahadine.controller;

import com.mahadine.dto.ApiResponse;
import com.mahadine.dto.ReviewRequest;
import com.mahadine.entity.Review;
import com.mahadine.entity.User;
import com.mahadine.service.ReviewService;
import com.mahadine.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants/{restaurantId}/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Review>>> list(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(ApiResponse.ok("Reviews fetched", reviewService.getByRestaurant(restaurantId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Review>> create(Authentication authentication,
                                                        @PathVariable Long restaurantId,
                                                        @Valid @RequestBody ReviewRequest request) {
        User user = userService.getByEmail(authentication.getName());
        Review review = reviewService.create(restaurantId, user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Review submitted", review));
    }
}
