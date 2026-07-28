package com.acme.invoice.user.impl;

import com.acme.invoice.common.enums.RecordStatus;
import com.acme.invoice.common.exception.ResourceNotFoundException;
import com.acme.invoice.common.exception.ValidationException;
import com.acme.invoice.user.Role;
import com.acme.invoice.user.User;
import com.acme.invoice.user.UserRepository;
import com.acme.invoice.user.UserService;
import com.acme.invoice.user.dto.request.CreateUserRequest;
import com.acme.invoice.user.dto.request.UpdateUserRequest;
import com.acme.invoice.user.dto.response.UserListResponse;
import com.acme.invoice.user.dto.response.UserResponse;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public UserListResponse listUsers(int skip, int limit, String search) {
        int safeLimit = limit <= 0 ? 30 : limit;
        int pageNumber = safeLimit == 0 ? 0 : skip / safeLimit;
        Pageable pageable = PageRequest.of(pageNumber, safeLimit, Sort.by(Sort.Direction.ASC, "id"));
        Page<User> page;

        if (StringUtils.hasText(search)) {
            page =
                userRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                    search,
                    search,
                    search,
                    pageable
                );
        } else {
            page = userRepository.findAll(pageable);
        }

        // :: lamda syntax
        var users = page.getContent().stream().map(this::toResponse).toList();
        return new UserListResponse(users, page.getTotalElements(), skip, safeLimit);
    }

    @Override
    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.exexistsByUsername(request.username())) {
            throw new ValidationException(
                "Username is already taken.",
                Map.of("username", "This username is already in use.")
            );
        }

        if (userRepository.exexistsByUsername(request.email())) {
            throw new ValidationException("Email is already taken.");
        }
        // instance new user objective and set the values

        User user = new User();
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPhone(request.phone());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(request.role() != null ? request.role() : Role.STAFF); // default role: STAFF
        user.setStatus(RecordStatus.ACTIVE);

        return toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = findUserOrThrow(id);
        if (request.email() != null && request.email().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.exexistsByEmail(request.email())) {
                throw new ValidationException(
                    "Email is already registered",
                    Map.of("email", "This email is already in use.")
                );
            }
            user.setEmail(request.email());
        }
        if (request.firstName() != null) {
            user.setFirstName(request.firstName());
        }

        if (request.lastName() != null) {
            user.setLastName(request.lastName());
        }
        if (request.phone() != null) {
            user.setPhone(request.phone());
        }
        if (request.image() != null) {
            user.setImage(request.image());
        }
        if (request.role() != null) {
            user.setRole(request.role());
        }
        if (request.status() != null) {
            user.setStatus(request.status());
        }
        return toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse archiveUser(Long id) {
        User user = findUserOrThrow(id);
        user.setStatus(RecordStatus.INACTIVE);
        return toResponse(userRepository.save(user));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        return toResponse(findUserOrThrow(id));
    }

    private UserResponse toResponse(User user) {
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

    private User findUserOrThrow(Long id) {
        return userRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("User", id));
    }
}
