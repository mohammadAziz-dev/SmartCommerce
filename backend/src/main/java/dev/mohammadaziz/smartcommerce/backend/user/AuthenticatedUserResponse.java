package dev.mohammadaziz.smartcommerce.backend.user;

import java.util.UUID;

public record AuthenticatedUserResponse(
        UUID id,
        String name,
        String email,
        boolean emailVerified
) {
}