package com.acme.invoice.user;

import com.acme.invoice.user.dto.request.CreateUserRequest;
import com.acme.invoice.user.dto.request.UpdateUserRequest;
import com.acme.invoice.user.dto.response.UserListResponse;
import com.acme.invoice.user.dto.response.UserResponse;

public interface UserService {
    UserResponse getUserById(Long id);
    UserListResponse listUsers(int skip, int limit, String search);
    UserResponse createUser(CreateUserRequest request);
    UserResponse updateUser(Long id, UpdateUserRequest request);
    UserResponse archiveUser(Long id);
}
