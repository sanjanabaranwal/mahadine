package com.mahadine.config;

import com.mahadine.entity.*;
import com.mahadine.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Seeds the database with demo data on first run (admin/demo user, sample
 * restaurants across Mumbai/Maharashtra, tables, and a few reservations)
 * so the app looks populated immediately. Runs only if app.seed.enabled=true
 * and the users table is currently empty.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final RestaurantTableRepository tableRepository;
    private final ReservationRepository reservationRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.enabled:true}")
    private boolean seedEnabled;

    @Override
    public void run(String... args) {
        if (!seedEnabled) return;
        if (userRepository.count() > 0) return; // already seeded

        // --- Users ---
        User admin = userRepository.save(User.builder()
                .name("MAHADINE Admin")
                .email("admin@mahadine.com")
                .password(passwordEncoder.encode("Admin@12345"))
                .phone("9820000001")
                .role(Role.ADMIN)
                .enabled(true)
                .build());

        User demoUser = userRepository.save(User.builder()
                .name("Demo Guest")
                .email("user@mahadine.com")
                .password(passwordEncoder.encode("User@12345"))
                .phone("9820000002")
                .role(Role.USER)
                .enabled(true)
                .build());

        // --- Restaurants (demo/sample data for Mumbai & Maharashtra) ---
        List<Restaurant> restaurants = new ArrayList<>();
        restaurants.add(buildRestaurant("MAHADINE - The Bombay Table", "A refined ode to Mumbai's coastal and street-food heritage, plated with a modern touch.",
                "Bandra West", "Mumbai", "12 Waterfield Road, Bandra West", "022-26400001", "bandra@mahadine.com",
                "Multi-cuisine", "$$$", 4.6, "12:00", "23:30", "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800"));
        restaurants.add(buildRestaurant("Spice Route Mumbai", "Bold Indian spices and slow-cooked classics in a warm, lantern-lit dining room.",
                "Colaba", "Mumbai", "45 Shahid Bhagat Singh Road, Colaba", "022-22040002", "colaba@mahadine.com",
                "North Indian", "$$", 4.4, "11:30", "23:00", "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800"));
        restaurants.add(buildRestaurant("Coastal Pearl", "Fresh Konkan seafood, coconut curries, and a breezy sea-facing terrace.",
                "Worli", "Mumbai", "8 Dr Annie Besant Road, Worli", "022-24950003", "worli@mahadine.com",
                "Seafood", "$$$", 4.7, "12:00", "23:00", "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800"));
        restaurants.add(buildRestaurant("Urban Tadka", "A buzzy all-day diner serving comfort Indian food with a contemporary twist.",
                "Andheri West", "Mumbai", "22 Lokhandwala Complex, Andheri West", "022-26330004", "andheri@mahadine.com",
                "Indian", "$$", 4.2, "10:00", "23:30", "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"));
        restaurants.add(buildRestaurant("The Curry House", "Family-run kitchen known for slow-simmered curries and freshly baked naan.",
                "Powai", "Mumbai", "5 Hiranandani Gardens, Powai", "022-25700005", "powai@mahadine.com",
                "North Indian", "$$", 4.3, "11:00", "22:30", "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800"));
        restaurants.add(buildRestaurant("Mumbai Social Dining", "An energetic gastropub blending Mumbai street snacks with craft cocktails.",
                "Lower Parel", "Mumbai", "Kamala Mills Compound, Lower Parel", "022-24900006", "lowerparel@mahadine.com",
                "Continental", "$$$", 4.5, "12:00", "01:00", "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"));
        restaurants.add(buildRestaurant("Royal Maharaja", "Regal Mughlai dining with velvet interiors and rich, aromatic kebabs.",
                "Juhu", "Mumbai", "18 Juhu Tara Road, Juhu", "022-26200007", "juhu@mahadine.com",
                "Mughlai", "$$$$", 4.8, "12:30", "23:30", "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800"));
        restaurants.add(buildRestaurant("The Garden Bistro", "An open-air garden cafe serving wholesome continental and Mediterranean fare.",
                "Pune Camp", "Pune", "9 East Street, Camp", "020-26130008", "pune@mahadine.com",
                "Mediterranean", "$$", 4.3, "09:00", "22:00", "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800"));
        restaurants.add(buildRestaurant("Masala Junction", "A lively food-court-style eatery serving Maharashtrian thalis and chaat.",
                "Thane West", "Thane", "3 Eastern Express Highway, Thane West", "022-25400009", "thane@mahadine.com",
                "Maharashtrian", "$", 4.1, "08:00", "22:00", "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800"));
        restaurants.add(buildRestaurant("The Terrace Kitchen", "Rooftop dining with skyline views, wood-fired grills, and live music evenings.",
                "Nariman Point", "Mumbai", "1 Marine Drive, Nariman Point", "022-22820010", "narimanpoint@mahadine.com",
                "Continental", "$$$$", 4.6, "13:00", "00:00", "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800"));

        restaurants = restaurantRepository.saveAll(restaurants);

        // --- Tables (3-4 per restaurant with varying capacity) ---
        String[] types = {"Indoor", "Outdoor", "Window", "Private", "Bar"};
        List<RestaurantTable> allTables = new ArrayList<>();
        for (Restaurant r : restaurants) {
            int count = 3 + (int) (r.getId() % 2); // 3 or 4 tables
            for (int i = 1; i <= count; i++) {
                int capacity = (i % 4 == 0) ? 8 : (i % 3 == 0) ? 6 : (i % 2 == 0) ? 4 : 2;
                allTables.add(RestaurantTable.builder()
                        .restaurant(r)
                        .tableNumber("T" + i)
                        .capacity(capacity)
                        .tableType(types[i % types.length])
                        .status(TableStatus.AVAILABLE)
                        .build());
            }
        }
        allTables = tableRepository.saveAll(allTables);

        // --- A few demo reservations for the demo user ---
        if (allTables.size() > 3) {
            reservationRepository.save(Reservation.builder()
                    .user(demoUser)
                    .restaurant(allTables.get(0).getRestaurant())
                    .table(allTables.get(0))
                    .reservationDate(LocalDate.now().plusDays(2))
                    .reservationTime(LocalTime.of(19, 30))
                    .numberOfGuests(2)
                    .status(ReservationStatus.CONFIRMED)
                    .specialRequest("Window seat if possible")
                    .build());

            reservationRepository.save(Reservation.builder()
                    .user(demoUser)
                    .restaurant(allTables.get(3).getRestaurant())
                    .table(allTables.get(3))
                    .reservationDate(LocalDate.now().plusDays(5))
                    .reservationTime(LocalTime.of(20, 0))
                    .numberOfGuests(4)
                    .status(ReservationStatus.PENDING)
                    .specialRequest(null)
                    .build());

            reservationRepository.save(Reservation.builder()
                    .user(admin)
                    .restaurant(allTables.get(6).getRestaurant())
                    .table(allTables.get(6))
                    .reservationDate(LocalDate.now())
                    .reservationTime(LocalTime.of(13, 0))
                    .numberOfGuests(3)
                    .status(ReservationStatus.CONFIRMED)
                    .specialRequest("Birthday celebration")
                    .build());
        }

        System.out.println("=========================================================");
        System.out.println(" MAHADINE demo data seeded successfully");
        System.out.println(" Admin login  -> admin@mahadine.com / Admin@12345");
        System.out.println(" User login   -> user@mahadine.com / User@12345");
        System.out.println("=========================================================");
    }

    private Restaurant buildRestaurant(String name, String description, String location, String city,
                                        String address, String phone, String email, String cuisine,
                                        String priceRange, double rating, String open, String close, String image) {
        return Restaurant.builder()
                .name(name)
                .description(description)
                .location(location)
                .city(city)
                .address(address)
                .phone(phone)
                .email(email)
                .cuisine(cuisine)
                .priceRange(priceRange)
                .rating(rating)
                .openingTime(LocalTime.parse(open))
                .closingTime(LocalTime.parse(close))
                .imageUrl(image)
                .status(RestaurantStatus.ACTIVE)
                .build();
    }
}
