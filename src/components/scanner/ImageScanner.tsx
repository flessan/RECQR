"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, Upload, ClipboardPaste, X } from "lucide-react";
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

export default function ImageScanner({ onDecoded }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>({ kind: "idle" });
  const dragDepth = useRef(0);

  const processFile = useCallback(
    async (file: Blob, name?: string) => {
      if (!file.type.startsWith("image/")) {
        setFeedback({ kind: "error", message: "That file is not an image." });
        return;
      }
      setFeedback({
        kind: "processing",
        message: `Decoding ${name || "image"}…`,
      });
      try {
        const result = await decodeQrFromImage(file);
        if (!result) {
          setFeedback({
            kind: "error",
            message:
              "No QR code found in that image. Try a clearer, closer screenshot.",
          });
          return;
        }
        setFeedback({ kind: "success", message: "QR code found!" });
        onDecoded(result.data, name || "image");
      } catch {
        setFeedback({
          kind: "error",
          message: "Could not read that image. It may be corrupted.",
        });
      }
    },
    [onDecoded]
  );

  const onPaste = useCallback(
    (e: ClipboardEvent) => {
      const found = blobFromClipboard(e);
      if (!found) {
        setFeedback({
          kind: "error",
          message: "Your clipboard does not contain an image.",
        });
        return;
      }
      e.preventDefault();
      void processFile(found.blob, found.name);
    },
    [processFile]
  );

  useEffect(() => {
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [onPaste]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dragDepth.current = 0;
      setDragging(false);
      const file = fileFromDragEvent(e.nativeEvent);
      if (file) void processFile(file, file.name);
    },
    [processFile]
  );

  return (
    <div
      onDragEnter={(e) => {
        e.preventDefault();
        dragDepth.current += 1;
        setDragging(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={(e) => {
        e.preventDefault();
        dragDepth.current -= 1;
        if (dragDepth.current <= 0) setDragging(false);
      }}
      onDrop={onDrop}
      className={`relative rounded-3xl border-2 border-dashed p-6 text-center transition-colors ${
        dragging
          ? "border-[var(--color-primary)] bg-[var(--color-primary-container)]"
          : "border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] hover:border-[var(--color-primary)]"
      }`}
    >
      {dragging && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-[var(--color-primary-container)]/95 text-lg font-black tracking-tight text-[var(--color-on-primary-container)]">
          Drop image to scan
        </div>
      )}

      <div className="flex flex-col items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[var(--color-outline)] bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)] shadow-[var(--ui-shadow-sm)]">
          <ImagePlus className="w-6 h-6" />
        </div>
        <div>
          <p className="text-base font-black tracking-tight text-[var(--color-on-surface)]">
            Upload, drag &amp; drop, or paste a QR image
          </p>
          <p className="mt-1 text-sm font-medium text-[var(--color-on-surface-variant)]">
            Press <kbd className="rounded-md border-2 border-[var(--color-outline-variant)] bg-[var(--color-surface-container-high)] px-1.5 py-0.5 text-xs font-bold">Ctrl/⌘ + V</kbd> after copying a screenshot. 100% local.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="ui-btn ui-btn-primary ui-btn-sm"
          >
            <Upload className="w-4 h-4" /> Choose image
          </button>
          <button
            type="button"
            onClick={async () => {
              try {
                const items = await navigator.clipboard?.read();
                if (!items) throw new Error("no clipboard");
                for (const item of items) {
                  const img = item.types.find((t) => t.startsWith("image/"));
                  if (img) {
                    const blob = await item.getType(img);
                    void processFile(blob, "clipboard.png");
                    return;
                  }
                }
                setFeedback({ kind: "error", message: "Clipboard has no image." });
              } catch {
                setFeedback({
                  kind: "error",
                  message: "Could not read the clipboard. Use Ctrl/⌘ + V instead.",
                });
              }
            }}
            className="ui-btn ui-btn-surface ui-btn-sm"
          >
            <ClipboardPaste className="w-4 h-4" /> Paste
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void processFile(file, file.name);
            e.target.value = "";
          }}
        />
      </div>

      {feedback.kind !== "idle" && (
        <div
          role="status"
          className={`mt-4 text-sm rounded-xl px-3 py-2 inline-flex items-center gap-2 ${
            feedback.kind === "error"
              ? "bg-[var(--color-error-container)] text-[var(--color-on-error-container)]"
              : feedback.kind === "success"
              ? "bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-100"
              : "bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)]"
          }`}
        >
          {feedback.message}
          {feedback.kind === "error" && (
            <button
              aria-label="Dismiss"
              onClick={() => setFeedback({ kind: "idle" })}
              className="ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
