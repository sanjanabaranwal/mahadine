package com.mahadine.service;

import com.mahadine.dto.TableRequest;
import com.mahadine.entity.Restaurant;
import com.mahadine.entity.RestaurantTable;
import com.mahadine.entity.TableStatus;
import com.mahadine.exception.ResourceNotFoundException;
import com.mahadine.repository.ReservationRepository;
import com.mahadine.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RestaurantTableService {

    private final RestaurantTableRepository tableRepository;
    private final RestaurantService restaurantService;
    // Depend on the repository directly (not ReservationService) to avoid a
    // circular bean dependency, since ReservationService itself depends on
    // RestaurantTableService.
    private final ReservationRepository reservationRepository;

    public List<RestaurantTable> getByRestaurant(Long restaurantId) {
        return tableRepository.findByRestaurantId(restaurantId);
    }

    public RestaurantTable getById(Long id) {
        return tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found with id: " + id));
    }

    /** Returns tables for a restaurant with availability flag for the given date/time/guests. */
    public List<java.util.Map<String, Object>> getAvailability(Long restaurantId, LocalDate date, LocalTime time, Integer guests) {
        List<RestaurantTable> tables = tableRepository.findByRestaurantId(restaurantId);
        // A closed restaurant cannot take reservations: nothing is bookable outside operating hours.
        boolean open = time == null || restaurantService.isOpenAt(restaurantService.getById(restaurantId), time);
        List<Long> bookedIds = (date != null && time != null)
                ? reservationRepository.findBookedTableIds(restaurantId, date, time)
                : List.of();

        return tables.stream().map(t -> {
            boolean matchesGuests = guests == null || t.getCapacity() >= guests;
            boolean isFree = open && t.getStatus() == TableStatus.AVAILABLE && !bookedIds.contains(t.getId());
            java.util.Map<String, Object> map = new java.util.LinkedHashMap<>();
            map.put("id", t.getId());
            map.put("tableNumber", t.getTableNumber());
            map.put("capacity", t.getCapacity());
            map.put("tableType", t.getTableType());
            map.put("status", t.getStatus());
            map.put("available", isFree && matchesGuests);
            return map;
        }).toList();
    }

    public RestaurantTable create(Long restaurantId, TableRequest req) {
        Restaurant restaurant = restaurantService.getById(restaurantId);
        RestaurantTable table = RestaurantTable.builder()
                .restaurant(restaurant)
                .tableNumber(req.getTableNumber())
                .capacity(req.getCapacity())
                .tableType(req.getTableType())
                .status(parseStatus(req.getStatus()))
                .build();
        return tableRepository.save(table);
    }

    public RestaurantTable update(Long id, TableRequest req) {
        RestaurantTable table = getById(id);
        table.setTableNumber(req.getTableNumber());
        table.setCapacity(req.getCapacity());
        table.setTableType(req.getTableType());
        if (req.getStatus() != null && !req.getStatus().isBlank()) table.setStatus(parseStatus(req.getStatus()));
        return tableRepository.save(table);
    }

    /**
     * Blocks deletion if any reservation (of any status, including past/
     * cancelled ones kept for history) still references this table, since
     * Reservation.table has no cascade-delete and the FK would otherwise
     * surface as a raw, unfriendly database constraint error. Admins should
     * set the table to MAINTENANCE instead if they want to stop new bookings
     * without losing reservation history.
     */
    public void delete(Long id) {
        RestaurantTable table = getById(id);
        long linkedReservations = reservationRepository.countByTableId(id);
        if (linkedReservations > 0) {
            throw new com.mahadine.exception.BadRequestException(
                    "Cannot delete this table: " + linkedReservations +
                    " reservation(s) are linked to it. Set its status to MAINTENANCE instead, or cancel/reassign those reservations first.");
        }
        tableRepository.delete(table);
    }

    private TableStatus parseStatus(String status) {
        if (status == null || status.isBlank()) return TableStatus.AVAILABLE;
        try {
            return TableStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return TableStatus.AVAILABLE;
        }
    }
}
