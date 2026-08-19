import { describe, it, expect } from "vitest";
import { buildPayload, formatICalDate } from "./encoder";
import type { GeneratorContent } from "./types";
import { parseWiFi, parseVCard, parseCalendar } from "./parser";

const c = (preset: GeneratorContent["preset"], data: Record<string, string>): GeneratorContent => ({ preset, data });

describe("buildPayload", () => {
  it("builds a url", () => {
    expect(buildPayload(c("link", { url: "example.com" }))).toBe("https://example.com");
    expect(buildPayload(c("link", { url: "https://x.com" }))).toBe("https://x.com");
  });
  it("builds mailto with subject/body", () => {
    const p = buildPayload(c("email", { to: "a@b.com", subject: "Hi", body: "Body" }));
    expect(p).toContain("mailto:a@b.com");
    expect(p).toContain("subject=Hi");
    expect(p).toContain("body=Body");
  });
  it("builds tel and sms", () => {
    expect(buildPayload(c("call", { number: "+123" }))).toBe("tel:+123");
    expect(buildPayload(c("sms", { number: "+123", body: "hi" }))).toBe("sms:+123?body=hi");
  });
  it("builds a wa.me link", () => {
    expect(buildPayload(c("whatsapp", { number: "+62 812-345", text: "hi" }))).toBe(
      "https://wa.me/62812345?text=hi"
    );
  });
  it("builds and re-parses a wifi payload with escaped ssid", () => {
    const raw = buildPayload(c("wifi", { ssid: "net;work", password: "p;w", encryption: "WPA", hidden: "true" }));
    expect(raw).toMatch(/^WIFI:/);
    const w = parseWiFi(raw);
    expect(w?.ssid).toBe("net;work");
    expect(w?.password).toBe("p;w");
    expect(w?.hidden).toBe(true);
  });
  it("builds a valid vcard that re-parses", () => {
    const raw = buildPayload(c("vcard", { firstName: "John", lastName: "Doe", phone: "+1", email: "a@b.com" }));
    const card = parseVCard(raw);
    expect(card?.formattedName).toBe("John Doe");
    expect(card?.phone?.[0].value).toBe("+1");
  });
  it("builds an icalendar event that re-parses", () => {
    const raw = buildPayload(c("event", { summary: "Meet", start: "2024-01-31T12:00", end: "2024-01-31T13:00", location: "Room" }));
    const ev = parseCalendar(raw);
    expect(ev?.summary).toBe("Meet");
    expect(ev?.location).toBe("Room");
  });
  it("builds geo", () => {
    expect(buildPayload(c("geo", { latitude: "-6.2", longitude: "106.8", query: "Jakarta" }))).toBe(
      "geo:-6.2,106.8?q=Jakarta"
    );
  });
  it("produces empty payload for empty content", () => {
    expect(buildPayload(c("text", { text: "" }))).toBe("");
  });
});

describe("formatICalDate", () => {
  it("formats datetime-local input", () => {
    expect(formatICalDate("2024-01-31T12:30")).toBe("20240131T123000");
    expect(formatICalDate("2024-01-31")).toBe("20240131T000000");
  });
});
