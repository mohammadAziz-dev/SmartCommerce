package dev.mohammadaziz.smartcommerce.backend.user;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "email_verification_tokens")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class EmailVerificationToken {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String tokenHash;

    private Instant expiresAt;

    private Instant usedAt;

    private Instant createdAt;

    public void markUsed(Instant usedAt) {
        this.usedAt = usedAt;
    }
}