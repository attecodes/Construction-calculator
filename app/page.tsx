"use client";

import { useState } from "react";
import TapeCalculator from "@/components/TapeCalculator";
import BalusterCalc from "@/components/BalusterCalc";
import StairCalc from "@/components/StairCalc";
import CrownCalc from "@/components/CrownCalc";
import BoardFeetCalc from "@/components/BoardFeetCalc";
import { useSettings } from "@/components/SettingsContext";

const TABS = [
  { id: "calc", label: "Calculator" },
  { id: "balusters", label: "Balusters" },
  { id: "stairs", label: "Stairs" },
  { id: "crown", label: "Crown" },
  { id: "boardfeet", label: "Board Feet" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function Home() {
  const [tab, setTab] = useState<TabId>("calc");
  const [showSettings, setShowSettings] = useState(false);
  const { settings, setUnits, setHaptics, buzz } = useSettings();

  return (
    <main className="container">
      <header className="app-header">
        <h1>Carpenter&apos;s Calculator</h1>
        <span>feet · inches · fractions</span>
        <button
          className="icon-btn"
          aria-label="Settings"
          aria-expanded={showSettings}
          onClick={() => {
            buzz();
            setShowSettings((v) => !v);
          }}
        >
          ⚙
        </button>
      </header>

      {showSettings && (
        <div className="card">
          <h2>Settings</h2>
          <div className="field">
            <label>Display lengths as</label>
            <div className="denom-row">
              <button
                className={`denom-btn ${settings.units === "ftin" ? "active" : ""}`}
                onClick={() => {
                  buzz();
                  setUnits("ftin");
                }}
              >
                Feet &amp; inches (3&apos; 5-3/8&quot;)
              </button>
              <button
                className={`denom-btn ${settings.units === "in" ? "active" : ""}`}
                onClick={() => {
                  buzz();
                  setUnits("in");
                }}
              >
                Inches only (41-3/8&quot;)
              </button>
            </div>
          </div>
          <div className="field">
            <label>Haptic feedback (vibrate on keys)</label>
            <div className="denom-row">
              <button
                className={`denom-btn ${settings.haptics ? "active" : ""}`}
                onClick={() => {
                  setHaptics(true);
                  navigator.vibrate?.(8);
                }}
              >
                On
              </button>
              <button
                className={`denom-btn ${!settings.haptics ? "active" : ""}`}
                onClick={() => setHaptics(false)}
              >
                Off
              </button>
            </div>
            <div className="preview" style={{ color: "var(--text-dim)" }}>
              Works on Android. iPhones don&apos;t support web vibration.
            </div>
          </div>
        </div>
      )}

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? "active" : ""}`}
            onClick={() => {
              buzz();
              setTab(t.id);
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "calc" && <TapeCalculator />}
      {tab === "balusters" && <BalusterCalc />}
      {tab === "stairs" && <StairCalc />}
      {tab === "crown" && <CrownCalc />}
      {tab === "boardfeet" && <BoardFeetCalc />}

      <footer className="app-footer">
        Always verify layout and code requirements on site. Calculations
        rounded to the nearest 1/16&quot; unless noted.
      </footer>
    </main>
  );
}
