"use client";

import {
  AppWindow,
  CalendarPlus,
  Globe,
  Image as ImageIcon,
  Link2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Share2,
  Type,
  UserPlus,
  Video,
  Wifi,
} from "lucide-react";
import type { ContentPreset } from "@/lib/qr/types";

interface Props {
  preset: ContentPreset;
  data: Record<string, string>;
  onPreset: (p: ContentPreset) => void;
  onField: (key: string, value: string) => void;
}

const PRESETS: Array<{ id: ContentPreset; label: string; icon: React.ReactNode }> = [
  { id: "link", label: "Link", icon: <Link2 className="w-4 h-4" /> },
  { id: "text", label: "Text", icon: <Type className="w-4 h-4" /> },
  { id: "email", label: "E-mail", icon: <Mail className="w-4 h-4" /> },
  { id: "call", label: "Call", icon: <Phone className="w-4 h-4" /> },
  { id: "sms", label: "SMS", icon: <MessageSquare className="w-4 h-4" /> },
  { id: "whatsapp", label: "WhatsApp", icon: <Share2 className="w-4 h-4" /> },
  { id: "wifi", label: "Wi-Fi", icon: <Wifi className="w-4 h-4" /> },
  { id: "vcard", label: "vCard", icon: <UserPlus className="w-4 h-4" /> },
  { id: "event", label: "Event", icon: <CalendarPlus className="w-4 h-4" /> },
  { id: "geo", label: "Geo", icon: <MapPin className="w-4 h-4" /> },
  { id: "social", label: "Social", icon: <Globe className="w-4 h-4" /> },
  { id: "app", label: "App/deep link", icon: <AppWindow className="w-4 h-4" /> },
  { id: "image", label: "Image", icon: <ImageIcon className="w-4 h-4" /> },
  { id: "video", label: "Video", icon: <Video className="w-4 h-4" /> },
];

