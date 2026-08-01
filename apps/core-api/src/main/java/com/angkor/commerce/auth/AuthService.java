package com.angkor.commerce.auth;

import com.angkor.commerce.auth.dto.request.LoginRequest;
import com.angkor.commerce.auth.dto.response.CurrentUserResponse;
import com.angkor.commerce.auth.dto.response.LoginResultResponse;

//declare contract and will be implemented later
public interface AuthService {
    LoginResultResponse login(LoginRequest request);
    LoginResultResponse refresh(String refreshToken);
    void logout(String refreshToken);
    CurrentUserResponse getCurrentUser(String username);
}
