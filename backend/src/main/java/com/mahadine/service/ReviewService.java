package com.mahadine.service;

import com.mahadine.dto.ReviewRequest;
import com.mahadine.entity.Restaurant;
import com.mahadine.entity.Review;
import com.mahadine.entity.User;
import com.mahadine.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final RestaurantService restaurantService;

    public List<Review> getByRestaurant(Long restaurantId) {
        return reviewRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId);
    }

    public Review create(Long restaurantId, User user, ReviewRequest req) {
        Restaurant restaurant = restaurantService.getById(restaurantId);
        Review review = Review.builder()
                .user(user)
                .restaurant(restaurant)
                .rating(req.getRating())
                .comment(req.getComment())
                .build();
        Review saved = reviewRepository.save(review);

        // Recalculate restaurant's average rating
        List<Review> all = reviewRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId);
        double avg = all.stream().mapToInt(Review::getRating).average().orElse(restaurant.getRating());
        restaurant.setRating(Math.round(avg * 10.0) / 10.0);
        restaurantService.update(restaurantId, toRequest(restaurant));

        return saved;
    }

    private com.mahadine.dto.RestaurantRequest toRequest(Restaurant r) {
        com.mahadine.dto.RestaurantRequest req = new com.mahadine.dto.RestaurantRequest();
        req.setName(r.getName());
        req.setDescription(r.getDescription());
        req.setLocation(r.getLocation());
        req.setCity(r.getCity());
        req.setAddress(r.getAddress());
        req.setPhone(r.getPhone());
        req.setEmail(r.getEmail());
        req.setCuisine(r.getCuisine());
        req.setPriceRange(r.getPriceRange());
        req.setRating(r.getRating());
        req.setOpeningTime(r.getOpeningTime());
        req.setClosingTime(r.getClosingTime());
        req.setImageUrl(r.getImageUrl());
        req.setStatus(r.getStatus().name());
        return req;
    }
}
