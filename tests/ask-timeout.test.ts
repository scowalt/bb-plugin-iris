import { describe, expect, it } from "vitest";
import { askTimeoutMs } from "../core/ask";

const HOUR_MS = 60 * 60_000;

describe("iris_ask timeout", () => {
  it("waits as long as the Ask timeout setting when the agent sets no timeout", () => {
    expect(askTimeoutMs("3 days", undefined)).toBe(72 * HOUR_MS);
    expect(askTimeoutMs("30 minutes", undefined)).toBe(30 * 60_000);
  });
  it("lets the agent's own timeoutMinutes override the setting", () => {
    expect(askTimeoutMs("3 days", 15)).toBe(15 * 60_000);
  });
  it("falls back to one hour for a missing or unknown setting", () => {
    expect(askTimeoutMs(undefined, undefined)).toBe(HOUR_MS);
    expect(askTimeoutMs("forever", undefined)).toBe(HOUR_MS);
    expect(askTimeoutMs("toString", undefined)).toBe(HOUR_MS);
  });
});
