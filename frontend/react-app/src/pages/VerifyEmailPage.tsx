import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyEmail } from "../api/authApi";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying",
  );
  const verificationStarted = useRef(false);
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token || verificationStarted.current) {
      return;
    }

    verificationStarted.current = true;

    verifyEmail(token)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  if (!token) {
    return (
      <section>
        <h1>Verification failed</h1>
        <p>The verification link is invalid or has expired.</p>
      </section>
    );
  }

  if (status === "success") {
    return (
      <section>
        <h1>Email verified</h1>
        <p>Your email has been verified successfully.</p>
        <Link to="/login">Log in</Link>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section>
        <h1>Verification failed</h1>
        <p>The verification link is invalid or has expired.</p>
      </section>
    );
  }

  return (
    <section>
      <h1>Verifying email</h1>
      <p>Please wait...</p>
    </section>
  );
}
