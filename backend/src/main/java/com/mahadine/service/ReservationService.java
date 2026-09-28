package com.mahadine.service;

import com.mahadine.dto.ReservationRequest;
import com.mahadine.dto.ReservationResponse;
import com.mahadine.entity.*;
import com.mahadine.exception.BadRequestException;
import com.mahadine.exception.BookingConflictException;
import com.mahadine.exception.ResourceNotFoundException;
import com.mahadine.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * IMPORTANT: spring.jpa.open-in-view=false, and Reservation's user/restaurant/table
 * associations are FetchType.LAZY. That means any code that reads those
 * associations (e.g. ReservationResponse.from(), which calls getUser().getName())
 * MUST run while the JPA session for that query is still open - i.e. inside the
 * @Transactional method that fetched the entity. Every public method here that
 * returns reservation data therefore maps straight to ReservationResponse DTOs
 * itself, under @Transactional, instead of handing raw entities back to the
 * controller to map later (which previously caused a LazyInitializationException
 * -> 500 error on GET /api/reservations/my, the "My Bookings" bug).
 */
@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final RestaurantService restaurantService;
    private final RestaurantTableService tableService;

    /**
     * Creates a reservation after validating every business rule server-side.
     * New reservations start as PENDING and require admin confirmation - see
     * REQUIREMENT 2 of the booking workflow. A PENDING reservation still blocks
     * the same table/date/time for other guests (see countActiveConflicts()),
     * so nothing double-books while awaiting confirmation.
     *
     * Synchronized + transactional so two near-simultaneous requests for the
     * same table/date/time cannot both succeed.
     */
    @Transactional
    public synchronized ReservationResponse reserve(User user, ReservationRequest req) {

        Restaurant restaurant = restaurantService.getById(req.getRestaurantId());
        RestaurantTable table = tableService.getById(req.getTableId());

        if (!table.getRestaurant().getId().equals(restaurant.getId())) {
            throw new BadRequestException("Selected table does not belong to this restaurant");
        }
        if (table.getStatus() == TableStatus.MAINTENANCE) {
            throw new BadRequestException("Selected table is currently unavailable");
        }
        if (restaurant.getStatus() != RestaurantStatus.ACTIVE) {
            throw new BadRequestException("This restaurant is not currently accepting reservations");
        }
        if (req.getNumberOfGuests() > table.getCapacity()) {
            throw new BadRequestException("This table can seat a maximum of " + table.getCapacity() + " guests");
        }

        LocalDate today = LocalDate.now();
        if (req.getReservationDate().isBefore(today)) {
            throw new BadRequestException("Reservation date cannot be in the past");
        }
        if (req.getReservationDate().isEqual(today) && req.getReservationTime().isBefore(LocalTime.now())) {
            throw new BadRequestException("Reservation time cannot be in the past");
        }
        if (!isWithinOperatingHours(restaurant, req.getReservationTime())) {
            throw new BadRequestException(String.format(
                    "Reservation time must be between %s and %s",
                    restaurant.getOpeningTime(), restaurant.getClosingTime()));
        }

        long conflicts = reservationRepository.countActiveConflicts(table.getId(), req.getReservationDate(), req.getReservationTime());
        if (conflicts > 0) {
            throw new BookingConflictException("Sorry, this table has just been booked by another customer for the selected date and time.");
        }

        Reservation reservation = Reservation.builder()
                .user(user)
                .restaurant(restaurant)
                .table(table)
                .reservationDate(req.getReservationDate())
                .reservationTime(req.getReservationTime())
                .numberOfGuests(req.getNumberOfGuests())
                .status(ReservationStatus.PENDING)
                .specialRequest(req.getSpecialRequest())
                .build();

        Reservation saved = reservationRepository.save(reservation);
        return ReservationResponse.from(saved);
    }

    private boolean isWithinOperatingHours(Restaurant restaurant, LocalTime time) {
        LocalTime open = restaurant.getOpeningTime();
        LocalTime close = restaurant.getClosingTime();
        if (open == null || close == null) return true;

        if (close.isAfter(open)) {
            return !time.isBefore(open) && !time.isAfter(close);
        } else {
            return !time.isBefore(open) || !time.isAfter(close);
        }
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getMyReservations(Long userId) {
        return reservationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(ReservationResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public ReservationResponse getResponseById(Long id) {
        return ReservationResponse.from(getById(id));
    }

    /** Internal helper - returns the managed entity. Only call this from within an @Transactional method. */
    Reservation getById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + id));
    }

    @Transactional
    public ReservationResponse cancel(Long id, Long requestingUserId, boolean isAdmin) {
        Reservation reservation = getById(id);
        if (!isAdmin && !reservation.getUser().getId().equals(requestingUserId)) {
            throw new BadRequestException("You can only cancel your own reservations");
        }
        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new BadRequestException("Reservation is already cancelled");
        }
        if (reservation.getStatus() == ReservationStatus.COMPLETED) {
            throw new BadRequestException("A completed reservation cannot be cancelled");
        }
        reservation.setStatus(ReservationStatus.CANCELLED);
        Reservation saved = reservationRepository.save(reservation);
        return ReservationResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getAll() {
        return reservationRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(ReservationResponse::from).toList();
    }

    @Transactional
    public ReservationResponse updateStatus(Long id, String statusStr) {
        Reservation reservation = getById(id);
        ReservationStatus status;
        try {
            status = ReservationStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status. Must be one of PENDING, CONFIRMED, CANCELLED, COMPLETED");
        }
        reservation.setStatus(status);
        Reservation saved = reservationRepository.save(reservation);
        return ReservationResponse.from(saved);
    }

    /**
     * Admin edit: date/time/guests/special request. Table and restaurant are not
     * reassignable here to keep the operation's conflict-checking simple and
     * predictable - admin can cancel + the guest can rebook on a different table
     * if a table change is genuinely needed.
     */
    @Transactional
    public ReservationResponse adminUpdate(Long id, ReservationRequest req) {
        Reservation reservation = getById(id);

        if (req.getNumberOfGuests() > reservation.getTable().getCapacity()) {
            throw new BadRequestException("This table can seat a maximum of " + reservation.getTable().getCapacity() + " guests");
        }
        if (!isWithinOperatingHours(reservation.getRestaurant(), req.getReservationTime())) {
            throw new BadRequestException(String.format(
                    "Reservation time must be between %s and %s",
                    reservation.getRestaurant().getOpeningTime(), reservation.getRestaurant().getClosingTime()));
        }

        // Conflict check excluding this reservation's own row
        List<Long> bookedTableIds = reservationRepository.findBookedTableIds(
                reservation.getRestaurant().getId(), req.getReservationDate(), req.getReservationTime());
        boolean conflictsWithAnother = bookedTableIds.contains(reservation.getTable().getId())
                && !(reservation.getReservationDate().equals(req.getReservationDate())
                     && reservation.getReservationTime().equals(req.getReservationTime()));
        if (conflictsWithAnother) {
            throw new BookingConflictException("This table is already booked for the new date/time.");
        }

        reservation.setReservationDate(req.getReservationDate());
        reservation.setReservationTime(req.getReservationTime());
        reservation.setNumberOfGuests(req.getNumberOfGuests());
        reservation.setSpecialRequest(req.getSpecialRequest());

        Reservation saved = reservationRepository.save(reservation);
        return ReservationResponse.from(saved);
    }

    /**
     * Admin delete. Freeing the table is automatic: table availability is
     * computed live from active reservations (see RestaurantTableService.
     * getAvailability()), never from a stored "booked" flag on the table
     * itself, so deleting the row is enough - no extra table-state cleanup
     * needed to keep things consistent.
     */
    @Transactional
    public void delete(Long id) {
        Reservation reservation = getById(id);
        reservationRepository.delete(reservation);
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getTodayReservations() {
        return reservationRepository.findByReservationDate(LocalDate.now())
                .stream().map(ReservationResponse::from).toList();
    }

    public long countByStatus(ReservationStatus status) {
        return reservationRepository.countByStatus(status);
    }

    public long countToday() {
        return reservationRepository.countByReservationDate(LocalDate.now());
    }

    public long countAll() {
        return reservationRepository.count();
    }

    List<Long> findBookedTableIds(Long restaurantId, LocalDate date, LocalTime time) {
        return reservationRepository.findBookedTableIds(restaurantId, date, time);
    }
}
