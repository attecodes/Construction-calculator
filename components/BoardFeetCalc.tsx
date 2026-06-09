"use client";

import { useState } from "react";

export default function BoardFeetCalc() {
  const [thickness, setThickness] = useState("1");
  const [width, setWidth] = useState("6");
  const [lengthFt, setLengthFt] = useState("8");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("");

  const t = parseFloat(thickness);
  const w = parseFloat(width);
  const l = parseFloat(lengthFt);
  const q = parseInt(qty, 10);
  const p = parseFloat(price);

  const valid = t > 0 && w > 0 && l > 0 && q > 0;
  const bfEach = valid ? (t * w * l) / 12 : 0;
  const bfTotal = bfEach * (q || 0);
  const cost = !isNaN(p) && p > 0 ? bfTotal * p : null;

  return (
    <div className="card">
      <h2>Board Feet</h2>
      <p className="hint">
        1 board foot = 144 cubic inches (1&quot; × 12&quot; × 12&quot;). Use
        nominal rough thickness for hardwood (4/4 = 1&quot;, 5/4 = 1.25&quot;,
        8/4 = 2&quot;).
      </p>

      <div className="field-row">
        <div className="field">
          <label>Thickness (in)</label>
          <input
            type="number"
            inputMode="decimal"
            value={thickness}
            onChange={(e) => setThickness(e.target.value)}
            step="0.25"
            min="0"
          />
        </div>
        <div className="field">
          <label>Width (in)</label>
          <input
            type="number"
            inputMode="decimal"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            step="0.25"
            min="0"
          />
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label>Length (ft)</label>
          <input
            type="number"
            inputMode="decimal"
            value={lengthFt}
            onChange={(e) => setLengthFt(e.target.value)}
            step="0.5"
            min="0"
          />
        </div>
        <div className="field">
          <label>Quantity</label>
          <input
            type="number"
            inputMode="numeric"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            min="1"
          />
        </div>
      </div>
      <div className="field">
        <label>Price per board foot ($, optional)</label>
        <input
          type="number"
          inputMode="decimal"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          step="0.01"
          min="0"
          placeholder="e.g. 6.50"
        />
      </div>

      {valid && (
        <div className="results">
          <div className="result-line">
            <span className="label">Board feet (each)</span>
            <span className="value">{bfEach.toFixed(2)} bf</span>
          </div>
          <div className="result-line">
            <span className="label">Board feet (total)</span>
            <span className="value big">{bfTotal.toFixed(2)} bf</span>
          </div>
          {cost !== null && (
            <div className="result-line">
              <span className="label">Estimated cost</span>
              <span className="value big">${cost.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
