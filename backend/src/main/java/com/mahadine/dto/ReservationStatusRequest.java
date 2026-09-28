package com.mahadine.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReservationStatusRequest {

    @NotBlank(message = "Status is required")
    private String status;
}
