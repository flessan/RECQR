import type { QRCodeType, WiFiData, VCardData, CalendarEvent } from "@/lib/types";

// Detect the type of QR code content
export function detectQRType(text: string): QRCodeType {
  if (text.startsWith("http://") || text.startsWith("https://")) {
    return "url";
  }
  
  if (text.startsWith("WIFI:")) {
    return "wifi";
  }
  
  if (text.startsWith("mailto:")) {
    return "email";
  }
  
  if (text.startsWith("tel:")) {
    return "phone";
  }
  
  if (text.startsWith("smsto:") || text.startsWith("SMSTO:")) {
    return "sms";
  }
  
  if (text.startsWith("whatsapp:")) {
    return "whatsapp";
  }
  
  if (text.startsWith("geo:")) {
    return "geo";
  }
  
  if (text.startsWith("BEGIN:VCALENDAR")) {
    return "calendar";
  }
  
  if (text.startsWith("BEGIN:VCARD")) {
    return "vcard";
  }
  
  return "text";
}

// Parse WiFi QR code
export function parseWiFi(text: string): WiFiData | null {
  try {
    const data: Partial<WiFiData> = {};
    const parts = text.substring(5).split(";");
    
    parts.forEach((part) => {
      if (part.startsWith("S:")) {
        data.ssid = part.substring(2);
      } else if (part.startsWith("P:")) {
        data.password = part.substring(2);
      } else if (part.startsWith("T:")) {
        data.encryption = part.substring(2);
      } else if (part.startsWith("H:")) {
        data.hidden = part.substring(2) === "true";
      }
    });
    
    return data as WiFiData;
  } catch {
    return null;
  }
}

// Parse vCard
export function parseVCard(text: string): VCardData | null {
  try {
    const data: Partial<VCardData> = {};
    const lines = text.split("\n");
    
    lines.forEach((line) => {
      if (line.startsWith("FN:")) {
        data.name = line.substring(3).trim();
      } else if (line.startsWith("TEL:")) {
        data.phone = line.substring(4).trim();
      } else if (line.startsWith("EMAIL:")) {
        data.email = line.substring(6).trim();
      } else if (line.startsWith("ADR:")) {
        data.address = line.substring(4).trim();
      } else if (line.startsWith("ORG:")) {
        data.organization = line.substring(4).trim();
      }
    });
    
    return data as VCardData;
  } catch {
    return null;
  }
}

// Parse calendar event
export function parseCalendar(text: string): CalendarEvent | null {
  try {
    const data: Partial<CalendarEvent> = {};
    const lines = text.split("\n");
    
    lines.forEach((line) => {
      if (line.startsWith("SUMMARY:")) {
        data.title = line.substring(8).trim();
      } else if (line.startsWith("DTSTART:")) {
        data.start = line.substring(8).trim();
      } else if (line.startsWith("DTEND:")) {
        data.end = line.substring(6).trim();
      } else if (line.startsWith("LOCATION:")) {
        data.location = line.substring(9).trim();
      } else if (line.startsWith("DESCRIPTION:")) {
        data.description = line.substring(12).trim();
      }
    });
    
    return data as CalendarEvent;
  } catch {
    return null;
  }
}

// Format timestamp for display
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Get icon for QR code type
export function getQRTypeIcon(type: QRCodeType): string {
  const icons: Record<QRCodeType, string> = {
    url: "url",
    wifi: "wifi",
    email: "email",
    phone: "phone",
    sms: "sms",
    whatsapp: "whatsapp",
    geo: "geo",
    calendar: "calendar",
    vcard: "vcard",
    text: "text",
  };
  
  return icons[type] || "text";
}
