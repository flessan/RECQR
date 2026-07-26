"use client";

import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { ScanHistory, QRCodeData } from "@/lib/types";

export const useScanHistory = create<ScanHistory>((set) => ({
  scans: [],

  addScan: (data) => {
    const newScan: QRCodeData = {
      ...data,
      id: uuidv4(),
      timestamp: Date.now(),
      favorite: false,
    };

    set((state) => ({
      scans: [newScan, ...state.scans].slice(0, 100), // Keep last 100 scans
    }));
  },

  toggleFavorite: (id) => {
    set((state) => ({
      scans: state.scans.map((scan) =>
        scan.id === id ? { ...scan, favorite: !scan.favorite } : scan
      ),
    }));
  },

  deleteScan: (id) => {
    set((state) => ({
      scans: state.scans.filter((scan) => scan.id !== id),
    }));
  },

  clearHistory: () => {
    set({ scans: [] });
  },
}));
