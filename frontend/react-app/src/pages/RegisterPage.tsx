import {useState, type SyntheticEvent} from "react";
import {register} from "../api/authApi";
import {PasswordInput} from "../components/PasswordInput";
import "./AuthPage.css";

export function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmTouched, setConfirmTouched] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [registered, setRegistered] = useState(false);

    async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        if (password !== confirmPassword) {
            setConfirmTouched(true);
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await register({name, email, password});
            setRegistered(true);
        } catch {
            setError("Could not create your account. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (registered) {
        return (
            <section className="auth-page">
                <div className="auth-card">
                    <h1>Check your email</h1>
                    <p>
                        Your account was created. Please check your email to verify your
                        account.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="auth-page">
            <div className="auth-card">
                <h1>Create account</h1>

                <form
                    onSubmit={(event) => {
                        void handleSubmit(event);
                    }}
                >
                    <label htmlFor="name">Name</label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        required
                    />

                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />

                    <PasswordInput
                        id="password"
                        label="Password"
                        value={password}
                        onChange={setPassword}
                        autoComplete="new-password"
                        minLength={8}
                    />

                    <PasswordInput
                        id="confirm-password"
                        label="Confirm Password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        onBlur={() => setConfirmTouched(true)}
                        autoComplete="new-password"
                    />

                    {confirmTouched &&
                        confirmPassword.length > 0 &&
                        password !== confirmPassword && (
                            <p role="alert">Passwords do not match.</p>
                        )}

                    {error && <p role="alert">{error}</p>}

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating account..." : "Create account"}
                    </button>
                </form>
            </div>
        </section>
    );
}
