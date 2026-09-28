package com.mahadine.repository;

import com.mahadine.entity.Reservation;
import com.mahadine.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Reservation> findAllByOrderByCreatedAtDesc();

    List<Reservation> findByReservationDate(LocalDate date);

    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.table.id = :tableId " +
           "AND r.reservationDate = :date AND r.reservationTime = :time " +
           "AND r.status IN (com.mahadine.entity.ReservationStatus.PENDING, com.mahadine.entity.ReservationStatus.CONFIRMED)")
    long countActiveConflicts(@Param("tableId") Long tableId,
                               @Param("date") LocalDate date,
                               @Param("time") LocalTime time);

    @Query("SELECT r.table.id FROM Reservation r WHERE r.restaurant.id = :restaurantId " +
           "AND r.reservationDate = :date AND r.reservationTime = :time " +
           "AND r.status IN (com.mahadine.entity.ReservationStatus.PENDING, com.mahadine.entity.ReservationStatus.CONFIRMED)")
    List<Long> findBookedTableIds(@Param("restaurantId") Long restaurantId,
                                   @Param("date") LocalDate date,
                                   @Param("time") LocalTime time);

    long countByStatus(ReservationStatus status);

    long countByReservationDate(LocalDate date);

    long countByTableId(Long tableId);
}
