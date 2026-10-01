package dev.mohammadaziz.smartcommerce.backend.user;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class VerificationTokenGeneratorTest {

    private final VerificationTokenGenerator tokenGenerator =
            new VerificationTokenGenerator();

    @Test
    void shouldGenerateTokenAndHash() {
        String rawToken = tokenGenerator.generateToken();
        String tokenHash = tokenGenerator.hashToken(rawToken);

        assertThat(rawToken).isNotBlank();
        assertThat(tokenHash)
                .isNotBlank()
                .isNotEqualTo(rawToken);

    }

    @Test
    void shouldGenerateDifferentTokens() {
        String firstToken = tokenGenerator.generateToken();
        String secondToken = tokenGenerator.generateToken();

        assertThat(firstToken).isNotEqualTo(secondToken);
    }

    @Test
    void shouldProduceSameHashForSameToken() {
        String rawToken = tokenGenerator.generateToken();

        assertThat(tokenGenerator.hashToken(rawToken))
                .isEqualTo(tokenGenerator.hashToken(rawToken));
    }
}