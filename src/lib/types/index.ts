// QR Code types supported by the platform
export type QRCodeType = 
  | "url"
  | "wifi"
  | "email"
  | "phone"
  | "sms"
  | "whatsapp"
  | "geo"
  | "calendar"
  | "vcard"
  | "text";

// Scanned QR code data structure
export interface QRCodeData {
  id: string;
  text: string;
  type: QRCodeType;
  timestamp: number;
  favorite: boolean;
  metadata?: Record<string, unknown>;
}

// Scan history state
export interface ScanHistory {
  scans: QRCodeData[];
  addScan: (data: Omit<QRCodeData, "id" | "timestamp" | "favorite">) => void;
  toggleFavorite: (id: string) => void;
  deleteScan: (id: string) => void;
  clearHistory: () => void;
}

// API Response types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DecodeResponse {
  text: string;
  type: QRCodeType;
  confidence: number;
}

// WiFi QR code data
export interface WiFiData {
  ssid: string;
  password: string;
  encryption: string;
  hidden: boolean;
}

// vCard data
export interface VCardData {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  organization?: string;
}

// Calendar event data
export interface CalendarEvent {
  title: string;
  start: string;
  end: string;
  location?: string;
  description?: string;
}
