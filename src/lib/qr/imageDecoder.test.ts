import { describe, it, expect } from "vitest";
import { decodeQrFromImage, fileFromDragEvent, blobFromClipboard } from "./imageDecoder";

function makeCanvas(
  w: number,
  h: number,
  paint?: (ctx: CanvasRenderingContext2D) => void
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (ctx && paint) paint(ctx);
  return canvas;
}

describe("decodeQrFromImage", () => {
  it("returns null for a blank canvas without throwing", async () => {
    const canvas = makeCanvas(64, 64, (ctx) => {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, 64, 64);
    });
    const result = await decodeQrFromImage(canvas, { preprocess: false });
    expect(result).toBeNull();
  });

  it("returns null for a plain ImageData (no QR)", async () => {
    const Ctor = (globalThis as { ImageData?: new (w: number, h: number) => ImageData }).ImageData;
    if (!Ctor) return; // environment without ImageData constructor
    const data = new Ctor(32, 32);
    const result = await decodeQrFromImage(data, { preprocess: false });
    expect(result).toBeNull();
  });

  it("returns null for a non-image blob source", async () => {
    const blob = new Blob(["not an image"], { type: "text/plain" });
    await expect(decodeQrFromImage(blob)).resolves.toBeNull();
  });
});

describe("clipboard / drag helpers", () => {
  it("returns null when clipboard has no image item", () => {
    const dt = new DataTransfer();
    dt.setData("text/plain", "hello");
    const event = { clipboardData: dt } as unknown as ClipboardEvent;
    expect(blobFromClipboard(event)).toBeNull();
  });

  it("returns null when drag has no files", () => {
    const dt = new DataTransfer();
    const event = { dataTransfer: dt } as unknown as DragEvent;
    expect(fileFromDragEvent(event)).toBeNull();
  });
});
