"use client";

import { useState } from "react";
import LengthInput from "./LengthInput";
import { parseLength } from "@/lib/fraction";
import { layoutBalusters } from "@/lib/baluster";
import { useSettings } from "./SettingsContext";

export default function BalusterCalc() {
  const [opening, setOpening] = useState("");
  const [width, setWidth] = useState("1-1/2");
  const [maxGap, setMaxGap] = useState("3-7/8");
  const [fromEdge, setFromEdge] = useState(false);
  const { settings } = useSettings();

  const L = parseLength(opening);
  const w = parseLength(width);
  const g = parseLength(maxGap);

  const result = L && w && g ? layoutBalusters(L, w, g, settings.units) : null;

  return (
    <div className="card">
      <h2>Baluster Layout</h2>
      <p className="hint">
        Evenly spaces balusters in an opening so no gap exceeds the max
        (default 3-7/8&quot; keeps you under the 4&quot; sphere rule). Measure
        the clear opening between newel posts.
      </p>

      <LengthInput
        label="Clear opening (post to post)"
        value={opening}
        onChange={setOpening}
        placeholder={`e.g. 6' 2-1/2"`}
      />
      <div className="field-row">
        <LengthInput
          label="Baluster width"
          value={width}
          onChange={setWidth}
        />
        <LengthInput label="Max clear gap" value={maxGap} onChange={setMaxGap} />
      </div>

      {result && "error" in result && (
        <div className="error-box">{result.error}</div>
      )}

      {result && !("error" in result) && (
        <div className="results">
          <div className="result-line">
            <span className="label">Balusters needed</span>
            <span className="value big">{result.count}</span>
          </div>
          <div className="result-line">
            <span className="label">Clear gap (each)</span>
            <span className="value">{result.gapText}</span>
          </div>
          <div className="result-line">
            <span className="label">On-center spacing</span>
            <span className="value">{result.onCenterText}</span>
          </div>

          {result.count > 0 && (
            <>
              <div className="result-line" style={{ borderBottom: "none" }}>
                <span className="label">
                  Layout marks from left post —{" "}
                  <button
                    className="denom-btn"
                    onClick={() => setFromEdge((v) => !v)}
                  >
                    {fromEdge ? "near edge" : "centerline"}
                  </button>
                </span>
              </div>
              <table className="marks-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{fromEdge ? "Mark (near edge)" : "Mark (center)"}</th>
                  </tr>
                </thead>
                <tbody>
                  {(fromEdge ? result.edges : result.centers).map((m, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{m}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  );
}
