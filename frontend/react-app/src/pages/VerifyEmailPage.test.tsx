import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { VerifyEmailPage } from "./VerifyEmailPage";
import * as authApi from "../api/authApi";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("VerifyEmailPage", () => {
  it("verifies the email successfully", async () => {
    vi.spyOn(authApi, "verifyEmail").mockResolvedValue();

    render(
      <MemoryRouter initialEntries={["/verify-email?token=test-token"]}>
        <VerifyEmailPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Email verified")).toBeInTheDocument();
    expect(authApi.verifyEmail).toHaveBeenCalledWith("test-token");
  });

  it("shows an error when verification fails", async () => {
    vi.spyOn(authApi, "verifyEmail").mockRejectedValue(new Error());

    render(
      <MemoryRouter initialEntries={["/verify-email?token=test-token"]}>
        <VerifyEmailPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Verification failed")).toBeInTheDocument();
  });
});
