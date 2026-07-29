package com.angkor.commerce.user.dto.response;

import java.util.List;

public record UserListResponse(List<UserResponse> users, long total, int skip, int limit) {}
