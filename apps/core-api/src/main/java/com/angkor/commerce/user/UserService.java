package com.angkor.commerce.user;

import com.angkor.commerce.common.dto.PageResponse;
import com.angkor.commerce.user.dto.request.CreateUserRequest;
import com.angkor.commerce.user.dto.request.UpdateUserRequest;
import com.angkor.commerce.user.dto.response.UserResponse;

// user here is the role-base => can perform action based on role
// yet in the customer mudule refer to normal user / customer in a shop.
public interface UserService {
    UserResponse getUserById(Long id);
    PageResponse<UserResponse> listUsers(int skip, int limit, String search);
    UserResponse createUser(CreateUserRequest request);
    UserResponse updateUser(Long id, UpdateUserRequest request, Long actorId, Role actorRole);
    UserResponse archiveUser(Long id, Long actorId, Role actorRole);
}
