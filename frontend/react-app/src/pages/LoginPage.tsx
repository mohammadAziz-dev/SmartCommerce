import {useState, type SyntheticEvent} from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../hooks/useAuth";
import {PasswordInput} from "../components/PasswordInput";
import "./AuthPage.css";

export function LoginPage() {
    const {login} = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await login({email, password});
            void navigate("/");
        } catch {
            setError("Could not log in. Please check your email and password.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="auth-page">
            <div className="auth-card">
                <h1>Log in</h1>

                <form
                    onSubmit={(event) => {
                        void handleSubmit(event);
                    }}
                >
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
                        autoComplete="current-password"
                    />

                    {error && <p role="alert">{error}</p>}

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Logging in..." : "Log in"}
                    </button>
                </form>
            </div>
        </section>
    );
}
