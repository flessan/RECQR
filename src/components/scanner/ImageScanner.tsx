"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ClipboardPaste, FileImage, ImagePlus, LoaderCircle, Upload, X } from "lucide-react";
import {
  blobFromClipboard,
  decodeQrFromImage,
  fileFromDragEvent,
} from "@/lib/qr/imageDecoder";

interface Props {
  onDecoded: (text: string, source: string) => void;
}

type Feedback =
  | { kind: "idle" }
  | { kind: "processing"; message: string }
  | { kind: "error"; message: string }
  | { kind: "success"; message: string };

interface PreviewImage {
  url: string;
  name: string;
}

const MAX_IMAGE_SIZE = 30 * 1024 * 1024;

function isImageBlob(blob: Blob, name?: string): boolean {
  return (
    blob.type.startsWith("image/") ||
    /\.(avif|bmp|gif|jpe?g|png|svg|webp)$/i.test(name ?? "")
  );
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    !!target.closest("input, textarea, select, [contenteditable='true']")
  );
}

export default function ImageScanner({ onDecoded }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const operationRef = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>({ kind: "idle" });
  const [preview, setPreview] = useState<PreviewImage | null>(null);
  const dragDepth = useRef(0);

  const setImagePreview = useCallback((blob: Blob, name: string) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(blob);
    previewUrlRef.current = url;
    setPreview({ url, name });
  }, []);

  const processFile = useCallback(
    async (file: Blob, name = "Screenshot") => {
      const operation = ++operationRef.current;

      if (!isImageBlob(file, name)) {
        setFeedback({ kind: "error", message: "Choose an image file such as PNG, JPG, WebP, or GIF." });
        return;
      }
      if (!file.size) {
        setFeedback({ kind: "error", message: "That image is empty. Try copying the screenshot again." });
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        setFeedback({ kind: "error", message: "That image is larger than 30 MB. Crop or resize it, then try again." });
        return;
      }

      setImagePreview(file, name);
      setFeedback({ kind: "processing", message: "Looking for a QR code in your image…" });

      try {
        const result = await decodeQrFromImage(file, { maxDimension: 2200 });
        if (operation !== operationRef.current) return;

        if (!result?.data) {
          setFeedback({
            kind: "error",
            message: "No QR code found. Try a sharper screenshot with the whole code visible, or crop closer to it.",
          });
          return;
        }

        setFeedback({ kind: "success", message: "QR code found and read on this device." });
        onDecoded(result.data, name);
      } catch {
        if (operation !== operationRef.current) return;
        setFeedback({
          kind: "error",
          message: "This image could not be opened. Try saving it as PNG or JPG and paste it again.",
        });
      }
    },
    [onDecoded, setImagePreview]
  );

  const onPaste = useCallback(
    (event: ClipboardEvent) => {
      if (event.defaultPrevented || isEditableTarget(event.target)) return;

      const found = blobFromClipboard(event);
      // Ignore ordinary text pastes. The scanner must not interfere with
      // normal clipboard use when the clipboard does not contain an image.
      if (!found) return;

      event.preventDefault();
      void processFile(found.blob, found.name || "Clipboard screenshot");
    },
    [processFile]
  );

  useEffect(() => {
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [onPaste]);

  useEffect(
    () => () => {
      operationRef.current += 1;
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    []
  );

  const readClipboard = useCallback(async () => {
    if (!navigator.clipboard?.read) {
      setFeedback({
        kind: "error",
        message: "This browser cannot read the clipboard directly. Copy your screenshot, then press Ctrl + V (or ⌘ + V).",
      });
      return;
    }

    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find((type) => type.startsWith("image/"));
        if (!imageType) continue;
        const blob = await item.getType(imageType);
        void processFile(blob, "Clipboard screenshot");
        return;
      }
      setFeedback({ kind: "error", message: "There is no image in your clipboard yet. Copy a screenshot first." });
    } catch {
      setFeedback({
        kind: "error",
        message: "Clipboard access was blocked by the browser. Copy your screenshot, then press Ctrl + V (or ⌘ + V).",
      });
    }
  }, [processFile]);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      dragDepth.current = 0;
      setDragging(false);
      const file = fileFromDragEvent(event.nativeEvent);
      if (file) {
        void processFile(file, file.name || "Dropped image");
      } else {
        setFeedback({ kind: "error", message: "Drop an image file to scan it." });
      }
    },
    [processFile]
  );

  const dropZoneClass = "relative overflow-hidden rounded-[2rem] border-2 border-dashed p-5 text-center transition-colors sm:p-8 " +
    (dragging
      ? "border-[var(--color-primary)] bg-[var(--color-primary-container)]"
      : "border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] hover:border-[var(--color-primary)]");

  return (
    <section
      aria-label="Read a QR code from an image"
      onDragEnter={(event) => {
        event.preventDefault();
        dragDepth.current += 1;
        setDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        event.preventDefault();
        dragDepth.current -= 1;
        if (dragDepth.current <= 0) {
          dragDepth.current = 0;
          setDragging(false);
        }
      }}
      onDrop={onDrop}
      className={dropZoneClass}
    >
      {dragging && (
        <div className="absolute inset-0 z-10 grid place-items-center rounded-[2rem] bg-[var(--color-primary-container)]/95 px-5 text-xl font-black text-[var(--color-on-primary-container)]">
          Drop your screenshot here
        </div>
      )}

      <div className="mx-auto flex max-w-xl flex-col items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-3xl border-2 border-[var(--color-outline)] bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)] shadow-[var(--ui-shadow-sm)]">
          {feedback.kind === "processing" ? (
            <LoaderCircle className="h-8 w-8 animate-spin" />
          ) : (
            <ImagePlus className="h-8 w-8" />
          )}
        </div>

        <div>
          <h2 className="text-xl font-black tracking-tight text-[var(--color-on-surface)] sm:text-2xl">
            Paste a QR screenshot to read it
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-on-surface-variant)] sm:text-base">
            Copy any screenshot that contains a QR code, then press{" "}
            <kbd className="rounded-lg border-2 border-[var(--color-outline-variant)] bg-[var(--color-surface-container-high)] px-2 py-1 text-xs font-bold">Ctrl + V</kbd>
            {" "}or{" "}
            <kbd className="rounded-lg border-2 border-[var(--color-outline-variant)] bg-[var(--color-surface-container-high)] px-2 py-1 text-xs font-bold">⌘ + V</kbd>.
            You can also drop an image here.
          </p>
        </div>

        <div className="flex w-full flex-col justify-center gap-2 sm:w-auto sm:flex-row">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="ui-btn ui-btn-primary ui-btn-lg"
            disabled={feedback.kind === "processing"}
          >
            <Upload className="h-5 w-5" />
            Choose screenshot
          </button>
          <button
            type="button"
            onClick={() => void readClipboard()}
            className="ui-btn ui-btn-surface ui-btn-lg"
            disabled={feedback.kind === "processing"}
          >
            <ClipboardPaste className="h-5 w-5" />
            Paste from clipboard
          </button>
        </div>

        <p className="text-xs font-semibold text-[var(--color-on-surface-variant)]">
          No upload. No account. Your image is read on this device.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void processFile(file, file.name || "Selected image");
            event.target.value = "";
          }}
        />

        {preview && (
          <div className="mt-1 flex w-full items-center gap-3 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-3 text-left">
            <div className="grid h-14 w-14 flex-none place-items-center overflow-hidden rounded-xl bg-[var(--color-surface)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview.url} alt="Selected screenshot preview" className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold text-[var(--color-on-surface)]">{preview.name}</div>
              <div className="text-xs text-[var(--color-on-surface-variant)]">Kept in this browser only</div>
            </div>
            {feedback.kind === "success" && <Check className="h-5 w-5 flex-none text-[var(--color-success)]" />}
          </div>
        )}

        {feedback.kind !== "idle" && (
          <div
            role={feedback.kind === "error" ? "alert" : "status"}
            aria-live="polite"
            className={
              "flex w-full items-start gap-2 rounded-2xl px-4 py-3 text-left text-sm font-semibold " +
              (feedback.kind === "error"
                ? "bg-[var(--color-error-container)] text-[var(--color-on-error-container)]"
                : feedback.kind === "success"
                  ? "bg-[var(--color-success-container)] text-[var(--color-on-success-container)]"
                  : "bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)]")
            }
          >
            {feedback.kind === "processing" ? (
              <LoaderCircle className="mt-0.5 h-4 w-4 flex-none animate-spin" />
            ) : feedback.kind === "success" ? (
              <Check className="mt-0.5 h-4 w-4 flex-none" />
            ) : (
              <FileImage className="mt-0.5 h-4 w-4 flex-none" />
            )}
            <span className="min-w-0 flex-1">{feedback.message}</span>
            {feedback.kind === "error" && (
              <button
                type="button"
                aria-label="Dismiss message"
                onClick={() => setFeedback({ kind: "idle" })}
                className="rounded-full p-1 hover:bg-black/5"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
