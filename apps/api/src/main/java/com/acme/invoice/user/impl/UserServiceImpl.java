package com.acme.invoice.user.impl;

import com.acme.invoice.user.User;
import com.acme.invoice.user.UserRepository;
import com.acme.invoice.user.UserService;
import com.acme.invoice.user.dto.request.CreateUserRequest;
import com.acme.invoice.user.dto.request.UpdateUserRequest;
import com.acme.invoice.user.dto.response.UserListResponse;
import com.acme.invoice.user.dto.response.UserResponse;
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
    public UserResponse getUserById(Long id) {
        return null;
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

        var users = page.getContent().stream().map(this::toResponse).toList();
        return new UserListResponse(users, page.getTotalElements(), skip, safeLimit);
    }

    @Override
    public UserResponse createUser(CreateUserRequest request) {
        return null;
    }

    @Override
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        return null;
    }

    @Override
    public UserResponse archiveUser(Long id) {
        return null;
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
}
