package com.mahadine.controller;

import com.mahadine.dto.ApiResponse;
import com.mahadine.dto.ContactMessageResponse;
import com.mahadine.entity.ContactStatus;
import com.mahadine.service.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin "Reviews & Questions" - submissions from the user Get in Touch form.
 * ADMIN-only via SecurityConfig's .requestMatchers("/api/admin/**").hasRole("ADMIN").
 */
@RestController
@RequestMapping("/api/admin/reviews-questions")
@RequiredArgsConstructor
public class AdminContactController {

    private final ContactService contactService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ContactMessageResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.ok("Messages fetched", contactService.getAll()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<ContactMessageResponse>> markRead(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Marked as read", contactService.setStatus(id, ContactStatus.READ)));
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<ApiResponse<ContactMessageResponse>> resolve(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Marked as resolved", contactService.setStatus(id, ContactStatus.RESOLVED)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable Long id) {
        contactService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Message deleted", null));
    }
}
