package dev.mohammadaziz.smartcommerce.backend.user;

import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class EmailVerificationTokenTest {

    @Test
    void shouldCreateUnusedVerificationToken() {
        Instant now = Instant.now();

        User user = new User(
                UUID.randomUUID(),
                "Mohammad Aziz",
                "aziz@example.com",
                "hashed-password",
                false,
                now
        );

        EmailVerificationToken token = new EmailVerificationToken(
                UUID.randomUUID(),
                user,
                "hashed-token",
                now.plusSeconds(3600),
                null,
                now
        );

        assertThat(token.getUser()).isEqualTo(user);
        assertThat(token.getTokenHash()).isEqualTo("hashed-token");
        assertThat(token.getExpiresAt()).isAfter(now);
        assertThat(token.getUsedAt()).isNull();
    }
}