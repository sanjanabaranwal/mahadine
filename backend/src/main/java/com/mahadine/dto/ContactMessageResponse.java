package com.mahadine.dto;

import com.mahadine.entity.ContactMessage;
import com.mahadine.entity.ContactStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

/** Admin view of a Get in Touch submission. Never exposes password or other account fields. */
@Data
@AllArgsConstructor
public class ContactMessageResponse {
    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String subject;
    private String message;
    private ContactStatus status;
    private String createdAt;

    /** Must be called while the session is open (user is lazy). */
    public static ContactMessageResponse from(ContactMessage m) {
        return new ContactMessageResponse(
                m.getId(),
                m.getUser() != null ? m.getUser().getId() : null,
                m.getName(), m.getEmail(), m.getSubject(), m.getMessage(),
                m.getStatus() == null ? ContactStatus.NEW : m.getStatus(),
                m.getCreatedAt() == null ? null : m.getCreatedAt().toString());
    }
}
