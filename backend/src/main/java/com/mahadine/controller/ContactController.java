package com.mahadine.controller;

import com.mahadine.dto.ApiResponse;
import com.mahadine.dto.ContactRequest;
import com.mahadine.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @PostMapping
    public ResponseEntity<ApiResponse<Object>> submit(@Valid @RequestBody ContactRequest request,
                                                 Authentication authentication) {
        // Submitter identity comes only from the verified JWT, never from the request body.
        String email = (authentication != null && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken))
                ? authentication.getName() : null;
        contactService.submit(request, email);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Thanks for reaching out! We'll get back to you soon.", null));
    }
}
