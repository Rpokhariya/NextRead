package com.nextread.nextread.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    // =====================================================
    // PASSWORD ENCODER
    // BCrypt ONLY
    // =====================================================

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


    // =====================================================
    // SECURITY CONFIGURATION
    // =====================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

            // -------------------------------------------------
            // CORS
            // -------------------------------------------------
            .cors(cors -> {})

            // -------------------------------------------------
            // CSRF
            // Disabled because authentication uses JWT
            // -------------------------------------------------
            .csrf(csrf -> csrf.disable())

            // -------------------------------------------------
            // SESSION
            // JWT authentication = stateless
            // -------------------------------------------------
            .sessionManagement(session ->
                    session.sessionCreationPolicy(
                            SessionCreationPolicy.STATELESS
                    )
            )

            // -------------------------------------------------
            // AUTHORIZATION
            // -------------------------------------------------
            .authorizeHttpRequests(auth -> auth

                    // OPTIONS requests for CORS
                    .requestMatchers(
                            HttpMethod.OPTIONS,
                            "/**"
                    ).permitAll()

                    // PUBLIC ENDPOINTS
                    .requestMatchers(
                            "/",
                            "/register",
                            "/login",
                            "/goals",
                            "/books/popular",
                            "/books/search"
                    ).permitAll()

                    // EVERYTHING ELSE IS PROTECTED
                    .anyRequest().authenticated()
            )

            // -------------------------------------------------
            // IMPORTANT:
            // Read JWT before Spring checks authentication
            // -------------------------------------------------
            .addFilterBefore(
                    jwtAuthenticationFilter,
                    UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}