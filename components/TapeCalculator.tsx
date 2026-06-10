"use client";

import { useCallback, useEffect, useState } from "react";
import { rat, add, mul, div, Rational } from "@/lib/fraction";
import { CalcValue, Op, applyOp, formatValue } from "@/lib/calc";
import { useSettings } from "./SettingsContext";

// Entry being keyed in, Construction Master style:
//   3 [Ft] 5 [In] 3 [/] 8   ->   3' 5-3/8"
interface Entry {
  feet: string | null;
  inches: string | null;
  num: string | null; // numerator, once "/" is pressed
  cur: string; // digits currently being typed
}

const EMPTY: Entry = { feet: null, inches: null, num: null, cur: "" };

function entryIsEmpty(e: Entry): boolean {
  return e.feet === null && e.inches === null && e.num === null && e.cur === "";
}

function entryText(e: Entry): string {
  let s = "";
  if (e.feet !== null) s += `${e.feet}' `;
  if (e.inches !== null) s += e.inches;
  if (e.num !== null) {
    s += `${e.inches !== null ? "-" : ""}${e.num}/${e.cur || "?"}`;
  } else {
    s += e.cur;
  }
  if (e.inches !== null || e.num !== null) s += `"`;
  return s.trim() || "0";
}

function entryToValue(e: Entry): CalcValue {
  let v: Rational = rat(0);
  const isLength = e.feet !== null || e.inches !== null || e.num !== null;

  if (e.feet !== null) v = add(v, mul(decimal(e.feet), rat(12)));
  if (e.inches !== null) v = add(v, decimal(e.inches));

  if (e.num !== null) {
    const den = parseInt(e.cur || "0", 10);
    if (!den) throw new Error("Finish the fraction (missing denominator)");
    v = add(v, div(decimal(e.num), rat(den)));
  } else if (e.cur !== "") {
    v = add(v, decimal(e.cur));
  }

  return { v, dim: isLength ? 1 : 0 };
}

function decimal(s: string): Rational {
  if (s === "" || s === ".") return rat(0);
  const dot = s.indexOf(".");
  if (dot === -1) return rat(parseInt(s, 10));
  const places = s.length - dot - 1;
  return rat(Math.round(parseFloat(s) * 10 ** places), 10 ** places);
}

const OP_LABEL: Record<Op, string> = { "+": "+", "-": "−", "*": "×", "/": "÷" };

