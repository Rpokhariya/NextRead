package com.nextread.nextread.controller;

import com.nextread.nextread.dto.LoginRequestDTO;
import com.nextread.nextread.dto.RegisterRequestDTO;
import com.nextread.nextread.dto.TokenResponseDTO;
import com.nextread.nextread.service.AuthService;

import jakarta.validation.Valid;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // =====================================================
    // REGISTER - JSON
    // This is what the current frontend sends.
    // =====================================================

    @PostMapping(
            value = "/register",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<TokenResponseDTO> registerJson(
            @Valid @RequestBody RegisterRequestDTO request
    ) {

        TokenResponseDTO response =
                authService.register(
                        request.getEmail(),
                        request.getPassword()
                );

        return ResponseEntity.ok(response);
    }


    // =====================================================
    // REGISTER - MULTIPART
    // Kept for compatibility with previous testing/frontend
    // =====================================================

    @PostMapping(
            value = "/register",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<TokenResponseDTO> registerMultipart(
            @RequestParam("email") String email,
            @RequestParam("password") String password
    ) {

        TokenResponseDTO response =
                authService.register(email, password);

        return ResponseEntity.ok(response);
    }


    // =====================================================
    // LOGIN
    // Frontend sends username + password as form data.
    // =====================================================

    @PostMapping(
            value = "/login",
            consumes = {
                    MediaType.APPLICATION_FORM_URLENCODED_VALUE,
                    MediaType.MULTIPART_FORM_DATA_VALUE
            },
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<TokenResponseDTO> login(
            @RequestParam("username") String username,
            @RequestParam("password") String password
    ) {

        TokenResponseDTO response =
                authService.login(username, password);

        return ResponseEntity.ok(response);
    }


    // =====================================================
    // LOGIN - JSON compatibility
    // Doesn't change frontend behaviour, but makes the
    // endpoint easier to test.
    // =====================================================

    @PostMapping(
            value = "/login",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<TokenResponseDTO> loginJson(
            @RequestBody LoginRequestDTO request
    ) {

        TokenResponseDTO response =
                authService.login(
                        request.getUsername(),
                        request.getPassword()
                );

        return ResponseEntity.ok(response);
    }
}