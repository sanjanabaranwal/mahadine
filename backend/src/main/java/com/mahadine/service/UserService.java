package com.mahadine.service;

import com.mahadine.dto.UpdateProfileRequest;
import com.mahadine.dto.UserResponse;
import com.mahadine.entity.User;
import com.mahadine.exception.ResourceNotFoundException;
import com.mahadine.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public UserResponse getProfile(String email) {
        return UserResponse.from(getByEmail(email));
    }

    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = getByEmail(email);
        user.setName(request.getName());
        user.setPhone(request.getPhone());
        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            if (request.getNewPassword().length() < 6) {
                throw new IllegalArgumentException("Password must be at least 6 characters");
            }
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }
        return UserResponse.from(userRepository.save(user));
    }
}
