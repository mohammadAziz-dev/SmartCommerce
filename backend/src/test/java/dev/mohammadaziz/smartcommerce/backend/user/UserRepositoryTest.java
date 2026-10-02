package dev.mohammadaziz.smartcommerce.backend.user;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldFindUserByEmail() {
        User user = new User(
                UUID.randomUUID(),
                "Mohammad Aziz",
                "aziz@example.com",
                "hashed-password",
                false,
                Instant.now()
        );

        userRepository.save(user);

        User foundUser = userRepository.findByEmail("aziz@example.com")
                .orElseThrow();

        assertThat(foundUser.getId()).isEqualTo(user.getId());
        assertThat(foundUser.getName()).isEqualTo("Mohammad Aziz");
        assertThat(foundUser.getEmail()).isEqualTo("aziz@example.com");
        assertThat(foundUser.getPasswordHash()).isEqualTo("hashed-password");
        assertThat(foundUser.isEmailVerified()).isFalse();
    }

    @Test
    void shouldDetectExistingEmail() {
        User user = new User(
                UUID.randomUUID(),
                "Mohammad Aziz",
                "aziz@example.com",
                "hashed-password",
                false,
                Instant.now()
        );

        userRepository.save(user);

        assertThat(userRepository.existsByEmail("aziz@example.com"))
                .isTrue();
    }
}