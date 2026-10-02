package com.mahadine.controller;

import com.mahadine.dto.ApiResponse;
import com.mahadine.dto.TableRequest;
import com.mahadine.dto.TableResponse;
import com.mahadine.entity.RestaurantTable;
import com.mahadine.service.RestaurantTableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class RestaurantTableController {

    private final RestaurantTableService tableService;

    @GetMapping("/api/restaurants/{restaurantId}/tables")
    public ResponseEntity<ApiResponse<List<TableResponse>>> getByRestaurant(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(ApiResponse.ok("Tables fetched", tableService.getByRestaurant(restaurantId).stream().map(TableResponse::from).toList()));
    }

    // Alias matching the public-availability path pattern used by SecurityConfig
    @GetMapping("/api/tables/restaurant/{restaurantId}")
    public ResponseEntity<ApiResponse<List<TableResponse>>> getByRestaurantAlias(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(ApiResponse.ok("Tables fetched", tableService.getByRestaurant(restaurantId).stream().map(TableResponse::from).toList()));
    }

    @PostMapping("/api/restaurants/{restaurantId}/tables")
    public ResponseEntity<ApiResponse<TableResponse>> create(@PathVariable Long restaurantId,
                                                                @Valid @RequestBody TableRequest request) {
        RestaurantTable created = tableService.create(restaurantId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Table created", TableResponse.from(created)));
    }

    @PutMapping("/api/tables/{id}")
    public ResponseEntity<ApiResponse<TableResponse>> update(@PathVariable Long id, @Valid @RequestBody TableRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Table updated", TableResponse.from(tableService.update(id, request))));
    }

    @DeleteMapping("/api/tables/{id}")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable Long id) {
        tableService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Table deleted", null));
    }
}
