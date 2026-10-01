package dev.mohammadaziz.smartcommerce.backend.user;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final RegistrationService registrationService;
    private final EmailVerificationService emailVerificationService;

    public AuthController(
            RegistrationService registrationService,
            EmailVerificationService emailVerificationService
    ) {
        this.registrationService = registrationService;
        this.emailVerificationService = emailVerificationService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public void register(@Valid @RequestBody RegistrationRequest request) {
        registrationService.register(
                request.name(),
                request.email(),
                request.password()
        );
    }

    @PostMapping("/verify-email")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void verifyEmail(
            @Valid @RequestBody EmailVerificationRequest request
    ) {
        emailVerificationService.verify(request.token());
    }
}