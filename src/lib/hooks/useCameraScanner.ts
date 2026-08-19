"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type FacingMode = "environment" | "user";

export type ScannerStatus =
  | "idle"
  | "requesting"
  | "scanning"
  | "success"
  | "error"
  | "stopped";

export interface UseCameraScannerOptions {
  onDetect: (data: string) => void;
  /** Milliseconds between decode attempts. ~80ms = ~12.5 attempts/sec. */
  throttleMs?: number;
  /** Max canvas dimension used for decoding (preview stays at full res). */
  decodeMaxDim?: number;
  soundEnabled?: boolean;
  hapticEnabled?: boolean;
  cooldownMs?: number;
}

export interface TorchCapabilities {
  supported: boolean;
  on: boolean;
}

export interface ZoomCapabilities {
  supported: boolean;
  min: number;
  max: number;
  step: number;
  value: number;
}

export interface CameraScannerApi {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  status: ScannerStatus;
  error: string | null;
  facingMode: FacingMode;
  torch: TorchCapabilities;
  zoom: ZoomCapabilities;
  hasMultipleCameras: boolean;
  start: () => Promise<void>;
  stop: () => void;
  switchCamera: () => Promise<void>;
  toggleTorch: () => Promise<void>;
  setZoom: (value: number) => Promise<void>;
  resume: () => Promise<void>;
}

function isCapableTrack(track: MediaStreamTrack): MediaStreamTrack & {
  getCapabilities?: () => MediaTrackCapabilities;
  applyConstraints?: (c: MediaTrackConstraints) => Promise<void>;
} {
  return track as MediaStreamTrack & {
    getCapabilities?: () => MediaTrackCapabilities;
  };
}

