"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ParsedPayload, QRCodeType, ScanRecord } from "@/lib/qr/types";

const MAX_HISTORY = 200;

export interface ScanHistoryState {
  scans: ScanRecord[];
  soundEnabled: boolean;
  hapticEnabled: boolean;
  addScan: (input: {
    raw: string;
    type: QRCodeType;
    parsed?: ParsedPayload;
  }) => ScanRecord;
  toggleFavorite: (id: string) => void;
  deleteScan: (id: string) => void;
  clearHistory: () => void;
  setSoundEnabled: (value: boolean) => void;
  setHapticEnabled: (value: boolean) => void;
}

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `scan-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export const useScanHistory = create<ScanHistoryState>()(
  persist(
    (set) => ({
      scans: [],
      soundEnabled: true,
      hapticEnabled: true,
      addScan: ({ raw, type, parsed }) => {
        const record: ScanRecord = {
          id: makeId(),
          raw,
          type,
          parsed,
          timestamp: Date.now(),
          favorite: false,
        };
        set((state) => {
          // De-duplicate identical raw content scanned within the last 10s.
          const recentCutoff = Date.now() - 10_000;
          const duplicate = state.scans.find(
            (s) => s.raw === raw && s.timestamp > recentCutoff
          );
          if (duplicate) return state;
          const scans = [record, ...state.scans];
          // Keep favorites regardless of cap; trim non-favorites to MAX_HISTORY.
          const favorites = scans.filter((s) => s.favorite);
          const others = scans.filter((s) => !s.favorite).slice(0, MAX_HISTORY);
          return { scans: [...favorites, ...others].sort((a, b) => b.timestamp - a.timestamp) };
        });
        return record;
      },
      toggleFavorite: (id) =>
        set((state) => ({
          scans: state.scans.map((s) =>
            s.id === id ? { ...s, favorite: !s.favorite } : s
          ),
        })),
      deleteScan: (id) =>
        set((state) => ({
          scans: state.scans.filter((s) => s.id !== id),
        })),
      clearHistory: () =>
        set((state) => ({
          scans: state.scans.filter((s) => s.favorite),
        })),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setHapticEnabled: (hapticEnabled) => set({ hapticEnabled }),
    }),
    {
      name: "recqr-scan-history",
      storage: createJSONStorage(() => localStorage),
      version: 2,
      // Only persist the data we need; settings + records.
      partialize: (state) => ({
        scans: state.scans,
        soundEnabled: state.soundEnabled,
        hapticEnabled: state.hapticEnabled,
      }),
    }
  )
);
