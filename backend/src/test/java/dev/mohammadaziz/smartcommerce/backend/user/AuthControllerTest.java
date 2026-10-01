package dev.mohammadaziz.smartcommerce.backend.user;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import dev.mohammadaziz.smartcommerce.backend.user.AuthenticationService;

@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RegistrationService registrationService;

    @MockitoBean
    private EmailVerificationService emailVerificationService;

    @MockitoBean
    private AuthenticationService authenticationService;

    @Test
    void shouldRegisterUser() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Mohammad Aziz",
                                  "email": "aziz@example.com",
                                  "password": "Secret123!"
                                }
                                """))
                .andExpect(status().isCreated());

        verify(registrationService).register(
                "Mohammad Aziz",
                "aziz@example.com",
                "Secret123!"
        );
    }

    @Test
    void shouldRejectInvalidEmail() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Mohammad Aziz",
                                  "email": "not-an-email",
                                  "password": "Secret123!"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldRejectShortPassword() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Mohammad Aziz",
                                  "email": "aziz@example.com",
                                  "password": "Short1"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldReturnConflictWhenEmailAlreadyExists() throws Exception {
        when(registrationService.register(
                "Mohammad Aziz",
                "aziz@example.com",
                "Secret123!"
        )).thenThrow(new EmailAlreadyExistsException());

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Mohammad Aziz",
                                  "email": "aziz@example.com",
                                  "password": "Secret123!"
                                }
                                """))
                .andExpect(status().isConflict());
    }

    @Test
    void shouldVerifyEmail() throws Exception {
        mockMvc.perform(post("/api/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "token": "raw-verification-token"
                                }
                                """))
                .andExpect(status().isNoContent());

        verify(emailVerificationService)
                .verify("raw-verification-token");
    }

    @Test
    void shouldReturnBadRequestForInvalidVerificationToken() throws Exception {
        doThrow(new InvalidVerificationTokenException())
                .when(emailVerificationService)
                .verify("invalid-token");

        mockMvc.perform(post("/api/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "token": "invalid-token"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldReturnBadRequestForExpiredVerificationToken() throws Exception {
        doThrow(new ExpiredVerificationTokenException())
                .when(emailVerificationService)
                .verify("expired-token");

        mockMvc.perform(post("/api/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "token": "expired-token"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldReturnBadRequestForUsedVerificationToken() throws Exception {
        doThrow(new UsedVerificationTokenException())
                .when(emailVerificationService)
                .verify("used-token");

        mockMvc.perform(post("/api/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "token": "used-token"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldLoginUser() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "aziz@example.com",
                                  "password": "TestPassword123!"
                                }
                                """))
                .andExpect(status().isNoContent());
    }
}