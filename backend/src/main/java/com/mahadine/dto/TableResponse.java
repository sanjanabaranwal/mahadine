package com.mahadine.dto;

import com.mahadine.entity.RestaurantTable;
import com.mahadine.entity.TableStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Lightweight table response. Deliberately excludes the lazy-loaded
 * Restaurant relationship so JSON serialization never touches a Hibernate
 * proxy after the persistence context has closed (open-in-view=false).
 */
@Getter
@AllArgsConstructor
public class TableResponse {
    private Long id;
    private String tableNumber;
    private Integer capacity;
    private String tableType;
    private TableStatus status;

    public static TableResponse from(RestaurantTable t) {
        return new TableResponse(t.getId(), t.getTableNumber(), t.getCapacity(), t.getTableType(), t.getStatus());
    }
}
