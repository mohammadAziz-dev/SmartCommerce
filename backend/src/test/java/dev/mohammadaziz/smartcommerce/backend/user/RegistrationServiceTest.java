package dev.mohammadaziz.smartcommerce.backend.user;

import dev.mohammadaziz.smartcommerce.backend.email.EmailService;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RegistrationServiceTest {

    private final UserRepository userRepository =
            mock(UserRepository.class);

    private final PasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    private final EmailVerificationTokenRepository tokenRepository =
            mock(EmailVerificationTokenRepository.class);

    private final VerificationTokenGenerator tokenGenerator =
            mock(VerificationTokenGenerator.class);

    private final EmailService emailService =
            mock(EmailService.class);

    @Test
    void shouldRegisterUnverifiedUserWithHashedPassword() {
        when(userRepository.existsByEmail("aziz@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        RegistrationService registrationService =
                new RegistrationService(
                        userRepository,
                        passwordEncoder,
                        tokenRepository,
                        tokenGenerator,
                        emailService,
                        "http://localhost:5173"
                );

        User user = registrationService.register(
                "Mohammad Aziz",
                "aziz@example.com",
                "Secret123!"
        );

        assertThat(user.getName()).isEqualTo("Mohammad Aziz");
        assertThat(user.getEmail()).isEqualTo("aziz@example.com");
        assertThat(user.isEmailVerified()).isFalse();

        assertThat(user.getPasswordHash())
                .isNotEqualTo("Secret123!");

        assertThat(passwordEncoder.matches(
                "Secret123!",
                user.getPasswordHash()
        )).isTrue();

        verify(userRepository).save(user);
    }

    @Test
    void shouldRejectRegistrationWhenEmailAlreadyExists() {
        when(userRepository.existsByEmail("aziz@example.com"))
                .thenReturn(true);

        RegistrationService registrationService =
                new RegistrationService(
                        userRepository,
                        passwordEncoder,
                        tokenRepository,
                        tokenGenerator,
                        emailService,
                        "http://localhost:5173"
                );

        assertThatThrownBy(() -> registrationService.register(
                "Mohammad Aziz",
                "aziz@example.com",
                "Secret123!"
        )).isInstanceOf(EmailAlreadyExistsException.class);
    }

    @Test
    void shouldNormalizeEmailBeforeSavingUser() {
        when(userRepository.existsByEmail("aziz@example.com"))
                .thenReturn(false);
        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        RegistrationService registrationService =
                new RegistrationService(
                        userRepository,
                        passwordEncoder,
                        tokenRepository,
                        tokenGenerator,
                        emailService,
                        "http://localhost:5173"
                );

        User user = registrationService.register(
                "Mohammad Aziz",
                "  Aziz@Example.COM  ",
                "Secret123!"
        );

        assertThat(user.getEmail()).isEqualTo("aziz@example.com");
    }

    @Test
    void shouldCreateVerificationTokenAndSendVerificationEmail() {
        when(userRepository.existsByEmail("aziz@example.com"))
                .thenReturn(false);
        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(tokenGenerator.generateToken())
                .thenReturn("raw-verification-token");
        when(tokenGenerator.hashToken("raw-verification-token"))
                .thenReturn("hashed-verification-token");

        RegistrationService registrationService = new RegistrationService(
                userRepository,
                passwordEncoder,
                tokenRepository,
                tokenGenerator,
                emailService,
                "http://localhost:5173"
        );

        User user = registrationService.register(
                "Mohammad Aziz",
                "aziz@example.com",
                "Secret123!"
        );

        verify(tokenRepository).save(any(EmailVerificationToken.class));

        verify(emailService).sendEmailVerification(
                "aziz@example.com",
                "Mohammad Aziz",
                "http://localhost:5173/verify-email?token=raw-verification-token"
        );

        assertThat(user.isEmailVerified()).isFalse();
    }

}