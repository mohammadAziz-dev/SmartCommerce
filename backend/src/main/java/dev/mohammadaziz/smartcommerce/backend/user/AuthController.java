package dev.mohammadaziz.smartcommerce.backend.user;

import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final RegistrationService registrationService;
    private final EmailVerificationService emailVerificationService;
    private final AuthenticationService authenticationService;
    private final UserRepository userRepository;

    public AuthController(
            RegistrationService registrationService,
            EmailVerificationService emailVerificationService,
            AuthenticationService authenticationService,
            UserRepository userRepository
    ) {
        this.registrationService = registrationService;
        this.emailVerificationService = emailVerificationService;
        this.authenticationService = authenticationService;
        this.userRepository = userRepository;
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

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        authenticationService.authenticate(
                request.email(),
                request.password(),
                httpRequest,
                httpResponse
        );
    }

    @GetMapping("/me")
    public AuthenticatedUserResponse me(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found.")
                );

        return new AuthenticatedUserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.isEmailVerified()
        );
    }
}