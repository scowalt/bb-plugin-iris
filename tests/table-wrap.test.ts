import { describe, expect, it } from "vitest";
import { wrapsColumn } from "../core/table-layout";

describe("Table columns that wrap", () => {
  it("wraps a column of sentences", () => {
    expect(wrapsColumn(["Splits a DM into separate titled conversations", "The bot can see messages in any space without being added"])).toBe(true);
  });
  it("wraps a column of short answers with one long sentence among them", () => {
    expect(wrapsColumn(["Leaves out tariffs and the extra freight and duty costs booked in October", "Right number", "OK", "Fine", "Matches"])).toBe(true);
  });
  it("keeps short labels on one line", () => {
    expect(wrapsColumn(["Live", "Preview", "In review", "Blocked on design"])).toBe(false);
  });
  it("keeps IDs, paths and hashes on one line", () => {
    expect(wrapsColumn(["src/services/notifications/subscriptions/org-wide-event-subscription-handler.ts", "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2"])).toBe(false);
  });
  it("ignores numbers and empty cells", () => {
    expect(wrapsColumn([1, 2, null, undefined, ""])).toBe(false);
  });
});

describe("the column that leads a stacked row", () => {
  it("is a column of sentences, not a short-answer column with one long reason", async () => {
    const { proseColumn } = await import("../core/table-layout");
    expect(proseColumn(["Splits a DM into separate titled conversations", "The bot can see messages in any space without being added"])).toBe(true);
    expect(proseColumn(["Leaves out tariffs and the extra freight and duty costs booked in October", "Right number", "OK", "Fine", "Matches"])).toBe(false);
  });
});

describe("paths are not sentences", () => {
  it("keeps a path with a space in it on one line", async () => {
    const { wrapsColumn } = await import("../core/table-layout");
    expect(wrapsColumn(["~/Library/Application Support/bb/plugins/iris/state.json", "/Users/me/Documents/Quarterly report final.pdf"])).toBe(false);
  });
});
