import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import {PasswordInput} from "./PasswordInput";

describe("PasswordInput", () => {
    it("starts hidden and toggles visibility without changing the value", () => {
        const onChange = vi.fn();
        render(
            <PasswordInput
                id="password"
                label="Password"
                value="Secret123"
                onChange={onChange}
                autoComplete="current-password"
            />
        );

        const input = screen.getByLabelText("Password") as HTMLInputElement;
        expect(input.type).toBe("password");
        fireEvent.click(screen.getByRole("button", {name: "Show password"}));
        expect(input.type).toBe("text");
        expect(input.value).toBe("Secret123");
        fireEvent.click(screen.getByRole("button", {name: "Hide password"}));
        expect(input.type).toBe("password");
        expect(onChange).not.toHaveBeenCalled();
    });
});
