import { describe, it, expect } from "vitest";
import { analyzeUrl, isLikelyUrl } from "./security";
import { parseQR } from "./parser";

describe("analyzeUrl", () => {
  it("marks https urls safe", () => {
    const url = analyzeUrl("https://example.com/path");
    expect(url?.isSafe).toBe(true);
    expect(url?.hostname).toBe("example.com");
    expect(url?.protocol).toBe("https:");
  });

  it("blocks javascript: urls", () => {
    const url = analyzeUrl("javascript:alert(1)");
    expect(url?.isSafe).toBe(false);
    expect(url?.warnings).toContain("dangerous-protocol");
  });

  it("blocks data: urls", () => {
    const url = analyzeUrl("data:text/html,<script>alert(1)</script>");
    expect(url?.isSafe).toBe(false);
  });

  it("flags raw IP addresses", () => {
    const url = analyzeUrl("http://192.168.1.1/admin");
    expect(url?.warnings).toContain("raw-ip");
  });

  it("flags url shorteners", () => {
    const url = analyzeUrl("https://bit.ly/abc");
    expect(url?.warnings).toContain("shortened-link");
  });

  it("flags embedded credentials", () => {
    const url = analyzeUrl("http://user:pass@example.com");
    expect(url?.warnings).toContain("credentials-in-url");
  });

  it("returns null for invalid urls", () => {
    expect(analyzeUrl("not a url at all")).toBeNull();
  });
});

describe("isLikelyUrl", () => {
  it("recognizes common schemes, other URI schemes, and bare domains", () => {
    expect(isLikelyUrl("https://a.com")).toBe(true);
    expect(isLikelyUrl("mailto:a@b.com")).toBe(true);
    expect(isLikelyUrl("javascript:alert(1)")).toBe(true);
    expect(isLikelyUrl("a.com/path")).toBe(true);
    expect(isLikelyUrl("just a sentence")).toBe(false);
  });
});

describe("unsafe URI results", () => {
  it("shows blocked URI schemes as unsafe links instead of plain text", () => {
    const result = parseQR("javascript:alert(1)");
    expect(result.type).toBe("url");
    expect(result.parsed?.kind).toBe("url");
    if (result.parsed?.kind === "url") {
      expect(result.parsed.isSafe).toBe(false);
    }
  });
});
