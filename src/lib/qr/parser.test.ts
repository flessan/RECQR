import { describe, it, expect } from "vitest";
import {
  detectQRType,
  parseQR,
  parseWiFi,
  parseVCard,
  parseCalendar,
  parseGeo,
  parseSms,
  parseWhatsApp,
} from "./parser";

describe("detectQRType", () => {
  it("detects urls", () => {
    expect(detectQRType("https://example.com")).toBe("url");
    expect(detectQRType("http://example.com/path")).toBe("url");
    expect(detectQRType("example.com/path")).toBe("url");
  });
  it("detects wifi", () => expect(detectQRType("WIFI:S:net;T:WPA;P:pw;;")).toBe("wifi"));
  it("detects mailto", () => expect(detectQRType("mailto:a@b.com")).toBe("email"));
  it("detects tel", () => expect(detectQRType("tel:+123")).toBe("phone"));
  it("detects sms and smsto", () => {
    expect(detectQRType("sms:+123")).toBe("sms");
    expect(detectQRType("smsto:+123:hi")).toBe("sms");
  });
  it("detects whatsapp (wa.me and whatsapp://)", () => {
    expect(detectQRType("https://wa.me/628123?text=hi")).toBe("whatsapp");
    expect(detectQRType("whatsapp://send?phone=628123")).toBe("whatsapp");
  });
  it("detects geo", () => expect(detectQRType("geo:-6.2,106.8")).toBe("geo"));
  it("detects vcard", () =>
    expect(detectQRType("BEGIN:VCARD\nFN:A\nEND:VCARD")).toBe("vcard"));
  it("detects calendar (vevent and vcalendar)", () => {
    expect(detectQRType("BEGIN:VEVENT\nSUMMARY:x\nEND:VEVENT")).toBe("calendar");
    expect(detectQRType("BEGIN:VCALENDAR\nBEGIN:VEVENT\nEND:VEVENT\nEND:VCALENDAR")).toBe("calendar");
  });
  it("falls back to text", () => expect(detectQRType("just some words")).toBe("text"));
});

describe("WiFi parsing", () => {
  it("parses a standard WIFI payload", () => {
    const w = parseWiFi("WIFI:T:WPA;S:MyNet;P:secret;;");
    expect(w).toMatchObject({ ssid: "MyNet", password: "secret", encryption: "WPA", hidden: false });
  });
  it("handles escaped semicolons and quotes", () => {
    const w = parseWiFi('WIFI:S:foo\\;bar;T:WPA;P:p\\"ass;H:true;;');
    expect(w?.ssid).toBe("foo;bar");
    expect(w?.password).toBe('p"ass');
    expect(w?.hidden).toBe(true);
  });
  it("handles open networks", () => {
    const w = parseWiFi("WIFI:S:open;T:nopass;;");
    expect(w?.encryption).toBe("NOPASS");
    expect(w?.password).toBeUndefined();
  });
});

describe("vCard parsing", () => {
  it("parses FN, N, TEL with TYPE param", () => {
    const v = parseVCard(
      "BEGIN:VCARD\nVERSION:3.0\nN:Doe;John;;;\nFN:John Doe\nTEL;TYPE=CELL:+15551234567\nEMAIL:john@example.com\nORG:Acme\nEND:VCARD"
    );
    expect(v?.formattedName).toBe("John Doe");
    expect(v?.firstName).toBe("John");
    expect(v?.lastName).toBe("Doe");
    expect(v?.organization).toBe("Acme");
    expect(v?.phone?.[0].value).toBe("+15551234567");
    expect(v?.phone?.[0].type).toBe("CELL");
    expect(v?.email?.[0].value).toBe("john@example.com");
  });
  it("unfolds folded lines (RFC 6350: the folding space is removed)", () => {
    const v = parseVCard("BEGIN:VCARD\nFN:Long\n Name\nEND:VCARD");
    expect(v?.formattedName).toBe("LongName");
  });
  it("preserves an intentional leading space when two spaces are used", () => {
    const v = parseVCard("BEGIN:VCARD\nFN:Long\n  Name\nEND:VCARD");
    expect(v?.formattedName).toBe("Long Name");
  });
});

describe("calendar parsing", () => {
  it("extracts event fields from a VEVENT inside VCALENDAR", () => {
    const c = parseCalendar(
      "BEGIN:VCALENDAR\nBEGIN:VEVENT\nSUMMARY:Meeting\nDTSTART:20240131T120000\nDTEND:20240131T130000\nLOCATION:Room 1\nDESCRIPTION:Agenda\nEND:VEVENT\nEND:VCALENDAR"
    );
    expect(c?.summary).toBe("Meeting");
    expect(c?.location).toBe("Room 1");
    expect(c?.startISO).toBe("2024-01-31T12:00:00");
    expect(c?.endISO).toBe("2024-01-31T13:00:00");
  });
});

describe("geo/sms/whatsapp", () => {
  it("parses geo with query", () => {
    const g = parseGeo("geo:-6.2088,106.8456?q=Jakarta");
    expect(g?.latitude).toBeCloseTo(-6.2088);
    expect(g?.query).toBe("Jakarta");
  });
  it("parses sms with body", () => {
    const s = parseSms("sms:+123?body=hello");
    expect(s?.number).toBe("+123");
    expect(s?.body).toBe("hello");
  });
  it("parses wa.me links", () => {
    const w = parseWhatsApp("https://wa.me/628123?text=hi");
    expect(w?.number).toBe("628123");
    expect(w?.text).toBe("hi");
  });
});

describe("parseQR normalization", () => {
  it("always preserves raw content", () => {
    const raw = "WIFI:S:x;T:WPA;P:y;;";
    const r = parseQR(raw);
    expect(r.raw).toBe(raw);
    expect(r.timestamp).toBeTypeOf("number");
    expect(r.parsed?.kind).toBe("wifi");
  });
  it("treats text payloads as text", () => {
    const r = parseQR("hello world");
    expect(r.type).toBe("text");
    expect(r.parsed?.kind).toBe("text");
  });
});
