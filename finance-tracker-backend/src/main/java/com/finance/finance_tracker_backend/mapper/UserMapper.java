package com.finance.finance_tracker_backend.mapper;

import com.finance.finance_tracker_backend.dto.auth.AuthResponse;
import com.finance.finance_tracker_backend.dto.auth.RegisterRequest;
import com.finance.finance_tracker_backend.entity.User;
import com.finance.finance_tracker_backend.enums.Role;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toEntity(RegisterRequest request) {
        if (request == null) {
            return null;
        }

        Role role = Role.ROLE_USER;
        if (request.getRole() != null) {
            try {
                role = Role.valueOf(request.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                // Default to ROLE_USER if role string is invalid
            }
        }

        return User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(request.getPassword())
                .role(role)
                .build();
    }

    public AuthResponse toAuthResponse(User user, String accessToken, String refreshToken) {
        if (user == null) {
            return null;
        }

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }
}
