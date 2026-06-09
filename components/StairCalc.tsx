"use client";

import { useState } from "react";
import LengthInput from "./LengthInput";
import { parseLength } from "@/lib/fraction";
import { calcStairs } from "@/lib/stairs";

export default function StairCalc() {
  const [rise, setRise] = useState("");
  const [tread, setTread] = useState("10");
  const [maxRiser, setMaxRiser] = useState("7-3/4");

  const r = parseLength(rise);
  const t = parseLength(tread);
  const m = parseLength(maxRiser);

  const result = r && t && m ? calcStairs(r, t, m) : null;

  return (
    <div className="card">
      <h2>Stair Stringer</h2>
      <p className="hint">
        Enter total rise (finished floor to finished floor). Defaults follow
        IRC residential limits: riser max 7-3/4&quot;, tread min 10&quot;.
      </p>

      <LengthInput
        label="Total rise"
        value={rise}
        onChange={setRise}
        placeholder={`e.g. 8' 9-1/4"`}
      />
      <div className="field-row">
        <LengthInput label="Tread depth (run)" value={tread} onChange={setTread} />
        <LengthInput label="Max riser height" value={maxRiser} onChange={setMaxRiser} />
      </div>

      {result && "error" in result && (
        <div className="error-box">{result.error}</div>
      )}

      {result && !("error" in result) && (
        <div className="results">
          <div className="result-line">
            <span className="label">Risers</span>
            <span className="value big">{result.risers}</span>
          </div>
          <div className="result-line">
            <span className="label">Riser height</span>
            <span className="value big">{result.riserHeightText}</span>
          </div>
          <div className="result-line">
            <span className="label">Treads</span>
            <span className="value">{result.treads}</span>
          </div>
          <div className="result-line">
            <span className="label">Total run</span>
            <span className="value">{result.totalRunText}</span>
          </div>
          <div className="result-line">
            <span className="label">Stringer length</span>
            <span className="value">{result.stringerLengthText}</span>
          </div>
          <div className="result-line">
            <span className="label">Stair angle</span>
            <span className="value">{result.angleDeg.toFixed(1)}°</span>
          </div>
          {result.warnings.map((w, i) => (
            <div key={i} className="warning">
              ⚠ {w}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
