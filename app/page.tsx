"use client";

import { useState } from "react";
import TapeCalculator from "@/components/TapeCalculator";
import BalusterCalc from "@/components/BalusterCalc";
import StairCalc from "@/components/StairCalc";
import CrownCalc from "@/components/CrownCalc";
import BoardFeetCalc from "@/components/BoardFeetCalc";

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

  return (
    <main className="container">
      <header className="app-header">
        <h1>Carpenter&apos;s Calculator</h1>
        <span>feet · inches · fractions</span>
      </header>

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
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
