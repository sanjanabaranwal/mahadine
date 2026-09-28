package com.mahadine.service;

import com.mahadine.entity.ReservationStatus;
import com.mahadine.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final RestaurantTableRepository tableRepository;
    private final ReservationRepository reservationRepository;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalRestaurants", restaurantRepository.count());
        stats.put("totalTables", tableRepository.count());
        stats.put("totalReservations", reservationRepository.count());
        stats.put("todayReservations", reservationRepository.countByReservationDate(java.time.LocalDate.now()));
        stats.put("pendingReservations", reservationRepository.countByStatus(ReservationStatus.PENDING));
        stats.put("confirmedReservations", reservationRepository.countByStatus(ReservationStatus.CONFIRMED));
        stats.put("cancelledReservations", reservationRepository.countByStatus(ReservationStatus.CANCELLED));
        stats.put("completedReservations", reservationRepository.countByStatus(ReservationStatus.COMPLETED));
        return stats;
    }

    /**
     * @Transactional is required here: restaurant is a LAZY association on
     * Reservation and open-in-view is false, so r.getRestaurant().getName()
     * below must run while the session that loaded `reservations` is still
     * open, i.e. inside this method's transaction.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getAnalytics() {
        Map<String, Object> analytics = new LinkedHashMap<>();

        // Popular restaurants by reservation count
        var reservations = reservationRepository.findAll();
        Map<String, Long> byRestaurant = new LinkedHashMap<>();
        for (var r : reservations) {
            String name = r.getRestaurant().getName();
            byRestaurant.merge(name, 1L, Long::sum);
        }
        var popular = byRestaurant.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(5)
                .map(e -> Map.of("name", e.getKey(), "bookings", e.getValue()))
                .toList();
        analytics.put("popularRestaurants", popular);

        // Reservation status breakdown
        Map<String, Long> statusBreakdown = new LinkedHashMap<>();
        for (ReservationStatus s : ReservationStatus.values()) {
            statusBreakdown.put(s.name(), reservationRepository.countByStatus(s));
        }
        analytics.put("statusBreakdown", statusBreakdown);

        analytics.put("note", "Demo project - pricing/revenue not modeled");
        return analytics;
    }
}
