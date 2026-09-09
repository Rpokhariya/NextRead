package com.nextread.nextread.service;

import com.nextread.nextread.dto.TokenResponseDTO;
import com.nextread.nextread.entity.User;
import com.nextread.nextread.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }


    // =====================================================
    // REGISTER
    // =====================================================

    public TokenResponseDTO register(
            String email,
            String password
    ) {

        if (userRepository.existsByEmail(email)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email already registered"
            );
        }

        User user = new User();

        user.setEmail(email);

        // BCrypt hashing
        user.setHashedPassword(
                passwordEncoder.encode(password)
        );

        User savedUser =
                userRepository.save(user);

        // Generate JWT after successful registration
        String token =
                jwtService.generateToken(
                        savedUser.getEmail()
                );

        return new TokenResponseDTO(
                token,
                "bearer"
        );
    }


    // =====================================================
    // LOGIN
    // =====================================================

    public TokenResponseDTO login(
            String email,
            String password
    ) {

        User user =
                userRepository.findByEmail(email)
                        .orElse(null);

        if (user == null) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Incorrect email or password"
            );
        }

        boolean passwordMatches =
                passwordEncoder.matches(
                        password,
                        user.getHashedPassword()
                );

        if (!passwordMatches) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Incorrect email or password"
            );
        }

        String token =
                jwtService.generateToken(
                        user.getEmail()
                );

        return new TokenResponseDTO(
                token,
                "bearer"
        );
    }
}