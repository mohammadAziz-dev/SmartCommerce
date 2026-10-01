package dev.mohammadaziz.smartcommerce.backend.user;

import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.web.context.SecurityContextRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class AuthenticationServiceTest {

    private final AuthenticationManager authenticationManager =
            mock(AuthenticationManager.class);

    private final SecurityContextRepository securityContextRepository =
            mock(SecurityContextRepository.class);

    @Test
    void shouldAuthenticateWithEmailAndPassword() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);

        AuthenticationService authenticationService =
                new AuthenticationService(
                        authenticationManager,
                        securityContextRepository
                );

        authenticationService.authenticate(
                "aziz@example.com",
                "TestPassword123!",
                request,
                response
        );

        verify(authenticationManager).authenticate(
                any(UsernamePasswordAuthenticationToken.class)
        );
    }

    @Test
    void shouldSaveSuccessfulAuthentication() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        Authentication authentication = mock(Authentication.class);

        when(authenticationManager.authenticate(any()))
                .thenReturn(authentication);

        AuthenticationService authenticationService =
                new AuthenticationService(
                        authenticationManager,
                        securityContextRepository
                );

        authenticationService.authenticate(
                "aziz@example.com",
                "TestPassword123!",
                request,
                response
        );

        verify(securityContextRepository)
                .saveContext(
                        any(SecurityContext.class),
                        eq(request),
                        eq(response)
                );
    }
}
