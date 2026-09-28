package com.mahadine.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalTime;

@Data
public class RestaurantRequest {

    @NotBlank(message = "Restaurant name is required")
    private String name;

    private String description;

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "City is required")
    private String city;

    private String address;
    private String phone;
    private String email;
    private String cuisine;
    private String priceRange;
    private Double rating;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private String imageUrl;
    private String status;
}
