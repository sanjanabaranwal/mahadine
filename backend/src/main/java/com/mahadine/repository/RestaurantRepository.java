package com.mahadine.repository;

import com.mahadine.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    @Query("SELECT r FROM Restaurant r WHERE " +
           "(:city IS NULL OR LOWER(r.city) LIKE LOWER(CONCAT('%', :city, '%'))) AND " +
           "(:cuisine IS NULL OR LOWER(r.cuisine) LIKE LOWER(CONCAT('%', :cuisine, '%'))) AND " +
           "(:keyword IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(r.location) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Restaurant> search(@Param("city") String city,
                             @Param("cuisine") String cuisine,
                             @Param("keyword") String keyword);
}
