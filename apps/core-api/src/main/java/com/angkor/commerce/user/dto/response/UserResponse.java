package com.angkor.commerce.user.dto.response;

import com.angkor.commerce.common.enums.RecordStatus;
import com.angkor.commerce.user.Role;
import com.angkor.commerce.user.User;
import java.time.Instant;

public record UserResponse(
    Long id,
    String firstName,
    String lastName,
    String username,
    String email,
    String phone,
    String image,
    Role role,
    RecordStatus status,
    Instant createdAt,
    Instant updatedAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
            user.getId(),
            user.getFirstName(),
            user.getLastName(),
            user.getUsername(),
            user.getEmail(),
            user.getPhone(),
            user.getImage(),
            user.getRole(),
            user.getStatus(),
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }
}
