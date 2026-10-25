/**
 * Procedural galloping horse (with optional Mongol rider) drawn as a silhouette on canvas.
 * Units: body length ≈ 1.25. drawHorse() takes the ground point under the barrel; y grows downward.
 */

export interface HorseStyle {
  fill: string;
  rider?: boolean;
  banner?: boolean; // rider carries a tug, the horse-tail standard
}

type P = [number, number];
const TAU = Math.PI * 2;

const add = (a: P, b: P): P => [a[0] + b[0], a[1] + b[1]];
const mul = (a: P, k: number): P => [a[0] * k, a[1] * k];
const dir = (ang: number): P => [Math.cos(ang), Math.sin(ang)];

// Transverse gallop footfall order: far hind, near hind, far fore, near fore
const LEGS = [
  { fore: false, at: [-0.5, -0.04] as P, off: 0.0, far: true },
  { fore: false, at: [-0.46, -0.02] as P, off: 0.1, far: false },
  { fore: true, at: [0.37, 0.06] as P, off: 0.36, far: true },
  { fore: true, at: [0.41, 0.08] as P, off: 0.46, far: false },
];

/** Angles from vertical (positive = forward) for the three leg segments. */
function legPose(fore: boolean, p: number): [number, number, number] {
  const a = p * TAU;
  const s = Math.sin(a);
  // fold is highest while the leg swings forward (recovery)
  const fold = Math.max(0, Math.sin(a + 1.35)) ** 2;
  const load = Math.max(0, -Math.sin(a + 1.35)); // weight on the leg
  if (fore) {
    const forearm = 0.12 + 0.78 * s;
    const cannon = forearm - 1.9 * fold + 0.05;
    const pastern = cannon + 0.55 * load - 0.6 * fold + 0.35;
    return [forearm, cannon, pastern];
  }
  const gaskin = -0.42 + 0.72 * s;
  const cannon = gaskin + 0.5 + 1.0 * fold;
  const pastern = cannon + 0.5 * load + 0.4 - 0.9 * fold;
  return [gaskin, cannon, pastern];
}

function segment(ctx: CanvasRenderingContext2D, from: P, ang: number, len: number, w0: number, w1: number): P {
  const d: P = [Math.sin(ang), Math.cos(ang)];
  const n: P = [d[1], -d[0]];
  const to = add(from, mul(d, len));
  ctx.beginPath();
  ctx.moveTo(from[0] + n[0] * w0, from[1] + n[1] * w0);
  ctx.lineTo(to[0] + n[0] * w1, to[1] + n[1] * w1);
  ctx.arc(to[0], to[1], w1, Math.atan2(n[1], n[0]), Math.atan2(-n[1], -n[0]), false);
  ctx.lineTo(from[0] - n[0] * w0, from[1] - n[1] * w0);
  ctx.arc(from[0], from[1], w0, Math.atan2(-n[1], -n[0]), Math.atan2(n[1], n[0]), false);
  ctx.closePath();
  ctx.fill();
  return to;
}

function leg(ctx: CanvasRenderingContext2D, fore: boolean, at: P, p: number, k: number) {
  const [u, c, pa] = legPose(fore, p);
  let pt: P;
  if (fore) {
    pt = segment(ctx, at, u, 0.3, 0.085 * k, 0.04 * k);
    pt = segment(ctx, pt, c, 0.23, 0.036 * k, 0.03 * k);
    pt = segment(ctx, pt, pa, 0.07, 0.028 * k, 0.024 * k);
  } else {
    pt = segment(ctx, at, u, 0.33, 0.13 * k, 0.042 * k);
    pt = segment(ctx, pt, c, 0.27, 0.036 * k, 0.03 * k);
    pt = segment(ctx, pt, pa, 0.07, 0.028 * k, 0.024 * k);
  }
  // hoof
  const d: P = [Math.sin(pa), Math.cos(pa)];
  ctx.beginPath();
  ctx.ellipse(pt[0] + d[0] * 0.015, pt[1] + d[1] * 0.015, 0.03, 0.02, Math.atan2(d[1], d[0]) + Math.PI / 2, 0, TAU);
  ctx.fill();
}

