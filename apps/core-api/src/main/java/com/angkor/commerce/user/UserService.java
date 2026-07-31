package com.angkor.commerce.user;

import com.angkor.commerce.user.dto.request.CreateUserRequest;
import com.angkor.commerce.user.dto.request.UpdateUserRequest;
import com.angkor.commerce.user.dto.response.UserListResponse;
import com.angkor.commerce.user.dto.response.UserResponse;

// user here is the role-base => can perform action based on role
// yet in the customer mudule refer to normal user / customer in a shop.
public interface UserService {
    UserResponse getUserById(Long id);
    UserListResponse listUsers(int skip, int limit, String search);
    UserResponse createUser(CreateUserRequest request);
    UserResponse updateUser(Long id, UpdateUserRequest request);
    UserResponse archiveUser(Long id);
}
