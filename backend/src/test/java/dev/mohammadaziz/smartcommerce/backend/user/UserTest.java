package dev.mohammadaziz.smartcommerce.backend.user;

import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class UserTest {

    @Test
    void shouldCreateUserWithUnverifiedEmail() {
        User user = new User(
                UUID.randomUUID(),
                "Mohammad Aziz",
                "aziz@example.com",
                "hashed-password",
                false,
                Instant.now()
        );

        assertThat(user.getName()).isEqualTo("Mohammad Aziz");
        assertThat(user.getEmail()).isEqualTo("aziz@example.com");
        assertThat(user.getPasswordHash()).isEqualTo("hashed-password");
        assertThat(user.isEmailVerified()).isFalse();
    }
}