export function drawHorse(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  scale: number,
  phase: number,
  t: number,
  style: HorseStyle,
) {
  const a = phase * TAU;
  const bob = -0.05 * Math.sin(2 * a + 0.9);
  const pitch = 0.055 * Math.sin(a + 2.4);

  ctx.save();
  ctx.translate(x, groundY);
  ctx.scale(scale, scale);
  ctx.translate(0, -0.66 + bob);
  ctx.rotate(pitch);
  ctx.fillStyle = style.fill;
  ctx.strokeStyle = style.fill;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const L of LEGS) if (L.far) leg(ctx, L.fore, L.at, (phase + L.off) % 1, 0.92);

  // Tail, streaming
  const tw = Math.sin(t * 8 + a) * 0.05;
  for (const [w, dy, k] of [
    [0.075, 0, 1],
    [0.04, 0.05, -1],
    [0.025, -0.04, 0.6],
  ] as const) {
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(-0.6, -0.22);
    ctx.bezierCurveTo(-0.8, -0.3 + tw * k + dy, -0.98, -0.18 - tw * k + dy, -1.16, -0.08 + tw * 1.4 * k + dy);
    ctx.stroke();
  }

  // Barrel, quarters and chest
  ctx.beginPath();
  ctx.moveTo(0.28, -0.3); // withers
  ctx.bezierCurveTo(0.12, -0.25, -0.05, -0.24, -0.24, -0.26); // back
  ctx.bezierCurveTo(-0.38, -0.31, -0.52, -0.31, -0.63, -0.22); // loin, croup
  ctx.bezierCurveTo(-0.72, -0.12, -0.7, 0.02, -0.6, 0.08); // buttock
  ctx.bezierCurveTo(-0.52, 0.13, -0.42, 0.12, -0.34, 0.12); // stifle, flank
  ctx.bezierCurveTo(-0.1, 0.18, 0.18, 0.2, 0.36, 0.15); // belly, girth
  ctx.bezierCurveTo(0.52, 0.11, 0.6, 0.0, 0.58, -0.1); // chest
  ctx.lineTo(0.5, -0.2);
  ctx.closePath();
  ctx.fill();

  // Neck stretched forward; head nods with the stride
  const nod = 0.11 * Math.sin(a + 0.5);
  const thn = -0.62 + nod; // neck angle from horizontal (negative = up)
  const nd = dir(thn);
  const np: P = [-nd[1], nd[0]];
  const base: P = [0.4, -0.18];
  const poll = add(add(base, mul(nd, 0.52)), mul(np, -0.075));
  const throat = add(add(base, mul(nd, 0.46)), mul(np, 0.1));
  ctx.beginPath();
  ctx.moveTo(0.22, -0.3);
  ctx.bezierCurveTo(0.34, -0.36, ...add(base, add(mul(nd, 0.3), mul(np, -0.12))), ...poll);
  ctx.lineTo(...throat);
  ctx.bezierCurveTo(...add(base, add(mul(nd, 0.3), mul(np, 0.1))), 0.6, -0.06, 0.58, -0.04);
  ctx.closePath();
  ctx.fill();

  // Mane flying back off the crest
  ctx.lineWidth = 0.016;
  for (let i = 0; i < 6; i++) {
    const m = add(add(base, mul(nd, 0.1 + i * 0.08)), mul(np, -0.09));
    const f = Math.sin(t * 10 + i * 0.9) * 0.025;
    ctx.beginPath();
    ctx.moveTo(...m);
    ctx.quadraticCurveTo(m[0] - 0.08, m[1] - 0.03 + f, m[0] - 0.15, m[1] + 0.01 + f);
    ctx.stroke();
  }

  // Head
  const thh = thn + 1.2;
  const hd = dir(thh);
  const hp: P = [-hd[1], hd[0]];
  const hb = mul(add(poll, throat), 0.5);
  const nose = add(hb, mul(hd, 0.33));
  ctx.beginPath();
  ctx.moveTo(...poll);
  ctx.bezierCurveTo(...add(hb, add(mul(hd, 0.13), mul(hp, -0.095))), ...add(nose, mul(hp, -0.05)), ...add(nose, mul(hp, -0.045)));
  ctx.quadraticCurveTo(...add(nose, add(mul(hd, 0.05), mul(hp, 0.0))), ...add(nose, mul(hp, 0.04)));
  ctx.bezierCurveTo(...add(hb, add(mul(hd, 0.25), mul(hp, 0.06))), ...add(hb, add(mul(hd, 0.05), mul(hp, 0.12))), ...throat);
  ctx.closePath();
  ctx.fill();
  // ears
  ctx.beginPath();
  const ear = add(poll, mul(hd, 0.02));
  ctx.moveTo(...ear);
  ctx.lineTo(...add(ear, add(mul(hd, -0.06), mul(hp, -0.11))));
  ctx.lineTo(...add(ear, mul(hd, 0.06)));
  ctx.closePath();
  ctx.fill();

  for (const L of LEGS) if (!L.far) leg(ctx, L.fore, L.at, (phase + L.off) % 1, 1);

  if (style.rider) drawRider(ctx, a, t, !!style.banner);
  ctx.restore();
}

