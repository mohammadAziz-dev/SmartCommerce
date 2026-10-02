package dev.mohammadaziz.smartcommerce.backend.user;

import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class EmailVerificationServiceTest {

    private final EmailVerificationTokenRepository tokenRepository =
            mock(EmailVerificationTokenRepository.class);

    private final VerificationTokenGenerator tokenGenerator =
            mock(VerificationTokenGenerator.class);

    @Test
    void shouldVerifyUserWithValidToken() {
        User user = new User(
                UUID.randomUUID(),
                "Mohammad Aziz",
                "aziz@example.com",
                "hashed-password",
                false,
                Instant.now()
        );

        EmailVerificationToken verificationToken =
                new EmailVerificationToken(
                        UUID.randomUUID(),
                        user,
                        "hashed-token",
                        Instant.now().plusSeconds(3600),
                        null,
                        Instant.now()
                );

        when(tokenGenerator.hashToken("raw-token"))
                .thenReturn("hashed-token");

        when(tokenRepository.findByTokenHash("hashed-token"))
                .thenReturn(Optional.of(verificationToken));

        EmailVerificationService verificationService =
                new EmailVerificationService(
                        tokenRepository,
                        tokenGenerator
                );

        verificationService.verify("raw-token");

        assertThat(user.isEmailVerified()).isTrue();
        assertThat(verificationToken.getUsedAt()).isNotNull();
    }

    @Test
    void shouldRejectInvalidToken() {
        when(tokenGenerator.hashToken("invalid-token"))
                .thenReturn("invalid-hash");

        when(tokenRepository.findByTokenHash("invalid-hash"))
                .thenReturn(Optional.empty());

        EmailVerificationService verificationService =
                new EmailVerificationService(
                        tokenRepository,
                        tokenGenerator
                );

        assertThatThrownBy(() ->
                verificationService.verify("invalid-token")
        ).isInstanceOf(InvalidVerificationTokenException.class);
    }

    @Test
    void shouldRejectExpiredToken() {
        User user = new User(
                UUID.randomUUID(),
                "Mohammad Aziz",
                "aziz@example.com",
                "hashed-password",
                false,
                Instant.now()
        );

        EmailVerificationToken verificationToken =
                new EmailVerificationToken(
                        UUID.randomUUID(),
                        user,
                        "hashed-token",
                        Instant.now().minusSeconds(60),
                        null,
                        Instant.now().minusSeconds(3600)
                );

        when(tokenGenerator.hashToken("raw-token"))
                .thenReturn("hashed-token");

        when(tokenRepository.findByTokenHash("hashed-token"))
                .thenReturn(Optional.of(verificationToken));

        EmailVerificationService verificationService =
                new EmailVerificationService(
                        tokenRepository,
                        tokenGenerator
                );

        assertThatThrownBy(() ->
                verificationService.verify("raw-token")
        ).isInstanceOf(ExpiredVerificationTokenException.class);

        assertThat(user.isEmailVerified()).isFalse();
    }

    @Test
    void shouldRejectAlreadyUsedToken() {
        User user = new User(
                UUID.randomUUID(),
                "Mohammad Aziz",
                "aziz@example.com",
                "hashed-password",
                false,
                Instant.now()
        );

        EmailVerificationToken verificationToken =
                new EmailVerificationToken(
                        UUID.randomUUID(),
                        user,
                        "hashed-token",
                        Instant.now().plusSeconds(3600),
                        Instant.now().minusSeconds(60),
                        Instant.now()
                );

        when(tokenGenerator.hashToken("raw-token"))
                .thenReturn("hashed-token");

        when(tokenRepository.findByTokenHash("hashed-token"))
                .thenReturn(Optional.of(verificationToken));

        EmailVerificationService verificationService =
                new EmailVerificationService(
                        tokenRepository,
                        tokenGenerator
                );

        assertThatThrownBy(() ->
                verificationService.verify("raw-token")
        ).isInstanceOf(UsedVerificationTokenException.class);

        assertThat(user.isEmailVerified()).isFalse();
    }
}