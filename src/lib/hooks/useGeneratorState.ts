"use client";

import { useEffect, useState } from "react";
import {
  buildPayload,
  defaultContent,
  hasRequiredContent,
  missingContentHint,
} from "@/lib/qr/encoder";
import type {
  ContentPreset,
  GeneratorDesign,
  GeneratorState,
  LogoSettings,
  OutputSettings,
} from "@/lib/qr/types";

export const DEFAULT_DESIGN: GeneratorDesign = {
  fgColor: "#0E1330",
  bgColor: "#FFFFFF",
  transparentBg: false,
  size: 320,
  margin: 4,
  errorCorrection: "M",
  dotStyle: "rounded",
  eyeStyle: "rounded",
  frame: false,
  frameText: "",
};

export const DEFAULT_LOGO: LogoSettings = {
  src: null,
  name: null,
  sizeRatio: 0.22,
  padding: 8,
  background: "#FFFFFF",
  roundedBg: true,
};

const STORAGE_KEY = "recqr-generator-state";

function loadInitial(): GeneratorState {
  if (typeof window === "undefined") {
    return {
      content: { preset: "link", data: defaultContent("link") },
      design: DEFAULT_DESIGN,
      logo: DEFAULT_LOGO,
      output: { format: "png" },
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<GeneratorState>;
      return {
        content: parsed.content ?? { preset: "link", data: defaultContent("link") },
        design: { ...DEFAULT_DESIGN, ...parsed.design },
        // Don't restore the object URL across reloads - it would be invalid.
        logo: { ...DEFAULT_LOGO, ...parsed.logo, src: null, name: null },
        output: { format: parsed.output?.format ?? "png" },
      };
    }
  } catch {
    /* ignore */
  }
  return {
    content: { preset: "link", data: defaultContent("link") },
    design: DEFAULT_DESIGN,
    logo: DEFAULT_LOGO,
    output: { format: "png" },
  };
}

export function useGeneratorState() {
  const [state, setState] = useState<GeneratorState>(loadInitial);

  // Revoke temporary logo URLs when a logo is replaced or the generator unmounts.
  useEffect(() => {
    const objectUrl = state.logo.src;
    if (!objectUrl) return;
    return () => URL.revokeObjectURL(objectUrl);
  }, [state.logo.src]);

  useEffect(() => {
    try {
      const toStore = {
        ...state,
        logo: { ...state.logo, src: null },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch {
      /* storage full or unavailable; non-fatal */
    }
  }, [state]);

  const payload = buildPayload(state.content);
  const isReady = hasRequiredContent(state.content);
  const contentHint = missingContentHint(state.content);

  const setPreset = (preset: ContentPreset) =>
    setState((s) => ({ ...s, content: { preset, data: defaultContent(preset) } }));

  const setField = (key: string, value: string) =>
    setState((s) => ({
      ...s,
      content: { ...s.content, data: { ...s.content.data, [key]: value } },
    }));

  const patchDesign = (patch: Partial<GeneratorDesign>) =>
    setState((s) => ({ ...s, design: { ...s.design, ...patch } }));

  const patchLogo = (patch: Partial<LogoSettings>) =>
    setState((s) => {
      const logo = { ...s.logo, ...patch };
      // A logo covers modules; force the strongest error correction so the
      // code remains scannable (required for embedded logos).
      const design = logo.src
        ? { ...s.design, errorCorrection: "H" as const }
        : s.design;
      return { ...s, logo, design };
    });

  const setOutput = (patch: Partial<OutputSettings>) =>
    setState((s) => ({ ...s, output: { ...s.output, ...patch } }));

  const resetLogo = () => {
    setState((s) => ({ ...s, logo: DEFAULT_LOGO }));
  };

  return {
    state,
    payload,
    isReady,
    contentHint,
    setPreset,
    setField,
    patchDesign,
    patchLogo,
    setOutput,
    resetLogo,
  };
}
