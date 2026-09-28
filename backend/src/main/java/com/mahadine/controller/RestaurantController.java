package com.mahadine.controller;

import com.mahadine.dto.ApiResponse;
import com.mahadine.dto.RestaurantRequest;
import com.mahadine.entity.Restaurant;
import com.mahadine.service.RestaurantService;
import com.mahadine.service.RestaurantTableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;
    private final RestaurantTableService tableService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Restaurant>>> list(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String cuisine,
            @RequestParam(required = false) String keyword) {
        List<Restaurant> restaurants = restaurantService.search(city, cuisine, keyword);
        return ResponseEntity.ok(ApiResponse.ok("Restaurants fetched", restaurants));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Restaurant>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Restaurant fetched", restaurantService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Restaurant>> create(@Valid @RequestBody RestaurantRequest request) {
        Restaurant created = restaurantService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Restaurant created", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Restaurant>> update(@PathVariable Long id, @Valid @RequestBody RestaurantRequest request) {
        Restaurant updated = restaurantService.update(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Restaurant updated", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable Long id) {
        restaurantService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Restaurant deleted", null));
    }

    /**
     * Returns the restaurant's tables with a computed "available" flag for the
     * given date/time/guest count. If date/time are omitted, only base table
     * status (AVAILABLE/MAINTENANCE) is considered.
     */
    @GetMapping("/{restaurantId}/availability")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> availability(
            @PathVariable Long restaurantId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(pattern = "HH:mm") LocalTime time,
            @RequestParam(required = false) Integer guests) {
        List<Map<String, Object>> result = tableService.getAvailability(restaurantId, date, time, guests);
        return ResponseEntity.ok(ApiResponse.ok("Availability fetched", result));
    }
}
