package com.mahadine.controller;

import com.mahadine.dto.ApiResponse;
import com.mahadine.dto.ReservationRequest;
import com.mahadine.dto.ReservationResponse;
import com.mahadine.entity.Role;
import com.mahadine.entity.User;
import com.mahadine.service.ReservationService;
import com.mahadine.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<ApiResponse<ReservationResponse>> create(Authentication authentication,
                                                                     @Valid @RequestBody ReservationRequest request) {
        User user = userService.getByEmail(authentication.getName());
        ReservationResponse reservation = reservationService.reserve(user, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Booking submitted - waiting for admin confirmation.", reservation));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<ReservationResponse>>> myReservations(Authentication authentication) {
        User user = userService.getByEmail(authentication.getName());
        List<ReservationResponse> list = reservationService.getMyReservations(user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Your reservations", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReservationResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Reservation fetched", reservationService.getResponseById(id)));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<ReservationResponse>> cancel(Authentication authentication, @PathVariable Long id) {
        User user = userService.getByEmail(authentication.getName());
        boolean isAdmin = user.getRole() == Role.ADMIN;
        ReservationResponse cancelled = reservationService.cancel(id, user.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.ok("Reservation cancelled", cancelled));
    }
}