function drawRider(ctx: CanvasRenderingContext2D, a: number, t: number, banner: boolean) {
  // Up in short stirrups, leaning into the gallop
  const sway = 0.035 * Math.sin(a * 2 + 1.2);
  ctx.save();
  ctx.translate(0.02, -0.3);
  ctx.rotate(0.38 + sway);

  // thigh and boot
  ctx.lineWidth = 0.075;
  ctx.beginPath();
  ctx.moveTo(-0.03, -0.1);
  ctx.lineTo(0.1, 0.06);
  ctx.lineTo(0.03, 0.2);
  ctx.stroke();
  // deel, flaring at the hem
  ctx.beginPath();
  ctx.moveTo(-0.16, 0.0);
  ctx.bezierCurveTo(-0.14, -0.2, -0.08, -0.38, -0.01, -0.46);
  ctx.lineTo(0.08, -0.45);
  ctx.bezierCurveTo(0.1, -0.3, 0.11, -0.14, 0.12, -0.02);
  ctx.closePath();
  ctx.fill();
  // head and hat with upturned brim and peak
  ctx.beginPath();
  ctx.arc(0.04, -0.53, 0.06, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-0.05, -0.55);
  ctx.quadraticCurveTo(0.03, -0.6, 0.13, -0.56);
  ctx.lineTo(0.05, -0.68);
  ctx.closePath();
  ctx.fill();
  // arm to the reins
  ctx.lineWidth = 0.045;
  ctx.beginPath();
  ctx.moveTo(0.05, -0.4);
  ctx.quadraticCurveTo(0.2, -0.33, 0.29, -0.22);
  ctx.stroke();
  // reins to the bit
  ctx.lineWidth = 0.008;
  ctx.beginPath();
  ctx.moveTo(0.29, -0.22);
  ctx.lineTo(0.62, -0.1);
  ctx.stroke();

  if (banner) {
    ctx.save();
    ctx.translate(0.0, -0.36);
    ctx.rotate(-0.62 - sway);
    ctx.lineWidth = 0.018;
    ctx.beginPath();
    ctx.moveTo(0, 0.25);
    ctx.lineTo(0, -1.0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-0.022, -0.98);
    ctx.lineTo(0, -1.1);
    ctx.lineTo(0.022, -0.98);
    ctx.closePath();
    ctx.fill();
    for (let i = 0; i < 6; i++) {
      const f1 = Math.sin(t * 6 + i * 0.6) * 0.05;
      const f2 = Math.sin(t * 6 + i * 0.6 + 1.5) * 0.07;
      ctx.lineWidth = 0.014;
      ctx.beginPath();
      ctx.moveTo(0, -0.94);
      ctx.bezierCurveTo(-0.12 + f1, -0.95, -0.3, -0.92 + f2 + i * 0.02, -0.5 - i * 0.02, -0.86 + i * 0.035 + f1);
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();
}
