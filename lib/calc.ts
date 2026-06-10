// Unit-aware calculator engine, Construction Master style.
// A value carries a dimension: 0 = plain number, 1 = length (inches),
// 2 = area (sq inches), 3 = volume (cu inches).

import {
  Rational,
  rat,
  add,
  sub,
  mul,
  div,
  toNumber,
  formatLength,
  formatScalar,
  trimNumber,
  LengthStyle,
} from "./fraction";

export interface CalcValue {
  v: Rational; // magnitude in inches^dim
  dim: number;
}

export type Op = "+" | "-" | "*" | "/";

export function applyOp(a: CalcValue, op: Op, b: CalcValue): CalcValue {
  switch (op) {
    case "+":
    case "-": {
      // Adding a bare number to a length treats the number as inches.
      const dim = Math.max(a.dim, b.dim);
      if (a.dim !== b.dim && a.dim !== 0 && b.dim !== 0) {
        throw new Error("Can't mix units (e.g. length + area)");
      }
      const fn = op === "+" ? add : sub;
      return { v: fn(a.v, b.v), dim };
    }
    case "*": {
      const dim = a.dim + b.dim;
      if (dim > 3) throw new Error("Result beyond cubic units");
      return { v: mul(a.v, b.v), dim };
    }
    case "/": {
      const dim = a.dim - b.dim;
      if (dim < 0) throw new Error("Can't divide by a larger unit");
      return { v: div(a.v, b.v), dim };
    }
  }
}

export interface DisplayLines {
  main: string;
  sub: string[];
}

export function formatValue(
  val: CalcValue,
  denom = 16,
  style: LengthStyle = "ftin"
): DisplayLines {
  const x = toNumber(val.v);
  switch (val.dim) {
    case 0:
      return { main: formatScalar(val.v), sub: dualScalar(val.v) };
    case 1: {
      const f = formatLength(val.v, denom, style);
      const alt = formatLength(val.v, denom, style === "in" ? "ftin" : "in");
      const sub = [
        `${trimNumber(x)} in`,
        `${trimNumber(x / 12)} ft`,
        `${trimNumber(x * 25.4, 1)} mm`,
      ];
      if (alt.text !== f.text) sub.unshift(alt.text);
      if (f.rounded) sub.unshift(`rounded to nearest 1/${denom}"`);
      return { main: f.text, sub };
    }
    case 2:
      return {
        main: `${trimNumber(x / 144)} sq ft`,
        sub: [`${trimNumber(x)} sq in`, `${trimNumber(x / 144 / 9)} sq yd`],
      };
    case 3:
      return {
        main: `${trimNumber(x / 1728)} cu ft`,
        sub: [`${trimNumber(x / 1728 / 27)} cu yd`, `${trimNumber(x)} cu in`],
      };
    default:
      return { main: trimNumber(x), sub: [] };
  }
}

function dualScalar(v: Rational): string[] {
  if (v.d === 1) return [];
  return [trimNumber(toNumber(v))];
}

export const ZERO: CalcValue = { v: rat(0), dim: 0 };
