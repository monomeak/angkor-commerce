package com.acme.invoice.auth;

import com.acme.invoice.auth.dto.request.LoginRequest;
import com.acme.invoice.auth.dto.request.RefreshRequest;
import com.acme.invoice.auth.dto.response.AuthenticatedUserResponse;
import com.acme.invoice.auth.dto.response.CurrentUserResponse;
import com.acme.invoice.auth.dto.response.LoginResultResponse;

//declare contract and will be implemented later
public interface AuthService {
    LoginResultResponse login(LoginRequest request);
    LoginResultResponse refresh(RefreshRequest request);
    void logout(RefreshRequest request);
    CurrentUserResponse getCurrentUser(String username);
}
