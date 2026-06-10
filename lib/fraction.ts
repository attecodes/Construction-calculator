// Exact rational arithmetic for tape-measure math.
// Lengths are stored as rational inches; areas as square inches, etc.

export interface Rational {
  n: number; // numerator (carries the sign)
  d: number; // denominator (always > 0)
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

export function rat(n: number, d = 1): Rational {
  if (d === 0) throw new Error("Division by zero");
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}

export function fromDecimal(x: number): Rational {
  // Convert a user-typed decimal (limited precision) to an exact rational.
  if (Number.isInteger(x)) return rat(x);
  const s = x.toString();
  const dot = s.indexOf(".");
  const places = s.length - dot - 1;
  const denom = Math.pow(10, Math.min(places, 9));
  return rat(Math.round(x * denom), denom);
}

export const add = (a: Rational, b: Rational): Rational =>
  rat(a.n * b.d + b.n * a.d, a.d * b.d);
export const sub = (a: Rational, b: Rational): Rational =>
  rat(a.n * b.d - b.n * a.d, a.d * b.d);
export const mul = (a: Rational, b: Rational): Rational =>
  rat(a.n * b.n, a.d * b.d);
export const div = (a: Rational, b: Rational): Rational => {
  if (b.n === 0) throw new Error("Division by zero");
  return rat(a.n * b.d, a.d * b.n);
};
export const toNumber = (a: Rational): number => a.n / a.d;
export const isZero = (a: Rational): boolean => a.n === 0;

/**
 * Parse a length string into rational inches. Accepted forms:
 *   3' 5-3/8"   3 ft 5 3/8 in   5-3/8   41 3/4   7/16   2.5'   38.25
 * Bare numbers (no ' or ") are treated as inches.
 */
export function parseLength(input: string): Rational | null {
  let s = input.trim().toLowerCase();
  if (!s) return null;
  s = s
    .replace(/feet|foot|ft\.?/g, "'")
    .replace(/inches|inch|in\.?/g, '"')
    .replace(/[″”]/g, '"')
    .replace(/[′’]/g, "'");

  let sign = 1;
  if (s.startsWith("-")) {
    sign = -1;
    s = s.slice(1).trim();
  }

  let total = rat(0);
  let matched = false;

  // Feet part: number (decimal ok) followed by '
  const ftMatch = s.match(/^(\d+(?:\.\d+)?)\s*'/);
  if (ftMatch) {
    total = add(total, mul(fromDecimal(parseFloat(ftMatch[1])), rat(12)));
    s = s.slice(ftMatch[0].length).trim();
    matched = true;
  }

  s = s.replace(/^[-,]\s*/, "");

  // Inch part: whole and/or fraction, optional trailing "
  // e.g. 5-3/8  5 3/8  3/8  5  5.25
  const inMatch = s.match(
    /^(?:(\d+(?:\.\d+)?)(?:[\s-]+(\d+)\s*\/\s*(\d+))?|(\d+)\s*\/\s*(\d+))\s*"?\s*$/
  );
  if (inMatch) {
    if (inMatch[4] !== undefined) {
      total = add(total, rat(parseInt(inMatch[4]), parseInt(inMatch[5])));
    } else {
      total = add(total, fromDecimal(parseFloat(inMatch[1])));
      if (inMatch[2] !== undefined) {
        total = add(total, rat(parseInt(inMatch[2]), parseInt(inMatch[3])));
      }
    }
    matched = true;
  } else if (s !== "") {
    return null; // leftover text we couldn't parse
  }

  if (!matched) return null;
  return mul(total, rat(sign));
}

export interface FormattedLength {
  /** e.g.  3' 5-3/8"  */
  text: string;
  /** true if the value was rounded to the denominator */
  rounded: boolean;
}

/** How to display lengths: feet-and-inches, or total inches only. */
export type LengthStyle = "ftin" | "in";

/**
 * Format rational inches as feet-inches-fraction (or total inches when
 * style is "in"), rounded to the nearest 1/`denom` (default 16).
 */
export function formatLength(
  len: Rational,
  denom = 16,
  style: LengthStyle = "ftin"
): FormattedLength {
  const sign = len.n < 0 ? "-" : "";
  const totalSixteenthsExact = Math.abs(toNumber(len)) * denom;
  const sixteenths = Math.round(totalSixteenthsExact);
  const rounded = Math.abs(totalSixteenthsExact - sixteenths) > 1e-9;

  const feet =
    style === "in" ? 0 : Math.floor(sixteenths / (12 * denom));
  let rem = sixteenths - feet * 12 * denom;
  const whole = Math.floor(rem / denom);
  let num = rem - whole * denom;
  let d = denom;
  if (num > 0) {
    const g = gcd(num, d);
    num /= g;
    d /= g;
  }

  let inchPart: string;
  if (num > 0 && whole > 0) inchPart = `${whole}-${num}/${d}"`;
  else if (num > 0) inchPart = `${num}/${d}"`;
  else inchPart = `${whole}"`;

  const text =
    feet > 0 ? `${sign}${feet}' ${inchPart}` : `${sign}${inchPart}`;
  return { text, rounded };
}

/** Format a dimensionless rational, preferring a simple fraction. */
export function formatScalar(v: Rational): string {
  if (v.d === 1) return v.n.toString();
  if (v.d <= 64) {
    const sign = v.n < 0 ? "-" : "";
    const n = Math.abs(v.n);
    const whole = Math.floor(n / v.d);
    const num = n - whole * v.d;
    return whole > 0 ? `${sign}${whole} ${num}/${v.d}` : `${sign}${num}/${v.d}`;
  }
  return trimNumber(toNumber(v));
}

export function trimNumber(x: number, places = 4): string {
  return parseFloat(x.toFixed(places)).toString();
}
