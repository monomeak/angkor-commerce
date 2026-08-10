package com.angkor.commerce.user.mapper;

import com.angkor.commerce.common.storage.ImageStorageService;
import com.angkor.commerce.user.User;
import com.angkor.commerce.user.dto.response.UserSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserMapper {

    private final ImageStorageService imageStorageService;

    /**
     * Staff badge for records another module owns (wallet ledger, audit trails).
     * Null in, null out — a row with no actor is a system action, not an error.
     */
    public UserSummaryResponse toSummary(User user) {
        if (user == null) {
            return null;
        }
        return new UserSummaryResponse(
            user.getId(),
            user.getFirstName(),
            user.getLastName(),
            user.getEmail(),
            imageStorageService.resolveUrl(user.getImage()),
            user.getRole()
        );
    }
}
