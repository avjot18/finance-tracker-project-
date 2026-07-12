package com.finance.finance_tracker_backend.security.jwt;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final JwtTokenProvider jwtTokenProvider;

    public JwtService(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public String generateToken(Authentication authentication) {
        return jwtTokenProvider.generateToken(authentication);
    }

    public String generateToken(String email) {
        return jwtTokenProvider.generateToken(email);
    }

    public String getEmailFromToken(String token) {
        return jwtTokenProvider.getEmailFromToken(token);
    }

    public boolean validateToken(String token) {
        return jwtTokenProvider.validateToken(token);
    }
}
