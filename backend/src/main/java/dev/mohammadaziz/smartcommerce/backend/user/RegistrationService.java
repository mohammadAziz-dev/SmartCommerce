package dev.mohammadaziz.smartcommerce.backend.user;

import dev.mohammadaziz.smartcommerce.backend.email.EmailService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

@Service
public class RegistrationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationTokenRepository tokenRepository;
    private final VerificationTokenGenerator tokenGenerator;
    private final EmailService emailService;
    private final String frontendUrl;

    public RegistrationService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            EmailVerificationTokenRepository tokenRepository,
            VerificationTokenGenerator tokenGenerator,
            EmailService emailService,
            @Value("${app.frontend-url}") String frontendUrl
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenRepository = tokenRepository;
        this.tokenGenerator = tokenGenerator;
        this.emailService = emailService;
        this.frontendUrl = frontendUrl;
    }

    @Transactional
    public User register(String name, String email, String password) {
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new EmailAlreadyExistsException();
        }

        String passwordHash = passwordEncoder.encode(password);

        User user = new User(
                UUID.randomUUID(),
                name,
                normalizedEmail,
                passwordHash,
                false,
                Instant.now()
        );

        User savedUser = userRepository.save(user);

        String rawToken = tokenGenerator.generateToken();
        String tokenHash = tokenGenerator.hashToken(rawToken);

        Instant now = Instant.now();

        EmailVerificationToken verificationToken =
                new EmailVerificationToken(
                        UUID.randomUUID(),
                        savedUser,
                        tokenHash,
                        now.plusSeconds(3600),
                        null,
                        now
                );

        tokenRepository.save(verificationToken);

        String verificationUrl =
                frontendUrl + "/verify-email?token=" + rawToken;

        emailService.sendEmailVerification(
                savedUser.getEmail(),
                savedUser.getName(),
                verificationUrl
        );

        return savedUser;
    }
}