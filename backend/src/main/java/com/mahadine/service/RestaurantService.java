package com.mahadine.service;

import com.mahadine.dto.RestaurantRequest;
import com.mahadine.entity.Restaurant;
import com.mahadine.entity.RestaurantStatus;
import com.mahadine.exception.ResourceNotFoundException;
import com.mahadine.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;

    public List<Restaurant> search(String city, String cuisine, String keyword) {
        return restaurantRepository.search(
                (city == null || city.isBlank()) ? null : city,
                (cuisine == null || cuisine.isBlank()) ? null : cuisine,
                (keyword == null || keyword.isBlank()) ? null : keyword
        );
    }

    /**
     * Single source of truth for operating hours. Same-day hours (open < close)
     * and overnight hours (close <= open, e.g. 18:00 -> 02:00) are both handled.
     * Missing hours mean no restriction. The closing time itself stays valid,
     * matching the project's existing rule.
     */
    public boolean isOpenAt(Restaurant restaurant, LocalTime time) {
        LocalTime open = restaurant.getOpeningTime();
        LocalTime close = restaurant.getClosingTime();
        if (open == null || close == null || time == null) return true;
        if (close.isAfter(open)) {
            return !time.isBefore(open) && !time.isAfter(close);
        }
        return !time.isBefore(open) || !time.isAfter(close);
    }

    public List<Restaurant> getAll() {
        return restaurantRepository.findAll();
    }

    public Restaurant getById(Long id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + id));
    }

    public Restaurant create(RestaurantRequest req) {
        Restaurant r = Restaurant.builder()
                .name(req.getName())
                .description(req.getDescription())
                .location(req.getLocation())
                .city(req.getCity())
                .address(req.getAddress())
                .phone(req.getPhone())
                .email(req.getEmail())
                .cuisine(req.getCuisine())
                .priceRange(req.getPriceRange())
                .rating(req.getRating() == null ? 4.0 : req.getRating())
                .openingTime(req.getOpeningTime())
                .closingTime(req.getClosingTime())
                .imageUrl(req.getImageUrl())
                .status(parseStatus(req.getStatus()))
                .build();
        return restaurantRepository.save(r);
    }

    public Restaurant update(Long id, RestaurantRequest req) {
        Restaurant r = getById(id);
        r.setName(req.getName());
        r.setDescription(req.getDescription());
        r.setLocation(req.getLocation());
        r.setCity(req.getCity());
        r.setAddress(req.getAddress());
        r.setPhone(req.getPhone());
        r.setEmail(req.getEmail());
        r.setCuisine(req.getCuisine());
        r.setPriceRange(req.getPriceRange());
        if (req.getRating() != null) r.setRating(req.getRating());
        r.setOpeningTime(req.getOpeningTime());
        r.setClosingTime(req.getClosingTime());
        if (req.getImageUrl() != null && !req.getImageUrl().isBlank()) r.setImageUrl(req.getImageUrl());
        if (req.getStatus() != null && !req.getStatus().isBlank()) r.setStatus(parseStatus(req.getStatus()));
        return restaurantRepository.save(r);
    }

    public void delete(Long id) {
        Restaurant r = getById(id);
        restaurantRepository.delete(r);
    }

    private RestaurantStatus parseStatus(String status) {
        if (status == null || status.isBlank()) return RestaurantStatus.ACTIVE;
        try {
            return RestaurantStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return RestaurantStatus.ACTIVE;
        }
    }
}
