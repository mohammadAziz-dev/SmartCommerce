import { afterEach, describe, expect, it, vi } from "vitest";
import { getBusinessId } from "./businesses";

describe("getBusinessId", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns the SmartCommerce Demo business ID", () => {
    expect(getBusinessId("smartcommerce-demo")).toBe(
      "a4273c3b-2f62-4b8f-98b0-38e8af4e5085",
    );
  });

  it("returns the Gaming Store business ID", () => {
    expect(getBusinessId("gaming-store")).toBe(
      "8cc9cfa3-8159-462b-bd21-8619d5d82755",
    );
  });

  it("returns the Home Living Store business ID", () => {
    expect(getBusinessId("home-living-store")).toBe(
      "47aa6ef6-16dc-4999-8047-0812012c998b",
    );
  });

  it("returns undefined for an unknown business", () => {
    expect(getBusinessId("unknown-store")).toBeUndefined();
  });

  it("uses the environment business ID for legacy routes", () => {
    vi.stubEnv("VITE_BUSINESS_ID", "legacy-business-id");

    expect(getBusinessId()).toBe("legacy-business-id");
  });
});
