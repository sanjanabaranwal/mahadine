package com.mahadine.service;

import com.mahadine.dto.ContactMessageResponse;
import com.mahadine.dto.ContactRequest;
import com.mahadine.entity.ContactMessage;
import com.mahadine.entity.ContactStatus;
import com.mahadine.exception.ResourceNotFoundException;
import com.mahadine.repository.ContactMessageRepository;
import com.mahadine.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactMessageRepository contactMessageRepository;
    private final UserRepository userRepository;

    /** @param authenticatedEmail email of the JWT-authenticated user, or null for a guest */
    public ContactMessage submit(ContactRequest req, String authenticatedEmail) {
        ContactMessage message = ContactMessage.builder()
                .name(req.getName().trim())
                .email(req.getEmail().trim())
                .subject(req.getSubject().trim())
                .message(req.getMessage().trim())
                .status(ContactStatus.NEW)
                .user(authenticatedEmail == null ? null
                        : userRepository.findByEmail(authenticatedEmail).orElse(null))
                .build();
        return contactMessageRepository.save(message);
    }

    @Transactional(readOnly = true)
    public List<ContactMessageResponse> getAll() {
        return contactMessageRepository.findAllByOrderByCreatedAtDescIdDesc()
                .stream().map(ContactMessageResponse::from).toList();
    }

    @Transactional
    public ContactMessageResponse setStatus(Long id, ContactStatus status) {
        ContactMessage m = contactMessageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found with id: " + id));
        m.setStatus(status);
        return ContactMessageResponse.from(contactMessageRepository.save(m));
    }

    @Transactional
    public void delete(Long id) {
        ContactMessage m = contactMessageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found with id: " + id));
        contactMessageRepository.delete(m);
    }
}
