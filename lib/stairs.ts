// Stair stringer math: total rise -> riser count & height, run, stringer
// length, and angle. IRC residential limits: riser <= 7-3/4", tread >= 10".

import { Rational, rat, toNumber, formatLength } from "./fraction";

export interface StairResult {
  risers: number;
  riserHeight: number;
  riserHeightText: string;
  treads: number;
  treadDepthText: string;
  totalRun: number;
  totalRunText: string;
  stringerLength: number;
  stringerLengthText: string;
  angleDeg: number;
  /** 2R + T comfort check value */
  comfort: number;
  warnings: string[];
}

export function calcStairs(
  totalRise: Rational,
  treadDepth: Rational,
  maxRiser: Rational
): StairResult | { error: string } {
  const rise = toNumber(totalRise);
  const tread = toNumber(treadDepth);
  const max = toNumber(maxRiser);

  if (rise <= 0) return { error: "Total rise must be greater than zero." };
  if (tread <= 0) return { error: "Tread depth must be greater than zero." };
  if (max <= 0) return { error: "Max riser must be greater than zero." };

  const risers = Math.max(1, Math.ceil(rise / max));
  const riserHeight = rise / risers;
  const treads = Math.max(0, risers - 1);
  const totalRun = treads * tread;
  const stringerLength = Math.sqrt(rise * rise + totalRun * totalRun);
  const angleDeg =
    totalRun > 0 ? (Math.atan(rise / totalRun) * 180) / Math.PI : 90;
  const comfort = 2 * riserHeight + tread;

  const warnings: string[] = [];
  if (riserHeight > 7.75)
    warnings.push("Riser exceeds IRC max of 7-3/4\".");
  if (riserHeight < 4) warnings.push("Riser under 4\" — unusually shallow.");
  if (tread < 10) warnings.push("Tread under IRC min of 10\".");
  if (comfort < 24 || comfort > 26)
    warnings.push(
      `Comfort check 2R+T = ${comfort.toFixed(1)}" (ideal 24–25").`
    );

  return {
    risers,
    riserHeight,
    riserHeightText: fmt(riserHeight),
    treads,
    treadDepthText: fmt(tread),
    totalRun,
    totalRunText: fmt(totalRun),
    stringerLength,
    stringerLengthText: fmt(stringerLength),
    angleDeg,
    comfort,
    warnings,
  };
}

function fmt(inches: number): string {
  return formatLength(rat(Math.round(inches * 16), 16)).text;
}
