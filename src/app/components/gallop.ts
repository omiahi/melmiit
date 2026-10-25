/**
 * Galloping horse and rider, from Eadweard Muybridge's photographs
 * "The Horse in Motion" (1878, public domain), traced into silhouettes.
 * The sprite sheet holds 11 frames of one full stride, white on transparent;
 * it is tinted once per colour and size, then frames are blitted.
 */

const SRC = '/brand/horse-gallop.webp';
const FRAMES = 11;
const FW = 608; // frame width in the sheet
const FH = 412; // frame height
const GROUND = 371; // row where the hooves meet the ground
const ANCHOR_X = 300; // horizontal centre of the horse's barrel
/** Top of the rider's head in each frame (sheet pixels), for attaching a banner. */
const HEADS: [number, number][] = [
  [363.5, 24], [371.3, 18], [378.8, 18], [393.7, 16], [385.4, 20], [386.8, 24],
  [390.8, 24], [384.9, 26], [380.2, 22], [368.9, 22], [381.8, 14],
];

let img: HTMLImageElement | null = null;
let ready: Promise<void> | null = null;
const tinted = new Map<string, HTMLCanvasElement>();

export function loadGallop(): Promise<void> {
  if (ready) return ready;
  ready = new Promise((resolve, reject) => {
    const i = new Image();
    i.decoding = 'async';
    i.onload = () => {
      img = i;
      resolve();
    };
    i.onerror = reject;
    i.src = SRC;
  });
  return ready;
}

function sheetFor(fill: string, scale: number) {
  const key = `${fill}@${scale}`;
  let c = tinted.get(key);
  if (c || !img) return c;
  c = document.createElement('canvas');
  c.width = Math.round(FW * FRAMES * scale);
  c.height = Math.round(FH * scale);
  const x = c.getContext('2d')!;
  x.drawImage(img, 0, 0, c.width, c.height);
  x.globalCompositeOperation = 'source-in';
  x.fillStyle = fill;
  x.fillRect(0, 0, c.width, c.height);
  tinted.set(key, c);
  return c;
}

/**
 * Draw one horseman.
 * @param x horizontal centre of the horse, in canvas units
 * @param groundY where the hooves meet the ground
 * @param height on-screen height of the whole figure
 * @param phase position in the stride, 0..1
 */
export function drawGallop(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  height: number,
  phase: number,
  fill: string,
  dpr: number,
  opts: { banner?: boolean; t?: number } = {},
) {
  if (!img) return;
  const k = height / FH; // sheet px → canvas units
  const needed = height * dpr;
  const scale = needed <= FH * 0.25 ? 0.25 : needed <= FH * 0.5 ? 0.5 : 1;
  const sheet = sheetFor(fill, scale);
  if (!sheet) return;
  const f = Math.floor((((phase % 1) + 1) % 1) * FRAMES) % FRAMES;
  const left = x - ANCHOR_X * k;
  const top = groundY - GROUND * k;
  ctx.drawImage(sheet, f * FW * scale, 0, FW * scale, FH * scale, left, top, FW * k, FH * k);

  if (opts.banner) {
    // a tug, the Mongol horse-tail standard, held upright and streaming back
    const [hx, hy] = HEADS[f];
    const t = opts.t ?? 0;
    const baseX = left + (hx - 14) * k;
    const baseY = top + (hy + 74) * k;
    const tipX = baseX - 46 * k;
    const tipY = top + (hy - 190) * k;
    ctx.save();
    ctx.strokeStyle = fill;
    ctx.fillStyle = fill;
    ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(1, 3.2 * k);
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();
    // spear-point finial
    const dx = tipX - baseX;
    const dy = tipY - baseY;
    const len = Math.hypot(dx, dy);
    const ux = dx / len;
    const uy = dy / len;
    ctx.beginPath();
    ctx.moveTo(tipX + ux * 22 * k, tipY + uy * 22 * k);
    ctx.lineTo(tipX - uy * 6 * k, tipY + ux * 6 * k);
    ctx.lineTo(tipX + uy * 6 * k, tipY - ux * 6 * k);
    ctx.closePath();
    ctx.fill();
    // horse-hair streamers tied below the point
    const sx = tipX - ux * 10 * k;
    const sy = tipY - uy * 10 * k;
    ctx.lineWidth = Math.max(0.8, 2.4 * k);
    for (let i = 0; i < 7; i++) {
      const w1 = Math.sin(t * 7 + i * 0.6) * 10 * k;
      const w2 = Math.sin(t * 7 + i * 0.6 + 1.4) * 14 * k;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.bezierCurveTo(
        sx - 40 * k,
        sy + w1 + i * 3 * k,
        sx - 90 * k,
        sy + w2 + i * 6 * k,
        sx - (130 + i * 4) * k,
        sy + w1 + (14 + i * 9) * k,
      );
      ctx.stroke();
    }
    ctx.restore();
  }
}
