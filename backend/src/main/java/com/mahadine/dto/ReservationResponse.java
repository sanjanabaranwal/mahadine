package com.mahadine.dto;

import com.mahadine.entity.Reservation;
import com.mahadine.entity.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationResponse {
    private Long id;
    private Long userId;
    private String userName;
    private Long restaurantId;
    private String restaurantName;
    private String restaurantImage;
    private Long tableId;
    private String tableNumber;
    private LocalDate reservationDate;
    private LocalTime reservationTime;
    private Integer numberOfGuests;
    private ReservationStatus status;
    private String specialRequest;

    public static ReservationResponse from(Reservation r) {
        return new ReservationResponse(
                r.getId(),
                r.getUser().getId(),
                r.getUser().getName(),
                r.getRestaurant().getId(),
                r.getRestaurant().getName(),
                r.getRestaurant().getImageUrl(),
                r.getTable().getId(),
                r.getTable().getTableNumber(),
                r.getReservationDate(),
                r.getReservationTime(),
                r.getNumberOfGuests(),
                r.getStatus(),
                r.getSpecialRequest()
        );
    }
}