export default function TapeCalculator() {
  const [entry, setEntry] = useState<Entry>(EMPTY);
  const [acc, setAcc] = useState<CalcValue | null>(null);
  const [pendingOp, setPendingOp] = useState<Op | null>(null);
  const [result, setResult] = useState<CalcValue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [denom, setDenom] = useState(16);
  const { settings, buzz } = useSettings();

  const press = useCallback(
    (key: string) => {
      buzz();
      setError(null);

      const digit = /^[0-9]$/.test(key);

      if (digit || key === ".") {
        setResult(null);
        setEntry((e) => {
          // Starting fresh input after a result clears the result.
          if (key === "." && (e.cur.includes(".") || e.num !== null)) return e;
          return { ...e, cur: e.cur + key };
        });
        return;
      }

      if (key === "ft") {
        setResult(null);
        setEntry((e) => {
          if (e.cur === "" || e.feet !== null || e.num !== null) return e;
          return { ...e, feet: e.cur, cur: "" };
        });
        return;
      }

      if (key === "in") {
        setResult(null);
        setEntry((e) => {
          if (e.cur === "" || e.inches !== null || e.num !== null) return e;
          return { ...e, inches: e.cur, cur: "" };
        });
        return;
      }

      if (key === "frac") {
        setResult(null);
        setEntry((e) => {
          if (e.cur === "" || e.num !== null || e.cur.includes(".")) return e;
          return { ...e, num: e.cur, cur: "" };
        });
        return;
      }

      if (key === "back") {
        setEntry((e) => {
          if (e.cur !== "") return { ...e, cur: e.cur.slice(0, -1) };
          if (e.num !== null) return { ...e, cur: e.num, num: null };
          if (e.inches !== null) return { ...e, cur: e.inches, inches: null };
          if (e.feet !== null) return { ...e, cur: e.feet, feet: null };
          return e;
        });
        return;
      }

      if (key === "c") {
        setEntry(EMPTY);
        setResult(null);
        return;
      }

      if (key === "ac") {
        setEntry(EMPTY);
        setAcc(null);
        setPendingOp(null);
        setResult(null);
        return;
      }

      const ops: Record<string, Op> = {
        "+": "+",
        "-": "-",
        "*": "*",
        "÷": "/",
      };

      if (key in ops || key === "=") {
        try {
          let current = acc;
          const hasEntry = !entryIsEmpty(entry);

          if (hasEntry) {
            const x = entryToValue(entry);
            current =
              current !== null && pendingOp !== null
                ? applyOp(current, pendingOp, x)
                : x;
          } else if (result !== null) {
            current = result;
          }

          if (key === "=") {
            if (current === null) return;
            setResult(current);
            setAcc(current);
            setPendingOp(null);
          } else {
            setAcc(current);
            setPendingOp(current !== null ? ops[key] : null);
            setResult(null);
          }
          setEntry(EMPTY);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Error");
          setEntry(EMPTY);
          setAcc(null);
          setPendingOp(null);
          setResult(null);
        }
      }
    },
    [acc, pendingOp, entry, result, buzz]
  );

  // Physical keyboard support
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const k = ev.key;
      const map: Record<string, string> = {
        Enter: "=",
        "=": "=",
        Backspace: "back",
        Escape: "ac",
        Delete: "c",
        "+": "+",
        "-": "-",
        "*": "*",
        x: "*",
        "/": "frac",
        d: "÷",
        "'": "ft",
        f: "ft",
        '"': "in",
        i: "in",
        ".": ".",
      };
      if (/^[0-9]$/.test(k)) {
        press(k);
        ev.preventDefault();
      } else if (k in map) {
        press(map[k]);
        ev.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press]);

  const historyText =
    acc !== null && pendingOp !== null
      ? `${formatValue(acc, denom, settings.units).main} ${OP_LABEL[pendingOp]}`
      : "";

  let main: string;
  let sub: string[] = [];
  if (error) {
    main = error;
  } else if (!entryIsEmpty(entry)) {
    main = entryText(entry);
  } else if (result !== null) {
    const f = formatValue(result, denom, settings.units);
    main = f.main;
    sub = f.sub;
  } else if (acc !== null) {
    main = formatValue(acc, denom, settings.units).main;
  } else {
    main = "0";
  }

  return (
    <div>
      <div className="denom-row">
        <span>Round to:</span>
        {[8, 16, 32, 64].map((d) => (
          <button
            key={d}
            className={`denom-btn ${denom === d ? "active" : ""}`}
            onClick={() => {
              buzz();
              setDenom(d);
            }}
          >
            1/{d}
          </button>
        ))}
      </div>

      <div className="calc-display">
        <div className="calc-history">{historyText}</div>
        <div className={`calc-main ${error ? "error" : ""}`}>{main}</div>
        <div className="calc-sub">{sub.join("  ·  ")}</div>
      </div>

      <div className="calc-grid">
        <Btn label="AC" cls="danger" onPress={() => press("ac")} />
        <Btn label="C" cls="danger" onPress={() => press("c")} />
        <Btn label="⌫" onPress={() => press("back")} />
        <Btn label="÷" cls="op" onPress={() => press("÷")} />

        <Btn label="7" onPress={() => press("7")} />
        <Btn label="8" onPress={() => press("8")} />
        <Btn label="9" onPress={() => press("9")} />
        <Btn label="×" cls="op" onPress={() => press("*")} />

        <Btn label="4" onPress={() => press("4")} />
        <Btn label="5" onPress={() => press("5")} />
        <Btn label="6" onPress={() => press("6")} />
        <Btn label="−" cls="op" onPress={() => press("-")} />

        <Btn label="1" onPress={() => press("1")} />
        <Btn label="2" onPress={() => press("2")} />
        <Btn label="3" onPress={() => press("3")} />
        <Btn label="+" cls="op" onPress={() => press("+")} />

        <Btn label="0" onPress={() => press("0")} />
        <Btn label="." onPress={() => press(".")} />
        <Btn label="/" cls="op" onPress={() => press("frac")} />
        <Btn label="=" cls="equals" onPress={() => press("=")} />

        <Btn label="Ft" cls="unit span-2" onPress={() => press("ft")} />
        <Btn label="In" cls="unit span-2" onPress={() => press("in")} />
      </div>

      <p className="hint" style={{ marginTop: 12 }}>
        Enter like a Construction Master: <b>3 Ft 5 In 3 / 8</b> →{" "}
        <b>3&apos; 5-3/8&quot;</b>. Length × length gives area, area × length
        gives volume. Keyboard works too: <b>f</b>=Ft, <b>i</b>=In,{" "}
        <b>/</b>=fraction, <b>d</b>=divide.
      </p>
    </div>
  );
}

function Btn({
  label,
  cls = "",
  onPress,
}: {
  label: string;
  cls?: string;
  onPress: () => void;
}) {
  return (
    <button className={`calc-btn ${cls}`} onClick={onPress}>
      {label}
    </button>
  );
}
