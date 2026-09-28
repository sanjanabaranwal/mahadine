package com.mahadine.controller;

import com.mahadine.dto.ApiResponse;
import com.mahadine.dto.ReservationRequest;
import com.mahadine.dto.ReservationResponse;
import com.mahadine.dto.ReservationStatusRequest;
import com.mahadine.dto.UserResponse;
import com.mahadine.entity.Restaurant;
import com.mahadine.repository.UserRepository;
import com.mahadine.service.AdminService;
import com.mahadine.service.ReservationService;
import com.mahadine.service.RestaurantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Every endpoint here requires the ADMIN role - enforced in SecurityConfig
 * via .requestMatchers("/api/admin/**").hasRole("ADMIN"), not by anything in
 * this controller or the frontend. A USER-role JWT hitting any of these URLs
 * gets a 403, regardless of what the frontend does or doesn't show.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final ReservationService reservationService;
    private final RestaurantService restaurantService;
    private final UserRepository userRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> dashboard() {
        Map<String, Object> stats = adminService.getDashboardStats();
        List<ReservationResponse> recent = reservationService.getAll().stream().limit(10).toList();
        stats.put("recentReservations", recent);
        return ResponseEntity.ok(ApiResponse.ok("Dashboard stats", stats));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> users() {
        List<UserResponse> users = userRepository.findAll().stream().map(UserResponse::from).toList();
        return ResponseEntity.ok(ApiResponse.ok("Users fetched", users));
    }

    @GetMapping("/restaurants")
    public ResponseEntity<ApiResponse<List<Restaurant>>> restaurants() {
        return ResponseEntity.ok(ApiResponse.ok("Restaurants fetched", restaurantService.getAll()));
    }

    @GetMapping("/reservations")
    public ResponseEntity<ApiResponse<List<ReservationResponse>>> reservations() {
        return ResponseEntity.ok(ApiResponse.ok("Reservations fetched", reservationService.getAll()));
    }

    /** Quick status change - used by the Confirm / Cancel / Mark Completed buttons. */
    @PutMapping("/reservations/{id}/status")
    public ResponseEntity<ApiResponse<ReservationResponse>> updateStatus(@PathVariable Long id,
                                                                           @Valid @RequestBody ReservationStatusRequest request) {
        ReservationResponse updated = reservationService.updateStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.ok("Reservation status updated", updated));
    }

    /** Full edit - date/time/guests/special request. Used by the admin Edit button. */
    @PutMapping("/reservations/{id}")
    public ResponseEntity<ApiResponse<ReservationResponse>> updateReservation(@PathVariable Long id,
                                                                                @Valid @RequestBody ReservationRequest request) {
        ReservationResponse updated = reservationService.adminUpdate(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Reservation updated", updated));
    }

    /** Deletes the reservation outright. The table is freed automatically since availability is computed live. */
    @DeleteMapping("/reservations/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteReservation(@PathVariable Long id) {
        reservationService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Reservation deleted", null));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> analytics() {
        return ResponseEntity.ok(ApiResponse.ok("Analytics fetched", adminService.getAnalytics()));
    }
}
