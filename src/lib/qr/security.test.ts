import { describe, it, expect } from "vitest";
import { analyzeUrl, isLikelyUrl } from "./security";

describe("analyzeUrl", () => {
  it("marks https urls safe", () => {
    const u = analyzeUrl("https://example.com/path");
    expect(u?.isSafe).toBe(true);
    expect(u?.hostname).toBe("example.com");
    expect(u?.protocol).toBe("https:");
  });
  it("blocks javascript: urls", () => {
    const u = analyzeUrl("javascript:alert(1)");
    expect(u?.isSafe).toBe(false);
    expect(u?.warnings).toContain("dangerous-protocol");
  });
  it("blocks data: urls", () => {
    const u = analyzeUrl("data:text/html,<script>alert(1)</script>");
    expect(u?.isSafe).toBe(false);
  });
  it("flags raw IP addresses", () => {
    const u = analyzeUrl("http://192.168.1.1/admin");
    expect(u?.warnings).toContain("raw-ip");
  });
  it("flags url shorteners", () => {
    const u = analyzeUrl("https://bit.ly/abc");
    expect(u?.warnings).toContain("shortened-link");
  });
  it("flags embedded credentials", () => {
    const u = analyzeUrl("http://user:pass@example.com");
    expect(u?.warnings).toContain("credentials-in-url");
  });
  it("returns null for invalid urls", () => {
    expect(analyzeUrl("not a url at all")).toBeNull();
  });
});

describe("isLikelyUrl", () => {
  it("recognizes schemes and bare domains", () => {
    expect(isLikelyUrl("https://a.com")).toBe(true);
    expect(isLikelyUrl("a.com/path")).toBe(true);
    expect(isLikelyUrl("just a sentence")).toBe(false);
  });
});
