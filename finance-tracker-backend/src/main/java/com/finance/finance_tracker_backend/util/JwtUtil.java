package com.finance.finance_tracker_backend.util;

import com.finance.finance_tracker_backend.security.jwt.JwtTokenProvider;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

    private final JwtTokenProvider jwtTokenProvider;

    public JwtUtil(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public String getEmailFromToken(String token) {
        return jwtTokenProvider.getEmailFromToken(token);
    }

    public boolean validateToken(String token) {
        return jwtTokenProvider.validateToken(token);
    }

    public String generateToken(String email) {
        return jwtTokenProvider.generateToken(email);
    }
}
