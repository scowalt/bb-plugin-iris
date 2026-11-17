import { describe, expect, it } from "vitest";
import { check } from "../core/check";

const warnings = (src: string) => check(src).issues.filter((i) => i.severity === "warning").map((i) => i.message);

describe("iris_check readability hints", () => {
  it("warns when a DataGrid holds sentences", () => {
    const src = `<DataGrid rows={[{feature: "Agent sessions", what: "Splits a DM with the bot into separate titled conversations"}, {feature: "Citations", what: "Hover citations and source links on text replies"}]} />`;
    expect(warnings(src).some((m) => m.includes("DataGrid cuts every cell to one line"))).toBe(true);
  });
  it("warns when a Table cell holds a paragraph", () => {
    const para = "This is a long explanation. ".repeat(10);
    expect(warnings(`<Table rows={[{point: "Margin", why: ${JSON.stringify(para)}}]} />`).some((m) => m.includes("holds a paragraph"))).toBe(true);
  });
  it("stays quiet for a Table of sentences, which wraps", () => {
    const src = `<Table rows={[{feature: "Agent sessions", what: "Splits a DM with the bot into separate titled conversations"}, {feature: "Citations", what: "Hover citations and source links on text replies"}]} />`;
    expect(warnings(src).filter((m) => m.includes("paragraph") || m.includes("one line"))).toEqual([]);
  });
  it("stays quiet for a DataGrid of data", () => {
    expect(warnings(`<DataGrid rows={[{id: "a1", region: "EU", revenue: 1200}, {id: "b2", region: "US", revenue: 900}]} />`).filter((m) => m.includes("one line"))).toEqual([]);
  });
});

describe("readability hints read only what the card shows", () => {
  it("ignores row fields the columns leave out", () => {
    const src = `<DataGrid columns={["id", "region"]} rows={[{id: "a1", region: "EU", description: "A long description that is a full sentence about this row"}]} />`;
    expect(warnings(src).filter((m) => m.includes("one line"))).toEqual([]);
  });
  it("doesn't call base64 a paragraph", () => {
    expect(warnings(`<Table rows={[{name: "key", value: ${JSON.stringify("QUJD".repeat(80))}}]} />`).filter((m) => m.includes("paragraph"))).toEqual([]);
  });
});
