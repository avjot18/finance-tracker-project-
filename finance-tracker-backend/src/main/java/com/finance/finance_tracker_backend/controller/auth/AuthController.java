package com.finance.finance_tracker_backend.controller.auth;

import com.finance.finance_tracker_backend.common.response.ApiResponse;
import com.finance.finance_tracker_backend.dto.auth.AuthResponse;
import com.finance.finance_tracker_backend.dto.auth.JwtResponse;
import com.finance.finance_tracker_backend.dto.auth.LoginRequest;
import com.finance.finance_tracker_backend.dto.auth.RegisterRequest;
import com.finance.finance_tracker_backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication Module", description = "Endpoints for user registration, login, token refresh, and logout operations.")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register User", description = "Creates a new user account and returns standard access/refresh tokens.")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        AuthResponse responseData = authService.register(registerRequest);
        ApiResponse<AuthResponse> response = ApiResponse.<AuthResponse>builder()
                .success(true)
                .message("User registered successfully.")
                .data(responseData)
                .timestamp(LocalDateTime.now())
                .build();
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "Login User", description = "Authenticates user credentials and returns tokens.")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse responseData = authService.login(loginRequest);
        ApiResponse<AuthResponse> response = ApiResponse.<AuthResponse>builder()
                .success(true)
                .message("Login successful.")
                .data(responseData)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh Token", description = "Uses a valid refresh token to rotate keys and obtain a new access/refresh token pair.")
    public ResponseEntity<ApiResponse<JwtResponse>> refreshToken(@RequestParam String refreshToken) {
        JwtResponse responseData = authService.refreshToken(refreshToken);
        ApiResponse<JwtResponse> response = ApiResponse.<JwtResponse>builder()
                .success(true)
                .message("Tokens refreshed successfully.")
                .data(responseData)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout User", description = "Invalidates the user's refresh token and signs out of the system.")
    public ResponseEntity<ApiResponse<String>> logout(Authentication authentication) {
        if (authentication != null && authentication.getName() != null) {
            authService.logout(authentication.getName());
        }
        ApiResponse<String> response = ApiResponse.<String>builder()
                .success(true)
                .message("Logout successful.")
                .data("Session invalidated.")
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }
}
