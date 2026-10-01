package dev.mohammadaziz.smartcommerce.backend.user;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SmartCommerceUserDetailsServiceTest {

    private final UserRepository userRepository = mock(UserRepository.class);

    @Test
    void shouldLoadUserByEmail() {
        User user = new User(
                UUID.randomUUID(),
                "Mohammad Aziz",
                "aziz@example.com",
                "hashed-password",
                true,
                Instant.now()
        );

        when(userRepository.findByEmail("aziz@example.com"))
                .thenReturn(Optional.of(user));

        SmartCommerceUserDetailsService userDetailsService =
                new SmartCommerceUserDetailsService(userRepository);

        UserDetails userDetails =
                userDetailsService.loadUserByUsername("aziz@example.com");

        assertThat(userDetails.getUsername()).isEqualTo("aziz@example.com");
        assertThat(userDetails.getPassword()).isEqualTo("hashed-password");
        assertThat(userDetails.isEnabled()).isTrue();
    }

    @Test
    void shouldDisableUserWhenEmailIsNotVerified() {
        User user = new User(
                UUID.randomUUID(),
                "Mohammad Aziz",
                "aziz@example.com",
                "hashed-password",
                false,
                Instant.now()
        );

        when(userRepository.findByEmail("aziz@example.com"))
                .thenReturn(Optional.of(user));

        SmartCommerceUserDetailsService userDetailsService =
                new SmartCommerceUserDetailsService(userRepository);

        UserDetails userDetails =
                userDetailsService.loadUserByUsername("aziz@example.com");

        assertThat(userDetails.isEnabled()).isFalse();
    }

    @Test
    void shouldThrowExceptionWhenUserDoesNotExist() {
        when(userRepository.findByEmail("missing@example.com"))
                .thenReturn(Optional.empty());

        SmartCommerceUserDetailsService userDetailsService =
                new SmartCommerceUserDetailsService(userRepository);

        assertThatThrownBy(() ->
                userDetailsService.loadUserByUsername("missing@example.com"))
                .isInstanceOf(UsernameNotFoundException.class);
    }
}