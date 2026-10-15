import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";
import {RegisterPage} from "./RegisterPage";
import * as authApi from "../api/authApi";

afterEach(() => {
    vi.restoreAllMocks();
});

describe("RegisterPage", () => {
    it("registers the customer and shows the verification message", async () => {
        vi.spyOn(authApi, "register").mockResolvedValue();

        render(<RegisterPage/>);

        fireEvent.change(screen.getByLabelText("Name"), {
            target: {value: "Mohammad Aziz"},
        });
        fireEvent.change(screen.getByLabelText("Email"), {
            target: {value: "aziz@example.com"},
        });
        fireEvent.change(screen.getByLabelText("Password"), {
            target: {value: "password123"},
        });
        fireEvent.change(screen.getByLabelText("Confirm Password"), {
            target: {value: "password123"},
        });

        fireEvent.click(screen.getByRole("button", {name: "Create account"}));

        await waitFor(() => {
            expect(authApi.register).toHaveBeenCalledWith({
                name: "Mohammad Aziz",
                email: "aziz@example.com",
                password: "password123",
            });
        });

        expect(
            await screen.findByText(
                "Your account was created. Please check your email to verify your account.",
            ),
        ).toBeInTheDocument();
    });

    it("shows an error when registration fails", async () => {
        vi.spyOn(authApi, "register").mockRejectedValue(new Error());

        render(<RegisterPage/>);

        fireEvent.change(screen.getByLabelText("Name"), {
            target: {value: "Mohammad Aziz"},
        });
        fireEvent.change(screen.getByLabelText("Email"), {
            target: {value: "aziz@example.com"},
        });
        fireEvent.change(screen.getByLabelText("Password"), {
            target: {value: "password123"},
        });
        fireEvent.change(screen.getByLabelText("Confirm Password"), {
            target: {value: "password123"},
        });

        fireEvent.click(screen.getByRole("button", {name: "Create account"}));

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Could not create your account. Please try again.",
        );
    });


    it("shows a mismatch error after leaving Confirm Password", () => {
        render(<RegisterPage/>);

        fireEvent.change(screen.getByLabelText("Password"), {
            target: {value: "password123"},
        });

        const confirmInput = screen.getByLabelText("Confirm Password");

        fireEvent.change(confirmInput, {
            target: {value: "wrongpassword"},
        });

        // No error while typing
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();

        // Error appears after leaving the field
        fireEvent.blur(confirmInput);

        expect(screen.getByRole("alert")).toHaveTextContent(
            "Passwords do not match.",
        );

        // Error disappears when passwords match
        fireEvent.change(confirmInput, {
            target: {value: "password123"},
        });

        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("prevents registration when passwords do not match", () => {
        const registerSpy = vi.spyOn(authApi, "register");

        render(<RegisterPage/>);

        fireEvent.change(screen.getByLabelText("Name"), {
            target: {value: "Mohammad Aziz"},
        });

        fireEvent.change(screen.getByLabelText("Email"), {
            target: {value: "aziz@example.com"},
        });

        fireEvent.change(screen.getByLabelText("Password"), {
            target: {value: "password123"},
        });

        fireEvent.change(screen.getByLabelText("Confirm Password"), {
            target: {value: "wrongpassword"},
        });

        fireEvent.click(screen.getByRole("button", {name: "Create account"}));

        expect(screen.getByRole("alert")).toHaveTextContent(
            "Passwords do not match.",
        );

        expect(registerSpy).not.toHaveBeenCalled();
    });
});
