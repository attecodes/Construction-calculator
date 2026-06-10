// Quick sanity checks for the math libraries. Run: npx tsx lib/__sanity__.ts
import { parseLength, formatLength, rat, add, toNumber } from "./fraction";
import { applyOp, formatValue } from "./calc";
import { layoutBalusters } from "./baluster";
import { calcStairs } from "./stairs";
import { calcCrown } from "./crown";

let failures = 0;
function check(name: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) {
    failures++;
    console.error(`FAIL ${name}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
  } else {
    console.log(`ok   ${name}`);
  }
}

// --- parsing ---
check("parse 3' 5-3/8\"", toNumber(parseLength(`3' 5-3/8"`)!), 41.375);
check("parse 41 3/4", toNumber(parseLength("41 3/4")!), 41.75);
check("parse 7/16", toNumber(parseLength("7/16")!), 0.4375);
check("parse 2.5'", toNumber(parseLength("2.5'")!), 30);
check("parse 5 ft 3 in", toNumber(parseLength("5 ft 3 in")!), 63);
check("parse -1/2", toNumber(parseLength("-1/2")!), -0.5);
check("parse garbage", parseLength("abc"), null);

// --- formatting ---
check("format 41.375", formatLength(rat(331, 8)).text, `3' 5-3/8"`);
check("format 0.5", formatLength(rat(1, 2)).text, `1/2"`);
check("format 24", formatLength(rat(24)).text, `2' 0"`);
check("format rounds", formatLength(rat(1, 3)).text, `5/16"`);

// --- inches-only display style ---
check("format 41.375 in-only", formatLength(rat(331, 8), 16, "in").text, `41-3/8"`);
check("format 24 in-only", formatLength(rat(24), 16, "in").text, `24"`);
check(
  "calc in-only",
  formatValue({ v: rat(331, 8), dim: 1 }, 16, "in").main,
  `41-3/8"`
);

// --- calculator math ---
const a = { v: parseLength(`5-3/8`)!, dim: 1 };
const b = { v: parseLength(`3/4`)!, dim: 1 };
check(
  "5-3/8 + 3/4 = 6-1/8",
  formatValue(applyOp(a, "+", b)).main,
  `6-1/8"`
);
const len = { v: parseLength(`6'`)!, dim: 1 };
const len2 = { v: parseLength(`4'`)!, dim: 1 };
check("6' x 4' = 24 sq ft", formatValue(applyOp(len, "*", len2)).main, "24 sq ft");
const three = { v: rat(3), dim: 0 };
check(
  "6' / 3 = 2'",
  formatValue(applyOp(len, "/", three)).main,
  `2' 0"`
);

// --- balusters: 72" opening, 1.5" balusters, 3.875 max gap ---
const bal = layoutBalusters(rat(72), rat(3, 2), rat(31, 8));
if ("error" in bal) {
  failures++;
  console.error("FAIL baluster: unexpected error", bal.error);
} else {
  // n = ceil((72-3.875)/(1.5+3.875)) = ceil(12.67) = 13
  check("baluster count", bal.count, 13);
  const gapOk = bal.gap <= 3.875 + 1e-9;
  check("baluster gap <= max", gapOk, true);
  // total = (n+1)*gap + n*w should equal 72
  const total = (bal.count + 1) * bal.gap + bal.count * 1.5;
  check("baluster total", Math.abs(total - 72) < 1e-9, true);
}

// --- stairs: 105" rise ---
const st = calcStairs(rat(105), rat(10), rat(31, 4));
if ("error" in st) {
  failures++;
  console.error("FAIL stairs: unexpected error", st.error);
} else {
  check("stairs risers", st.risers, 14); // ceil(105/7.75)=14
  check("stairs riser height", st.riserHeight, 7.5);
  check("stairs treads", st.treads, 13);
  check("stairs run", st.totalRun, 130);
}

// --- crown: 38 spring, 90 corner -> 31.62 / 33.86 ---
const cr = calcCrown(38, 90);
check("crown miter", cr.miter.toFixed(2), "31.62");
check("crown bevel", cr.bevel.toFixed(2), "33.86");
const cr45 = calcCrown(45, 90);
check("crown45 miter", cr45.miter.toFixed(2), "35.26");
check("crown45 bevel", cr45.bevel.toFixed(2), "30.00");

if (failures) {
  console.error(`\n${failures} failure(s)`);
  process.exit(1);
}
console.log("\nAll checks passed");
