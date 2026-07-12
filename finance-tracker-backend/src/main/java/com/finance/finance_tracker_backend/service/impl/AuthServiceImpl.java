package com.finance.finance_tracker_backend.service.impl;

import com.finance.finance_tracker_backend.dto.auth.AuthResponse;
import com.finance.finance_tracker_backend.dto.auth.JwtResponse;
import com.finance.finance_tracker_backend.dto.auth.LoginRequest;
import com.finance.finance_tracker_backend.dto.auth.RegisterRequest;
import com.finance.finance_tracker_backend.entity.RefreshToken;
import com.finance.finance_tracker_backend.entity.User;
import com.finance.finance_tracker_backend.exception.DuplicateResourceException;
import com.finance.finance_tracker_backend.exception.ResourceNotFoundException;
import com.finance.finance_tracker_backend.exception.UnauthorizedException;
import com.finance.finance_tracker_backend.mapper.UserMapper;
import com.finance.finance_tracker_backend.repository.RefreshTokenRepository;
import com.finance.finance_tracker_backend.repository.UserRepository;
import com.finance.finance_tracker_backend.security.jwt.JwtTokenProvider;
import com.finance.finance_tracker_backend.service.AuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserMapper userMapper;

    @Value("${app.jwt.refreshExpirationMs}")
    private long refreshExpirationMs;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                            UserRepository userRepository,
                            RefreshTokenRepository refreshTokenRepository,
                            PasswordEncoder passwordEncoder,
                            JwtTokenProvider jwtTokenProvider,
                            UserMapper userMapper) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userMapper = userMapper;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new DuplicateResourceException("Email address is already in use: " + registerRequest.getEmail());
        }

        User user = userMapper.toEntity(registerRequest);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        User savedUser = userRepository.save(user);

        String accessToken = jwtTokenProvider.generateToken(savedUser.getEmail());
        RefreshToken refreshToken = createRefreshToken(savedUser);

        return userMapper.toAuthResponse(savedUser, accessToken, refreshToken.getToken());
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + loginRequest.getEmail()));

        String accessToken = jwtTokenProvider.generateToken(user.getEmail());
        RefreshToken refreshToken = createRefreshToken(user);

        return userMapper.toAuthResponse(user, accessToken, refreshToken.getToken());
    }

    @Override
    @Transactional
    public JwtResponse refreshToken(String tokenStr) {
        return refreshTokenRepository.findByToken(tokenStr)
                .map(this::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String accessToken = jwtTokenProvider.generateToken(user.getEmail());
                    // Rotate the refresh token for better security (optional but standard in high-sec apps, 
                    // we'll update expiration or keep same token with updated time, or issue a rotated one).
                    // We will update the expiration of the current token or create a new one. Let's rotate.
                    refreshTokenRepository.deleteByUser(user);
                    RefreshToken newRefreshToken = createRefreshToken(user);
                    
                    return JwtResponse.builder()
                            .accessToken(accessToken)
                            .refreshToken(newRefreshToken.getToken())
                            .build();
                })
                .orElseThrow(() -> new UnauthorizedException("Refresh token is not in database!"));
    }

    @Override
    @Transactional
    public void logout(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        refreshTokenRepository.deleteByUser(user);
        SecurityContextHolder.clearContext();
    }

    private RefreshToken createRefreshToken(User user) {
        // Delete any existing refresh token for user
        refreshTokenRepository.deleteByUser(user);
        refreshTokenRepository.flush();

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(refreshExpirationMs))
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    private RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new UnauthorizedException("Refresh token was expired. Please make a new signin request");
        }
        return token;
    }
}