export function useCameraScanner(
  options: UseCameraScannerOptions
): CameraScannerApi {
  const {
    onDetect,
    throttleMs = 80,
    decodeMaxDim = 960,
    soundEnabled = true,
    hapticEnabled = true,
    cooldownMs = 2500,
  } = options;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastAttemptRef = useRef(0);
  const lastDetectedRef = useRef<{ data: string; at: number } | null>(null);
  const stoppedRef = useRef(false);
  const onDetectRef = useRef(onDetect);
  const soundEnabledRef = useRef(soundEnabled);
  const hapticEnabledRef = useRef(hapticEnabled);
  const throttleRef = useRef(throttleMs);
  const decodeMaxRef = useRef(decodeMaxDim);
  const cooldownRef = useRef(cooldownMs);

  const [status, setStatus] = useState<ScannerStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const facingModeRef = useRef<FacingMode>("environment");
  const [facingMode, setFacingMode] = useState<FacingMode>("environment");
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [torch, setTorch] = useState<TorchCapabilities>({
    supported: false,
    on: false,
  });
  const [zoom, setZoomState] = useState<ZoomCapabilities>({
    supported: false,
    min: 1,
    max: 1,
    step: 0.1,
    value: 1,
  });

  useEffect(() => {
    onDetectRef.current = onDetect;
  }, [onDetect]);
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);
  useEffect(() => {
    hapticEnabledRef.current = hapticEnabled;
  }, [hapticEnabled]);
  useEffect(() => {
    throttleRef.current = throttleMs;
  }, [throttleMs]);
  useEffect(() => {
    decodeMaxRef.current = decodeMaxDim;
  }, [decodeMaxDim]);
  useEffect(() => {
    cooldownRef.current = cooldownMs;
  }, [cooldownMs]);

  const cleanupStream = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch {
          /* ignore */
        }
      });
      streamRef.current = null;
    }
    trackRef.current = null;
    if (videoRef.current) {
      try {
        videoRef.current.srcObject = null;
      } catch {
        /* ignore */
      }
    }
  }, []);

  const refreshCapabilities = useCallback((track: MediaStreamTrack) => {
    const t = isCapableTrack(track);
    const caps = typeof t.getCapabilities === "function" ? t.getCapabilities() : undefined;
    const settings = track.getSettings?.();
    setTorch({
      supported: !!(caps as MediaTrackCapabilities & { torch?: boolean })?.torch,
      on: false,
    });
    const z = (caps as MediaTrackCapabilities & { zoom?: { min: number; max: number; step: number } })?.zoom;
    if (z && typeof z.max === "number" && z.max > (z.min ?? 1)) {
      setZoomState({
        supported: true,
        min: z.min ?? 1,
        max: z.max,
        step: z.step ?? 0.1,
        value: (settings as MediaTrackSettings & { zoom?: number })?.zoom ?? z.min ?? 1,
      });
    } else {
      setZoomState((z2) => ({ ...z2, supported: false }));
    }
  }, []);

  const playBeep = useCallback(() => {
    if (!soundEnabledRef.current) return;
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
      osc.onended = () => ctx.close();
    } catch {
      /* audio is a progressive enhancement */
    }
  }, []);

  // Stable RAF loop kept in a ref so event handlers always call the latest
  // version. The function body is assigned in an effect (never during render).
  const loopRef = useRef<() => void>(() => {});
  useEffect(() => {
    loopRef.current = function scanFrame() {
      if (stoppedRef.current) return;
      const video = videoRef.current;
      if (!video || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(() => loopRef.current());
        return;
      }

      const now = performance.now();
      if (now - lastAttemptRef.current >= throttleRef.current) {
        lastAttemptRef.current = now;
        void decodeVideoFrame(video, decodeMaxRef.current).then((detected) => {
          if (stoppedRef.current || !detected) return;
          const prev = lastDetectedRef.current;
          const isDuplicate =
            prev &&
            prev.data === detected &&
            now - prev.at < cooldownRef.current;
          if (isDuplicate) return;
          lastDetectedRef.current = { data: detected, at: now };
          playBeep();
          if (hapticEnabledRef.current && "vibrate" in navigator) {
            try {
              navigator.vibrate(50);
            } catch {
              /* ignore */
            }
          }
          stoppedRef.current = true;
          cleanupStream();
          setStatus("success");
          onDetectRef.current(detected);
        });
      }
      if (!stoppedRef.current) {
        rafRef.current = requestAnimationFrame(() => loopRef.current());
      }
    };
  }, [cleanupStream, playBeep]);

  const startLoop = useCallback(() => {
    rafRef.current = requestAnimationFrame(() => loopRef.current());
  }, []);

  const start = useCallback(async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        "Camera access is not supported in this browser. Try uploading an image instead."
      );
      setStatus("error");
      return;
    }
    setStatus("requesting");
    cleanupStream();
    stoppedRef.current = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingModeRef.current },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      trackRef.current = track;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      refreshCapabilities(track);
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setHasMultipleCameras(
          devices.filter((d) => d.kind === "videoinput").length > 1
        );
      } catch {
        /* ignore */
      }
      setStatus("scanning");
      startLoop();
    } catch (err) {
      const name = (err as DOMException)?.name;
      let message =
        "Unable to access the camera. Please check permissions and try again.";
      if (name === "NotAllowedError" || name === "SecurityError") {
        message =
          "Camera permission was denied. Enable camera access in your browser settings to scan.";
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        message = "No camera was found on this device.";
      } else if (name === "NotReadableError") {
        message =
          "The camera is in use by another application. Close other tabs/apps and retry.";
      }
      setError(message);
      setStatus("error");
      cleanupStream();
    }
  }, [cleanupStream, refreshCapabilities, startLoop]);

  const stop = useCallback(() => {
    stoppedRef.current = true;
    cleanupStream();
    setStatus("stopped");
  }, [cleanupStream]);

  const resume = useCallback(async () => {
    await start();
  }, [start]);

  const switchCamera = useCallback(async () => {
    const next: FacingMode =
      facingModeRef.current === "environment" ? "user" : "environment";
    facingModeRef.current = next;
    setFacingMode(next);
    stoppedRef.current = true;
    cleanupStream();
    if (status === "success") {
      // After a successful scan we don't auto-restart; just preselect the
      // other camera for the next manual "scan again".
      return;
    }
    await start();
  }, [cleanupStream, start, status]);

  const toggleTorch = useCallback(async () => {
    const track = trackRef.current;
    if (!track) return;
    const t = isCapableTrack(track);
    if (typeof t.applyConstraints !== "function") return;
    const next = !torch.on;
    try {
      await t.applyConstraints({
        advanced: [{ torch: next } as MediaTrackConstraintSet],
      } as MediaTrackConstraints);
      setTorch((s) => ({ ...s, on: next }));
    } catch {
      /* torch not actually controllable */
    }
  }, [torch.on]);

  const setZoom = useCallback(async (value: number) => {
    const track = trackRef.current;
    if (!track) return;
    const t = isCapableTrack(track);
    if (typeof t.applyConstraints !== "function" || !zoom.supported) return;
    try {
      await t.applyConstraints({
        advanced: [{ zoom: value } as MediaTrackConstraintSet],
      } as MediaTrackConstraints);
      setZoomState((z) => ({ ...z, value }));
    } catch {
      /* ignore unsupported */
    }
  }, [zoom.supported]);

  // Cleanup on unmount / route navigation.
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "hidden") {
        stoppedRef.current = true;
        cleanupStream();
        setStatus((s) => (s === "scanning" ? "stopped" : s));
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      stoppedRef.current = true;
      cleanupStream();
    };
  }, [cleanupStream]);

  // React to device disconnection.
  useEffect(() => {
    if (
      typeof navigator !== "undefined" &&
      navigator.mediaDevices &&
      "ondevicechange" in navigator.mediaDevices
    ) {
      const handler = () => {
        const track = trackRef.current;
        if (track && track.readyState === "ended") {
          setError("The camera was disconnected.");
          setStatus("error");
          cleanupStream();
        }
      };
      navigator.mediaDevices.addEventListener?.("devicechange", handler);
      return () =>
        navigator.mediaDevices.removeEventListener?.(
          "devicechange",
          handler
        );
    }
    return undefined;
  }, [cleanupStream]);

  return {
    videoRef,
    status,
    error,
    facingMode,
    torch,
    zoom,
    hasMultipleCameras,
    start,
    stop,
    switchCamera,
    toggleTorch,
    setZoom,
    resume,
  };
}

// Dynamic import of jsQR keeps the scanner's initial chunk small.
let jsQrPromise: Promise<typeof import("jsqr").default> | null = null;
function getJsQr() {
  if (!jsQrPromise) {
    jsQrPromise = import("jsqr").then((m) => m.default);
  }
  return jsQrPromise;
}

async function decodeVideoFrame(
  video: HTMLVideoElement,
  maxDim: number
): Promise<string | null> {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return null;
  const scale = Math.min(1, maxDim / Math.max(vw, vh));
  const w = Math.round(vw * scale);
  const h = Math.round(vh * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(video, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);
  const jsQR = await getJsQr();
  const code = jsQR(imageData.data, w, h, { inversionAttempts: "dontInvert" });
  return code?.data ?? null;
}
