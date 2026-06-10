"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { LengthStyle } from "@/lib/fraction";

interface Settings {
  units: LengthStyle;
  haptics: boolean;
}

interface SettingsContextValue {
  settings: Settings;
  setUnits: (u: LengthStyle) => void;
  setHaptics: (h: boolean) => void;
  /** Short vibration pulse on supported devices, if haptics are enabled. */
  buzz: () => void;
}

const DEFAULTS: Settings = { units: "ftin", haptics: true };
const STORAGE_KEY = "carpcalc-settings";

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULTS,
  setUnits: () => {},
  setHaptics: () => {},
  buzz: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        setSettings({
          units: saved.units === "in" ? "in" : "ftin",
          haptics: saved.haptics !== false,
        });
      }
    } catch {
      // ignore bad/blocked storage
    }
  }, []);

  const save = (next: Settings) => {
    setSettings(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore blocked storage
    }
  };

  const buzz = () => {
    if (settings.haptics && typeof navigator !== "undefined") {
      navigator.vibrate?.(8);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setUnits: (units) => save({ ...settings, units }),
        setHaptics: (haptics) => save({ ...settings, haptics }),
        buzz,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
