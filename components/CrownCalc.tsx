"use client";

import { useState } from "react";
import { calcCrown } from "@/lib/crown";

export default function CrownCalc() {
  const [spring, setSpring] = useState("38");
  const [corner, setCorner] = useState("90");

  const s = parseFloat(spring);
  const c = parseFloat(corner);
  const valid = !isNaN(s) && !isNaN(c) && s > 0 && s < 90 && c > 0 && c < 180;
  const result = valid ? calcCrown(s, c) : null;

  return (
    <div className="card">
      <h2>Crown Molding — Flat Cut</h2>
      <p className="hint">
        Miter and bevel angles for cutting crown laid flat on the saw. Spring
        angle is between the back of the crown and the wall (most crown is
        38° or 45°). Corner angle is the wall angle — 90° for a square corner.
      </p>

      <div className="field">
        <label>Spring angle</label>
        <div className="denom-row" style={{ marginBottom: 6 }}>
          {["38", "45", "52"].map((v) => (
            <button
              key={v}
              className={`denom-btn ${spring === v ? "active" : ""}`}
              onClick={() => setSpring(v)}
            >
              {v}°
            </button>
          ))}
        </div>
        <input
          type="number"
          value={spring}
          onChange={(e) => setSpring(e.target.value)}
          min={1}
          max={89}
        />
      </div>

      <div className="field">
        <label>Corner angle (degrees)</label>
        <div className="denom-row" style={{ marginBottom: 6 }}>
          {["90", "135"].map((v) => (
            <button
              key={v}
              className={`denom-btn ${corner === v ? "active" : ""}`}
              onClick={() => setCorner(v)}
            >
              {v}°
            </button>
          ))}
        </div>
        <input
          type="number"
          value={corner}
          onChange={(e) => setCorner(e.target.value)}
          min={1}
          max={179}
        />
      </div>

      {!valid && (
        <div className="error-box">
          Spring must be 1–89° and corner 1–179°.
        </div>
      )}

      {result && (
        <div className="results">
          <div className="result-line">
            <span className="label">Miter angle</span>
            <span className="value big">{result.miter.toFixed(2)}°</span>
          </div>
          <div className="result-line">
            <span className="label">Bevel angle</span>
            <span className="value big">{result.bevel.toFixed(2)}°</span>
          </div>
          <div className="result-line">
            <span className="label">Inside corner</span>
            <span className="value" style={{ fontWeight: 400, fontSize: "0.85rem" }}>
              Left piece: miter right, save left end.
              <br />
              Right piece: miter left, save right end.
            </span>
          </div>
          <div className="result-line">
            <span className="label">Tip</span>
            <span className="value" style={{ fontWeight: 400, fontSize: "0.85rem" }}>
              Cut with the crown flat, finished face up,
              <br />
              ceiling edge against the fence.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
