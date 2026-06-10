// Baluster / spindle layout: evenly space balusters in an opening so no
// gap exceeds the code maximum (4" sphere rule -> default max gap 3-7/8").

import { Rational, rat, toNumber, formatLength, LengthStyle } from "./fraction";

export interface BalusterResult {
  count: number;
  /** clear gap between balusters (and at each end), inches */
  gap: number;
  /** on-center spacing, inches */
  onCenter: number;
  /** distance from the left end of the opening to each baluster centerline */
  centers: string[];
  /** distance from the left end to the near edge of each baluster */
  edges: string[];
  gapText: string;
  onCenterText: string;
}

export function layoutBalusters(
  opening: Rational,
  balusterWidth: Rational,
  maxGap: Rational,
  style: LengthStyle = "ftin"
): BalusterResult | { error: string } {
  const L = toNumber(opening);
  const w = toNumber(balusterWidth);
  const g = toNumber(maxGap);

  if (L <= 0) return { error: "Opening must be greater than zero." };
  if (w <= 0) return { error: "Baluster width must be greater than zero." };
  if (g <= 0) return { error: "Max gap must be greater than zero." };
  if (L <= g) {
    return {
      count: 0,
      gap: L,
      onCenter: 0,
      centers: [],
      edges: [],
      gapText: formatLength(opening, 16, style).text,
      onCenterText: "—",
    };
  }

  // n balusters create n+1 equal gaps: gap = (L - n*w) / (n+1) <= maxGap
  const n = Math.max(1, Math.ceil((L - g) / (w + g)));
  const gap = (L - n * w) / (n + 1);
  if (gap < 0) {
    return { error: "Balusters don't fit: opening is too small for that width." };
  }
  const onCenter = gap + w;

  const centers: string[] = [];
  const edges: string[] = [];
  for (let i = 1; i <= n; i++) {
    const edge = i * gap + (i - 1) * w;
    centers.push(fmt(edge + w / 2, style));
    edges.push(fmt(edge, style));
  }

  return {
    count: n,
    gap,
    onCenter,
    centers,
    edges,
    gapText: fmt(gap, style),
    onCenterText: fmt(onCenter, style),
  };
}

function fmt(inches: number, style: LengthStyle): string {
  return formatLength(rat(Math.round(inches * 16), 16), 16, style).text;
}
