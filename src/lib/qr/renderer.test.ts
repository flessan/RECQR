import { describe, it, expect } from "vitest";
import { generateMatrix } from "./renderer";

describe("generateMatrix", () => {
  it("produces a square boolean matrix for a url", () => {
    const { size, modules } = generateMatrix("https://example.com", "M");
    expect(size).toBeGreaterThan(0);
    expect(modules.length).toBe(size * size);
    expect(modules.some(Boolean)).toBe(true);
  });
  it("uses higher error correction for longer payload", () => {
    const a = generateMatrix("a", "L");
    const b = generateMatrix("a".repeat(200), "H");
    expect(b.size).toBeGreaterThanOrEqual(a.size);
  });
  it("does not throw on empty payload (uses a space)", () => {
    expect(() => generateMatrix("", "M")).not.toThrow();
  });
});
