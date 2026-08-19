"use client";

import {
  Camera,
  CameraOff,
  RefreshCw,
  SwitchCamera,
  Volume2,
  VolumeX,
  Vibrate,
  Zap,
  ZapOff,
  ZoomIn,
} from "lucide-react";
import type { CameraScannerApi } from "@/lib/hooks/useCameraScanner";

interface Props {
  scanner: CameraScannerApi;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  onToggleSound: () => void;
  onToggleHaptic: () => void;
}

export default function ScannerControls({
  scanner,
  soundEnabled,
  hapticEnabled,
  onToggleSound,
  onToggleHaptic,
}: Props) {
  const { status, torch, zoom, hasMultipleCameras } = scanner;
  const isScanning = status === "scanning";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {isScanning ? (
          <button
            onClick={scanner.stop}
            className="ui-btn ui-btn-danger"
          >
            <CameraOff className="w-5 h-5" /> Stop
          </button>
        ) : (
          <button
            onClick={status === "success" ? scanner.resume : scanner.start}
            className="ui-btn ui-btn-primary"
          >
            {status === "requesting" ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Camera className="w-5 h-5" />
            )}
            {status === "success" ? "Scan again" : "Start scanning"}
          </button>
        )}

        {isScanning && hasMultipleCameras && (
          <IconButton label="Switch camera" onClick={scanner.switchCamera}>
            <SwitchCamera className="w-5 h-5" />
          </IconButton>
        )}

        {isScanning && torch.supported && (
          <IconButton
            label={torch.on ? "Turn off torch" : "Turn on torch"}
            onClick={scanner.toggleTorch}
            active={torch.on}
          >
            {torch.on ? <Zap className="w-5 h-5" /> : <ZapOff className="w-5 h-5" />}
          </IconButton>
        )}

        <IconButton
          label={soundEnabled ? "Mute beep" : "Enable beep"}
          onClick={onToggleSound}
          active={soundEnabled}
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </IconButton>

        <IconButton
          label={hapticEnabled ? "Disable vibration" : "Enable vibration"}
          onClick={onToggleHaptic}
          active={hapticEnabled}
        >
          <Vibrate className="w-5 h-5" />
        </IconButton>
      </div>

      {isScanning && zoom.supported && (
        <div className="ui-card-flat mx-auto flex max-w-sm items-center gap-3 px-4 py-2.5">
          <ZoomIn className="w-4 h-4 text-[var(--color-on-surface-variant)]" />
          <input
            type="range"
            min={zoom.min}
            max={zoom.max}
            step={zoom.step}
            value={zoom.value}
            onChange={(e) => scanner.setZoom(parseFloat(e.target.value))}
            aria-label="Camera zoom"
            className="w-full cursor-pointer accent-[var(--color-primary)]"
          />
          <span className="w-10 text-right text-xs font-bold tabular-nums text-[var(--color-on-surface-variant)]">
            {zoom.value.toFixed(1)}x
          </span>
        </div>
      )}
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  active,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className="ui-icon-btn"
    >
      {children}
    </button>
  );
}
