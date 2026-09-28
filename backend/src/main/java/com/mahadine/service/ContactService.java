package com.mahadine.service;

import com.mahadine.dto.ContactRequest;
import com.mahadine.entity.ContactMessage;
import com.mahadine.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactMessageRepository contactMessageRepository;

    public ContactMessage submit(ContactRequest req) {
        ContactMessage message = ContactMessage.builder()
                .name(req.getName())
                .email(req.getEmail())
                .subject(req.getSubject())
                .message(req.getMessage())
                .build();
        return contactMessageRepository.save(message);
    }
}
