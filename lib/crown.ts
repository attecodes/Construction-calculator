// Crown molding flat-cut (laid flat on the saw) miter & bevel angles.
//
//   miter = arctan( sin(spring) / tan(corner / 2) )
//   bevel = arcsin( cos(spring) * cos(corner / 2) )
//
// spring = angle between the back of the crown and the wall.
// corner = wall angle (90 for a square inside/outside corner).

export interface CrownResult {
  miter: number;
  bevel: number;
}

export function calcCrown(springDeg: number, cornerDeg: number): CrownResult {
  const s = (springDeg * Math.PI) / 180;
  const half = ((cornerDeg / 2) * Math.PI) / 180;
  const miter = Math.atan(Math.sin(s) / Math.tan(half));
  const bevel = Math.asin(Math.cos(s) * Math.cos(half));
  return {
    miter: (miter * 180) / Math.PI,
    bevel: (bevel * 180) / Math.PI,
  };
}