export default function ContentSelector({
  preset,
  data,
  onPreset,
  onField,
}: Props) {
  return (
    <section className="space-y-4" aria-labelledby="content-heading">
      <h2 id="content-heading" className="text-lg font-bold text-[var(--color-on-surface)] flex items-center gap-2">
        <span className="bg-[var(--color-primary)] text-[var(--color-on-primary)] w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">1</span>
        Complete the content
      </h2>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onPreset(p.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              preset === p.id
                ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-[var(--color-primary)]"
                : "bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] border-[var(--color-outline-variant)] hover:bg-[var(--color-surface-container-high)]"
            }`}
          >
            {p.icon}
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Fields preset={preset} data={data} onField={onField} />
      </div>
    </section>
  );
}

function field(
  label: string,
  key: string,
  value: string,
  onField: (k: string, v: string) => void,
  extra?: Partial<React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement>>
) {
  const { type = "text", placeholder, ...rest } = extra || {};
  return (
    <label key={key} className="block">
      <span className="block text-xs font-medium text-[var(--color-on-surface-variant)] mb-1">{label}</span>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onField(key, e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onField(key, e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
          {...rest}
        />
      )}
    </label>
  );
}

function Fields({
  preset,
  data,
  onField,
}: {
  preset: ContentPreset;
  data: Record<string, string>;
  onField: (k: string, v: string) => void;
}) {
  const v = (k: string) => data[k] ?? "";
  switch (preset) {
    case "link":
    case "social":
    case "app":
      return (
        <>
          {field("URL", "url", v("url"), onField, { placeholder: "https://example.com", type: "url", inputMode: "url" })}
          <p className="sm:col-span-2 text-xs text-[var(--color-on-surface-variant)]">
            {preset === "social" ? "Link to a social media profile or post." : preset === "app" ? "An https/app deep link that opens the app or store." : "Any website address."}
          </p>
        </>
      );
    case "image":
      return (
        <>
          {field("Image URL", "url", v("url"), onField, { placeholder: "https://example.com/photo.jpg", type: "url" })}
          <p className="sm:col-span-2 text-xs text-[var(--color-on-surface-variant)]">
            QR codes cannot store an image directly — this encodes a link to where the image is hosted. The image itself is never uploaded.
          </p>
        </>
      );
    case "video":
      return (
        <>
          {field("Video URL", "url", v("url"), onField, { placeholder: "https://youtube.com/watch?v=…", type: "url" })}
          <p className="sm:col-span-2 text-xs text-[var(--color-on-surface-variant)]">Encodes a link to a video (YouTube, Vimeo, direct file, etc.).</p>
        </>
      );
    case "text":
      return <>{field("Text", "text", v("text"), onField, { type: "textarea", placeholder: "Any plain text…" })}</>;
    case "email":
      return (
        <>
          {field("To", "to", v("to"), onField, { type: "email", placeholder: "name@example.com" })}
          {field("Subject", "subject", v("subject"), onField)}
          {field("Body", "body", v("body"), onField, { type: "textarea", className: "sm:col-span-2 w-full px-3 py-2 rounded-lg bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none" })}
        </>
      );
    case "call":
      return <>{field("Phone number", "number", v("number"), onField, { type: "tel", placeholder: "+1 555 123 4567" })}</>;
    case "sms":
      return (
        <>
          {field("Phone number", "number", v("number"), onField, { type: "tel" })}
          {field("Message", "body", v("body"), onField, { type: "textarea" })}
        </>
      );
    case "whatsapp":
      return (
        <>
          {field("WhatsApp number (with country code)", "number", v("number"), onField, { type: "tel", placeholder: "6281234567890" })}
          {field("Prefilled message", "text", v("text"), onField, { type: "textarea" })}
        </>
      );
    case "wifi":
      return (
        <>
          {field("Network name (SSID)", "ssid", v("ssid"), onField)}
          {field("Password", "password", v("password"), onField, { type: "password" })}
          <label className="block">
            <span className="block text-xs font-medium text-[var(--color-on-surface-variant)] mb-1">Security</span>
            <select
              value={v("encryption") || "WPA"}
              onChange={(e) => onField("encryption", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
            >
              <option value="WPA">WPA/WPA2/WPA3</option>
              <option value="WEP">WEP</option>
              <option value="nopass">No password</option>
            </select>
          </label>
          <label className="flex items-center gap-2 mt-2 text-sm">
            <input
              type="checkbox"
              checked={v("hidden") === "true"}
              onChange={(e) => onField("hidden", e.target.checked ? "true" : "false")}
              className="rounded accent-[var(--color-primary)]"
            />
            Hidden network
          </label>
        </>
      );
    case "vcard":
      return (
        <>
          {field("First name", "firstName", v("firstName"), onField)}
          {field("Last name", "lastName", v("lastName"), onField)}
          {field("Organization", "organization", v("organization"), onField)}
          {field("Title", "title", v("title"), onField)}
          {field("Phone", "phone", v("phone"), onField, { type: "tel" })}
          {field("Email", "email", v("email"), onField, { type: "email" })}
          {field("Website", "url", v("url"), onField, { type: "url" })}
          {field("Address", "address", v("address"), onField)}
          {field("Note", "note", v("note"), onField, { type: "textarea", className: "sm:col-span-2 w-full px-3 py-2 rounded-lg bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none" })}
        </>
      );
    case "event":
      return (
        <>
          {field("Event title", "summary", v("summary"), onField)}
          {field("Location", "location", v("location"), onField)}
          <label className="block">
            <span className="block text-xs font-medium text-[var(--color-on-surface-variant)] mb-1">Start</span>
            <input
              type="datetime-local"
              value={v("start")}
              onChange={(e) => onField("start", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-[var(--color-on-surface-variant)] mb-1">End</span>
            <input
              type="datetime-local"
              value={v("end")}
              onChange={(e) => onField("end", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
            />
          </label>
          {field("Description", "description", v("description"), onField, { type: "textarea", className: "sm:col-span-2 w-full px-3 py-2 rounded-lg bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none" })}
        </>
      );
    case "geo":
      return (
        <>
          {field("Latitude", "latitude", v("latitude"), onField, { type: "number", step: "any", placeholder: "-6.2088" })}
          {field("Longitude", "longitude", v("longitude"), onField, { type: "number", step: "any", placeholder: "106.8456" })}
          {field("Place name (optional)", "query", v("query"), onField, { className: "sm:col-span-2 w-full px-3 py-2 rounded-lg bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none" })}
        </>
      );
    default:
      return null;
  }
}
