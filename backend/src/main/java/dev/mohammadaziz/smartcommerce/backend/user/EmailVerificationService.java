package dev.mohammadaziz.smartcommerce.backend.user;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class EmailVerificationService {

    private final EmailVerificationTokenRepository tokenRepository;
    private final VerificationTokenGenerator tokenGenerator;

    public EmailVerificationService(
            EmailVerificationTokenRepository tokenRepository,
            VerificationTokenGenerator tokenGenerator
    ) {
        this.tokenRepository = tokenRepository;
        this.tokenGenerator = tokenGenerator;
    }

    @Transactional
    public void verify(String rawToken) {
        String tokenHash = tokenGenerator.hashToken(rawToken);

        EmailVerificationToken verificationToken =
                tokenRepository.findByTokenHash(tokenHash)
                        .orElseThrow(InvalidVerificationTokenException::new);

        if (verificationToken.getExpiresAt().isBefore(Instant.now())) {
            throw new ExpiredVerificationTokenException();
        }
        if (verificationToken.getUsedAt() != null) {
            throw new UsedVerificationTokenException();
        }

        verificationToken.getUser().verifyEmail();
        verificationToken.markUsed(Instant.now());
    }
}