package com.finance.finance_tracker_backend.service;

import com.finance.finance_tracker_backend.dto.auth.AuthResponse;
import com.finance.finance_tracker_backend.dto.auth.JwtResponse;
import com.finance.finance_tracker_backend.dto.auth.LoginRequest;
import com.finance.finance_tracker_backend.dto.auth.RegisterRequest;

public interface AuthService {
    
    AuthResponse register(RegisterRequest registerRequest);
    
    AuthResponse login(LoginRequest loginRequest);
    
    JwtResponse refreshToken(String refreshToken);
    
    void logout(String email);
}
