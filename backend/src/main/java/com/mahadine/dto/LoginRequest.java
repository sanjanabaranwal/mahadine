package com.mahadine.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    /** Which portal the login came from: "ADMIN" or "USER" (default). Only selects the door; the account's real role is always verified from the database. */
    private String portal;
}
