package com.angkor.commerce.user;

import com.angkor.commerce.common.ApiConstants;
import com.angkor.commerce.common.dto.PageResponse;
import com.angkor.commerce.security.JwtAuthenticationFilter.AuthenticatedUser;
import com.angkor.commerce.user.dto.request.CreateUserRequest;
import com.angkor.commerce.user.dto.request.UpdateUserRequest;
import com.angkor.commerce.user.dto.response.UserResponse;
import jakarta.validation.Valid;
import java.net.URI;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiConstants.USERS_BASE)
public class UserController {

    private static final int MAX_PAGE_LIMIT = 100;

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<PageResponse<UserResponse>> listUsers(
        @RequestParam(defaultValue = "0") int skip,
        @RequestParam(defaultValue = "30") int limit,
        @RequestParam(required = false) String search
    ) {
        int safeLimit = Math.min(Math.max(limit, 1), MAX_PAGE_LIMIT);
        PageResponse<UserResponse> result = this.userService.listUsers(skip, safeLimit, search);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        UserResponse response = this.userService.getUserById(id);

        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN') or (hasRole('SHOP_ADMIN') and #request.role().name() != 'SUPER_ADMIN')") // Admin an create any role
    public ResponseEntity<UserResponse> create(@RequestBody @Valid CreateUserRequest request) {
        UserResponse response = this.userService.createUser(request);

        return ResponseEntity.created(URI.create(ApiConstants.USERS_BASE + "/" + response.id())).body(response);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<UserResponse> update(
        @PathVariable Long id,
        @RequestBody @Valid UpdateUserRequest request,
        @AuthenticationPrincipal AuthenticatedUser actor
    ) {
        UserResponse response = this.userService.updateUser(id, request, actor.id(), Role.valueOf(actor.role()));

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/archive/{id}")
    public ResponseEntity<UserResponse> archiveUser(
        @PathVariable Long id,
        @AuthenticationPrincipal AuthenticatedUser actor
    ) {
        UserResponse response = this.userService.archiveUser(id, actor.id(), Role.valueOf(actor.role()));

        return ResponseEntity.ok(response);
    }
}
