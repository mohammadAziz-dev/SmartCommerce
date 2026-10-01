package dev.mohammadaziz.smartcommerce.backend.user;

public record CsrfTokenResponse(
        String token,
        String headerName
) {
}